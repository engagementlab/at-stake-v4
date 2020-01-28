/* eslint-disable no-underscore-dangle */
/**
 * @Stake v4
 * Developed by Engagement Lab, 2016-2017
 * ==============
 * Common functionality game controller
 *
 * @class lib/games
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */

const coreModule = require('learning-games-core');
const TemplateLoader = require('./TemplateLoader');

const {
  Core,
} = coreModule;

class Common extends Core {
  constructor() {
    super();

    this.Templates = null;
    this.Session = coreModule.SessionManager;

    this.events = require('events');
    this.eventEmitter = new this.events.EventEmitter();

    this.groupSocket = null;

    this.deck_data = {};
    this._active_deck_roles = {};
    this._active_deck_facilitator = {};
    this.game_events = {};

    this._currentPlayerIndex = 0;
    this._game_session = null;
    this._game_timeout = null;
    this._player_timeout;
    this._player_timeout_time_left = 0;

    this._current_submissions = {};
    this._players_submitted = [];

    this._countdown;
    this._countdown_duration = 0;
    this._countdown_paused = false;
    this._event_countdown_done;
    this._current_round = 0;
    this._current_winner = null;
    this._active_player_index = 0;
    this._player_icon_index = 0;

    // Time purchase queue for deliberation stage
    this._deliberate_time_queue = [];

    // Decider's username
    this._current_decider;

    // Stores last event sent and its data
    this._objLastTemplate;
    this._strLastEventId;

    this.currentPlayerCap;
    this.assignedRoleIndices = [];

    // Identifies targets for socket events
    this.players_id;
    this.keystone = require('keystone');
  }

  Initialize(gameSession, callback) {
    super.Initialize(gameSession, require('keystone'), null, () => {
      const Deck = this.keystone.list('Deck').model;
      const Role = this.keystone.list('Role').model;
      const Event = this.keystone.list('Event').model;

      this.assignedRoleIndices = [];

      this._countdown_paused = false;
      this._player_timeout_duration = 60000;

      // Init session
      this._game_session = gameSession;

      // Init template loader with current game type
      this.Templates = new TemplateLoader(gameSession.gameType);

      // Identify targets for socket events
      this.players_id = gameSession.accessCode;
      // Override: players_id and group are same for @Stake (decider-only filtered by client)
      this.group_id = this.players_id;

      const queryDeck = Deck.findById(gameSession.deckId).populate('roles').exec();
      const queryFacilitator = Role.findOne({
        isFacilitator: true,
      }).exec();
      const queryEvent = Event.find({}).exec();

      // Get data about this session's deck
      require('bluebird').props({
          deck: queryDeck,
          facilitator: queryFacilitator,
          events: queryEvent,
        })
        .then((results) => {
          this.deck_data = results.deck;
          this._active_deck_roles = results.deck.roles;
          this._active_deck_facilitator = results.facilitator;
          this.game_events = results.events;

          console.log('roles ===> ', results.facilitator);

          callback();
        }).catch((err) => {
          logger.error(err);
        });
    });
  }

  /**
   * @override
   */
  Reset() {
    super.Reset();

    this.assignedRoleIndices = [];
    this._deliberate_time_queue = [];
  }

  /**
   * @override
   */
  EndGame(socket) {
    this.End(socket, true);
  }

  GetConfig() {
    return this._config;
  }

  // Get all players
  async GetAllPlayers() {
    const players = await this.Redis.GetHashAll(this._game_session.accessCode);
    return players;
  }

  // Get active players (all non-deciders)
  async GetActivePlayers() {
    const allPlayers = await this.GetAllPlayers();
    const players = _.filter(allPlayers, (val) => val.connected && !val.decider);

    return players;
  }

  // Get disconnected players
  async GetDisconnectedPlayers() {
    const allPlayers = await this.GetAllPlayers();
    const players = _.pick(allPlayers, (val) => (val.connected === false));

    return players;
  }

  // Get active player (it's their turn)
  async GetActivePlayerData() {
    const players = await this.GetActivePlayers();
    const uids = Object.keys(players);

    return players[uids[this._active_player_index]];
  }

  // Get if player w/ provided uid is decider
  IsDecider(uid) {
    if (!this._current_players[uid]) return false;

    return this._current_players[uid].decider;
  }

  async AssignRoleToPlayer(player, isDecider) {
    const playerObj = await this.Redis.GetHash(this._game_session.accessCode, player.uid);

    // Is decider (ensure falsey is false)?
    if (!isDecider) playerObj.decider = false;
    else {
      // Player is decider; no role this turn
      this._current_decider = player;
      playerObj.decider = true;
      playerObj.role = this._active_deck_facilitator;

      // Cache updated player
      await this.Redis.SetHash(this._game_session.accessCode, player.uid, playerObj);

      return;
    }

    let availableRoleIndices = _.range(0, this._active_deck_roles.length);

    // Remove previously assigned roles, if applicable and those assigned to others
    let unavaiable = this.assignedRoleIndices;
    if (!playerObj.prior_roles) {
      unavaiable = _.union(playerObj.prior_roles, this.assignedRoleIndices);
    }

    // Remove used indices
    availableRoleIndices = _.difference(availableRoleIndices, unavaiable);

    // Assign random role
    const roleIndex = availableRoleIndices[_.random(0, availableRoleIndices.length - 1)];
    const newRole = this._active_deck_roles[roleIndex];

    // Assign role to player object
    if (playerObj) {
      if (!newRole) throw new Error(`Unable to assign role for player ${playerObj.uid}`);

      playerObj.role = newRole;

      // Track prior roles so not assigned again
      if (!playerObj.prior_roles) playerObj.prior_roles = [roleIndex];
      else playerObj.prior_roles.push(roleIndex);

      // Cache updated player
      await this.Redis.SetHash(this._game_session.accessCode, player.uid, playerObj);

      this.assignedRoleIndices.push(roleIndex);
    }

    // Replace cached object
    this._current_players[player.uid] = playerObj;
  }

  /**
   * Begin the game's tutorial.
   *
   * @class lib/games/Common
   */
  StartTutorial(socket) {
    this.Templates.Load('partials/group/tutorial', undefined, (html) => {
      socket.to(this.players_id).emit('game:tutorial', html);
    });
  }

  /**
   * @override
   */
  IsFull() {
    return (Object.keys(this._current_players).length === this.GetConfig().playerCountRangeMax);
  }

  /**
   * @override
   */
  ModeratorJoin(socket, player) {
    // Setup group socket (used for some methods dispatched from emitter)
    this.groupSocket = socket;

    super.ModeratorJoin(socket);
    this._game_in_session = true;

    this.PlayerReady(player, socket, true);
  }

  /**
   * @override
   */
  async PlayerReady(player, socket, assignDecider) {
    const playerRejoining = await this.GetPlayerByUserId(player.uid);
    const isDecider = this.IsDecider(player.uid) || (assignDecider === true);

    // Was player disconnected?
    let wasDisconnected = false;
    if (playerRejoining) wasDisconnected = !playerRejoining.connected;

    // Invoke common method, which also updates player cache and returns update
    const updatedPlayer = await super.PlayerReady(playerRejoining || player, socket);

    // Get any disconnected players and then if all players are active
    const disconnectedPlayers = await this.GetDisconnectedPlayers();
    const allPlayersActive = _.isEmpty(disconnectedPlayers);

    if (updatedPlayer && wasDisconnected) {
      const reconnectInfo = {};
      if (this._countdown_paused) {
        // Resume any current timers
        this._countdown_paused = false;

        // Tell player where to resume current timer
        reconnectInfo.resume_duration = this._countdown_duration;
      }

      const {
        role,
      } = updatedPlayer;

      // Is decider?
      reconnectInfo.is_decider = isDecider;

      reconnectInfo.disconnected_players = _.pluck(disconnectedPlayers, 'username');
      reconnectInfo.timeout_remaining = this._player_timeout_time_left;
      reconnectInfo.role = role;

      // Set client to reconnected state
      if (isDecider) this._current_decider = player;

      socket.emit('player:reconnected', reconnectInfo);

      // Dispatch event for reconnection
      this.eventEmitter.emit('playerReconnected', {
        player: updatedPlayer,
      });

      if (allPlayersActive) clearTimeout(this._player_timeout);
    } else this.AssignRoleToPlayer(player, isDecider);

    const allPlayers = await this.GetAllPlayers();
    const data = {
      players: _.sortBy(allPlayers, (thisPlayer) => thisPlayer.index),
      disconnected_players: _.pluck(disconnectedPlayers, 'username'),
      state: (playerRejoining ? 'player_rejoined' : 'gained_player'),
      all_connected: allPlayersActive,
      timeout_remaining: this._player_timeout_time_left,
    };

    socket.to(this.group_id).emit('players:update', data);

    this._player_icon_index += 1;
  }

  /**
   * @override
   */
  async PlayerLost(playerSocketId, socket) {
    const thisPlayer = await this.GetPlayerById(playerSocketId);

    if (!thisPlayer) return;

    thisPlayer.connected = false;

    // Update player in redis store
    this.Redis.SetHash(this._game_session.accessCode, thisPlayer.uid, thisPlayer);

    // If game is currently in session...
    if (this._game_in_session) {
      // Get all currently disconnected players
      const missingPlayers = _.pluck(this.GetDisconnectedPlayers(), 'username');

      // Don't remove, just tell everyone they left
      socket.to(this.players_id).emit('player:lost', {
        names: missingPlayers,
        timeout: this._config.timeTimeoutPlayer,
      });
    }

    // ...otherwise, kick 'em out now
    else this.PlayerRemove(thisPlayer);
  }

  /**
   * @override
   */
  PlayerRemove(player) {
    // super.PlayerRemove(player);

    this._current_players[player.uid].connected = false;

    this._group_socket.to(this.group_id).emit(
      'players:update', {
        players: _.sortBy(this._current_players, (_player) => _player.index),
        state: 'lost_player',
      },
    );

    this._current_player_index -= 1;
  }

  /**
   * @override
   */
  AdvanceRound(socket) {
    // Invoke common method
    super.AdvanceRound(this.groupSocket);

    // End game if round > 2
    if (this._current_round === 3) this.End(socket);

    // Reset active deck roles
    this._active_deck_roles = this.deck_data.roles;

    // Reset active player
    this._active_player_index = 0;

    // Tell current decider to stop being decider
    this.groupSocket.to(this._current_decider.socket_id).emit('game:decider', false);

    _.each(this._current_players, (player, index) => {
      const isDecider = (this._current_winner.uid === player.uid);

      // Assign new decider and new roles
      this.AssignRoleToPlayer(player, isDecider);
    });

    // Nullify winner for new round
    this._current_winner = null;
  }
}

module.exports = Common;