/**
 * @Stake v4
 * Developed by Engagement Lab, 2016-2017
 * ==============
 * @Stake game logic controller
 *
 * @class lib/games
 * @static
 * @author Johnny Richardson
 * @author Erica Salling
 *
 * ==========
 */
const Common = require('./Common');

class GameLogic extends Common {
  constructor() {
    super();

    this.currentScreens = [
      {
        id: 'meet',
        unique: true,
      },
      {
        id: 'deliberate',
      },
      {
        id: 'ranking',
      },
    ];

    this.currentPhaseIndex = -1;
    this.currentScreenIndex = 0;
    this.allAgendaItems;
    this.activeAgendaItem = 0;
    this.voteCallerSocketId;
    this.votesReceived = 0;
    this.votesYes = 0;

    // Player count who are ready for next step
    this.playersReady = 0;

    // Player ids who met secret goal
    this.playersMetGoal = [];

    this.maxScore = 0;

    // Enable/disables tutorial in first phase
    this.tutorialEnabled = false;

    this.timerRunning = false;
    this.timerTime = 0;

    this.timerCallback = (data, socket) => {
      this.timerRunning = false;
    };
  }

  // eslint-disable-next-line class-methods-use-this
  Shuffler(obj) {
    let j;
    let x;
    let i;

    for (
      j, x, i = obj.length;
      i;
      j = Math.floor(Math.random() * i),
      i -= 1,
      x = obj[i],
      obj[i - 1] = obj[j],
      obj[j] = x
    ) {
      return obj;
    }
  }

  Initialize(gameSession, callback) {
    // Invoke common method
    super.Initialize(gameSession, () => {
      this.eventEmitter.on('playerReconnected', (info) => {
        // If game in progress (phase => 0), refresh the current screen for reconnected player
        if (this.currentPhaseIndex > -1) {
          const { id } = this.currentScreens[this.currentPhaseIndex];
          this.FindScreen(id, true, info.player, false);

          if (info.is_decider) {
            this.ShowTeamInfo();
          }
        }
      });

      if (callback) callback();
    });
  }

  Intro(socket) {
    socket.to(this.players_id).emit('game:intro');
  }

  StartGame() {
    this.currentPhaseIndex = -1;

    this._game_in_session = true;

    // Calc possible max score (needs * secret goal * num of players + ratings)
    this.maxScore = 3 * _.keys(this.GetActivePlayers()).length + 15;

    this.NextPhase();
    this.ShowTeamInfo();
  }

  // Core method invocation
  StopCountdown() {
    this.timerRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
    }

    super.StopCountdown();
  }

  GetAllScreens() {
    return _.pluck(this.currentScreens, 'id');
  }

  async GetData(screenName) {
    const screenData = {};
    screenData.players = await this.GetAllPlayers();

    switch (screenName) {
      default:
        break;

      case 'meet':
        screenData.roles = _.mapObject(screenData.players, (player) => ({
          username: player.username,
          title: player.role.title,
          needs: player.role.needs,
          secretGoal: player.role.secretGoal,
          isFacilitator: player.role.isFacilitator,
        }));
        break;

      case 'deliberate':
        screenData.events = this.Shuffler(this.game_events);
        screenData.roles = _.mapObject(screenData.players, (player) => ({
          username: player.username,
          needs: player.role.needs,
          isFacilitator: player.role.isFacilitator,
        }));
        break;

      case 'ranking':
        // Send goals/needs
        screenData.playerData = _.mapObject(screenData.players, (player) => ({
          uid: player.uid,
          username: player.username,
          needs: player.role.needs,
          secretGoal: player.role.secretGoal,
          goalMet: _.contains(this.playersMetGoal, player.uid),
        }));

        break;
    }

    // Apply to data for all screens
    screenData.question = this.deck_data.questions[0];
    screenData.decider = this._current_decider.username;
    screenData.timerRunning = this.timerRunning;
    screenData.repeatScreen = this._active_player_index
      < Object.keys(this.GetActivePlayers()).length - 1;
    return screenData;
  }

  async FindScreen(screenName, refreshCurrent, player, uniqueOverride) {
    const screenInfo = _.where(this.currentScreens, {
      id: screenName,
    })[0];
    let isUnique = screenInfo.unique;
    if (uniqueOverride !== undefined) {
      isUnique = uniqueOverride;
    }

    const data = await this.GetData(screenName);
    this.ShowScreen(screenName, data, isUnique, refreshCurrent, player);
  }

  /**
   * Load and dispatch game screen to players.
   *
   * @param {String} Name of the screen
   * @param {Object} Data for the screen
   * @param {Boolean} Data is unique for each player (data must be an array where indexes are playerId)?
   * @param {Boolean} Don't send next phase, just refresh current screen(s) with new data?
   * @param {Object} Player to send data to
   * @class GameLogic
   * @name ShowScreen
   */
  ShowScreen(screenName, data, isUnique, refreshCurrent, player) {
    const eventId = refreshCurrent ? 'game:refresh_screen' : 'game:next_phase';
    const seconds = screenName === 'meet'
      ? this.GetConfig().thinkSeconds
      : this.GetConfig().deliberateSeconds;

    const screenData = {
      name: screenName,
      phase: this.currentPhaseIndex,
      screen: this.currentScreenIndex,
      timerLength: seconds,
      timerRunning: this.timerRunning,
      timerDuration: this.timerTime,
      ready: this.playersReady === _.keys(this.GetActivePlayers()).length,
    };

    // We omit 'players' key from sent data; not needed by client, only here
    if (isUnique) {
      const arrPlayerUnique = [];
      let playerIndex = 0;

      // eslint-disable-next-line no-inner-declarations
      function sendData(_socket) {
        const thisPlayer = arrPlayerUnique[playerIndex];
        // Players unneeded in share data
        thisPlayer.shared = _.omit(data, 'players');

        _socket
          .to(arrPlayerUnique[playerIndex].socket_id)
          .emit(eventId, _.extend(screenData, thisPlayer));

        if (playerIndex < arrPlayerUnique.length - 1) {
          playerIndex += 1;
          sendData(_socket);
        }
      }

      // Assemble array of players to send to
      _.each(data.players, (thisPlayer) => {
        arrPlayerUnique.push(thisPlayer);
      });

      sendData(this.groupSocket);
    } else {
      const allData = _.extend(
        {
          name: screenName,
          shared: _.omit(data, 'players'),
        },
        screenData,
      );

      // Emit only to given player, if specified
      if (player !== undefined) {
        this.groupSocket
          .to(player.socket_id)
          .emit(eventId, _.extend(allData, player));
      } else this.groupSocket.to(this.players_id).emit(eventId, allData);
    }
  }

  ShowTeamInfo() {
    const data = _.map(this.GetActivePlayers(), (player) => ({
      uid: player.uid,
      username: player.username,
      needs: player.role.needs,
      secretGoal: player.role.secretGoal,
      goalMet: _.contains(this.playersMetGoal, player.uid),
    }));

    // Tell facilitator team info
    if (this.groupSocket) {
      this.groupSocket
        .to(this._current_decider.socket_id)
        .emit('game:team_info', data);
    }
  }

  StartTimer(socket, timeAdded) {
    const { id } = this.currentScreens[this.currentPhaseIndex];
    const seconds = id === 'meet'
      ? this.GetConfig().thinkSeconds
      : this.GetConfig().deliberateSeconds;

    // Begin countdown and assign countdown end event
    const data = {
      timeLimit: seconds,
      countdownName: `${id}Countdown`,
    };
    if (timeAdded) {
      const name = _.first(this._deliberate_time_queue).username;
      this.groupSocket.to(this.players_id).emit('game:countdown_player', name);
    }

    this.timerRunning = true;

    // Advance phase screen for non-deciders
    this.NextScreen();

    this.Countdown(this.groupSocket, data, true);

    this.eventEmitter.on('countdownEnded', this.timerCallback);

    // Track seconds since start
    this.timer = setInterval(() => {
      this.timerTime += 1;
      if (this.timerTime === seconds) {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  PlayerTurnDone(socket) {
    let resetActive = this._active_player_index === _.keys(this.GetActivePlayers()).length - 1;

    if (resetActive) {
      this._active_player_index = 0;
    }

    const { id } = this.currentScreens[this.currentPhaseIndex];

    // If doubledown phase, track how many players say 'no',
    // then advance phase if all have done so
    if (id === 'doubledown') {
      this.playersDoubledownDone += 1;

      if (
        this.playersDoubledownDone === _.keys(this.GetActivePlayers()).length
      ) {
        this.NextScreen(true);
        return;
      }
      resetActive = false;
    }

    this.groupSocket.to(this.players_id).emit('game:player_done', {
      end: resetActive,
      phase: id,
    });
  }

  NextPhase() {
    this.StopCountdown();

    this.currentPhaseIndex += 1;
    this.currentScreenIndex = 0;
    this.playersReady = 0;

    if (this.currentPhaseIndex > this.currentScreens.length - 1) {
      throw new Error(`No screen at index ${this.currentPhaseIndex}!`);
    }

    const { id } = this.currentScreens[this.currentPhaseIndex];
    this.FindScreen(id);
  }

  // Tell players to go to next screen in phase
  NextScreen(force) {
    const forceScreen = force;
    this.currentScreenIndex += 1;
    this.groupSocket.to(this.players_id).emit('game:next_screen', {
      force: forceScreen,
    });
  }

  SkipScreen() {
    const { id } = this.currentScreens[this.currentPhaseIndex];
    const forceScreen = 'true';

    this.groupSocket.to(this.players_id).emit('game:skip_rules', {
      force: forceScreen,
    });
  }

  LoadScreenAtIndex(index) {
    this.currentPhaseIndex = index - 1;

    const { id } = this.currentScreens[this.currentPhaseIndex];
    this.FindScreen(id);
  }

  ShowEvent(state, index) {
    if (state === 'reject') return;
    this.groupSocket.to(this.players_id).emit('player:show_event', index);
  }

  async PlayerDone(data) {
    this.playersReady += 1;
    const playerCt = _.keys(await this.GetActivePlayers()).length;

    if (this.playersReady === playerCt) {
      this.groupSocket
        .to(this._current_decider.socket_id)
        .emit('game:ready', data);
    }
  }

  async PlayerMetGoal(playerUid) {
    const uid = parseInt(playerUid, 10);
    const player = await this.GetPlayerByUserId(uid);
    this.playersMetGoal.push(uid);

    this.groupSocket.to(this.players_id).emit('game:met_goal', player.username);
  }

  PlayerMetNeed(playerUid, needIndex) {
    const player = this.GetPlayerByUserId(playerUid);

    // Get need that was met
    const need = player.role.needs[needIndex];

    this.groupSocket.to(this.players_id).emit('game:met_need', need);
  }

  async PlayerCallVote(socket) {
    const player = await this.GetPlayerById(socket.id);
    const data = {
      question: this.deck_data.questions[0],
      username: player.username,
    };

    this.voteCallerSocketId = player.uid;
    this.groupSocket.to(this.players_id).emit('player:call_vote', data);
  }

  async PlayerVote(data) {
    this.votesReceived += 1;
    if (data.yes) this.votesYes += 1;

    // Get player count sans facilitator
    const playerCt = (await this.Redis.GetHashLength(this._game_session.accessCode)) - 1;

    // Tell all players result of vote
    if (this.votesReceived === playerCt) {
      const voteWon = this.votesYes === playerCt;
      this.groupSocket.to(this.players_id).emit('players:voted', {
        yes: voteWon,
        votecallerid: this.voteCallerSocketId,
      });
      this.votesYes = 0;
      this.votesReceived = 0;
    }
  }

  PlayerVoteEnd() {
    this.groupSocket.to(this.players_id).emit('players:vote_ended');
  }

  GameRating(ratingData) {
    const calcRating = (total, num) => total + Number(num);
    const scales = Object.values(ratingData.rating).reduce(calcRating, 0);
    const score = scales + ratingData.needs;

    // Decide win state (is fractional val over threshold)
    const thresholdPerc = this.GetConfig().minWinThreshold / 100;
    const didWin = score / this.maxScore >= thresholdPerc;

    // Send to all players
    this.groupSocket.to(this.players_id).emit('game:end', {
      won: didWin,
    });
  }
}

module.exports = GameLogic;
