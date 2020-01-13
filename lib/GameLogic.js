/**
 * @Stake v3
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

    // this.Coins,

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

    // Track players finished w/ doubledown
    this.playersDoubledownDone = 0;

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
      j, x, i = obj.length; i; j = Math.floor(Math.random() * i),
      i -= 1, x = obj[i], obj[i - 1] = obj[j], obj[j] = x
    ) {
      return obj;
    }
  }

  Initialize(gameSession) {
    // Invoke common method
    super.Initialize(gameSession, () => {
      this.eventEmitter.on('playerReconnected', (info) => {

        // If game in progress (phase => 0), refresh the current screen for reconnected player
        if (this.currentPhaseIndex > -1) {
          const {
            id,
          } = this.currentScreens[this.currentPhaseIndex];
          this.FindScreen(id, true, info.socket, false);

          if (info.is_decider) {
            this.ShowTeamInfo();
          }
        }
      });
    });
  }

  Intro(socket) {
    socket.to(this.players_id).emit('game:intro');
  }

  StartGame() {

    this.currentPhaseIndex = -1;

    this._game_in_session = true;

    // Calc possible max score (needs * secret goal * num of players + ratings)
    this.maxScore = (3 * _.keys(this.GetActivePlayers()).length) + 15;

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

  GetData(screenName) {
    let screenData = {};
    const activePlayerInfo = this.GetActivePlayerData();

    const playerMap = _.map(this._current_players,
      (player) => ({
        username: player.username,
        decider: player.decider,
        title: player.role.title,
        icon: player.index,
        isFacilitator: player.role.isFacilitator,
      }));

    switch (screenName) {
      default:
        break;

      case 'meet':
        screenData = {
          question: this._deck_data.questions[0],
          players: this._current_players,
          roles: _.mapObject(this._current_players, (player) => ({
            username: player.username,
            title: player.role.title,
            isFacilitator: player.role.isFacilitator
          })),
        };
        break;

      case 'deliberate':

        screenData = {
          question: this._deck_data.questions[0],
          events: this.Shuffler(this._game_events),
          players: _.mapObject(this._current_players, (player) => ({
            username: player.username,
            needs: player.role.needs,
            isFacilitator: player.role.isFacilitator
          })),
        };

        break;

      case 'ranking':

        screenData.players = _.map(this.GetActivePlayers(),
          (player) => ({
            uid: player.uid,
            username: player.username,
            needs: player.role.needs,
            secretGoal: player.role.secretGoal,
            goatMet: _.contains(this.playersMetGoal, player.uid),
          }));

        break;
    }

    // Apply to data for all screens
    // screenData.config = _.omit(this.GetConfig(), 'debriefQuestions');
    screenData.decider = this._current_decider.username;
    screenData.round = this._current_round + 1;
    screenData.timerRunning = this.timerRunning;
    screenData.repeatScreen = (this._active_player_index < Object.keys(this.GetActivePlayers()).length - 1);
    return screenData;
  }

  FindScreen(screenName, refreshCurrent, socket, uniqueOverride) {
    const screenInfo = _.where(this.currentScreens, {
      id: screenName,
    })[0];
    let isUnique = screenInfo.unique;
    if (uniqueOverride !== undefined) {
      isUnique = uniqueOverride;
    }

    const data = this.GetData(screenName);
    this.ShowScreen(screenName, data, isUnique, refreshCurrent, socket);
  }

  /**
   * Load and dispatch game screen to players.
   *
   * @param {String} Name of the screen
   * @param {Object} Data for the screen
   * @param {Boolean} Data is unique for each player (data must be an array where indexes are playerId)?
   * @param {Boolean} Don't send next phase, just refresh current screen(s) with new data?
   * @class GameLogic
   * @name ShowScreen
   */
  ShowScreen(screenName, data, uniqueData, refreshCurrent, socket) {
    const eventId = refreshCurrent ? 'game:refresh_screen' : 'game:next_phase';
    const seconds = (screenName === 'meet') ? this.GetConfig().thinkSeconds : this.GetConfig().deliberateSeconds;

    const screenData = {
      name: screenName,
      phase: this.currentPhaseIndex,
      screen: this.currentScreenIndex,
      timerLength: seconds,
      timerRunning: this.timerRunning,
      timerDuration: this.timerTime,
      ready: this.playersReady === _.keys(this.GetActivePlayers()).length
    };

    if (uniqueData) {
      const arrPlayerUnique = [];
      let playerIndex = 0;

      // eslint-disable-next-line no-inner-declarations
      function sendData(_socket) {
        let playerData = arrPlayerUnique[playerIndex];
        playerData.shared = _.omit(data, 'players');

        _socket.to(arrPlayerUnique[playerIndex].socket_id).emit(eventId, _.extend(screenData, playerData));

        if (playerIndex < arrPlayerUnique.length - 1) {
          playerIndex += 1;
          sendData(_socket);
        }
      }

      _.each(this._current_players, (player, id) => {
        let playerData = data.players[id];
        playerData.socket_id = player.socket_id;

        arrPlayerUnique.push(playerData);
      });

      sendData(this.groupSocket);

    } else {
      
      let allData = _.extend({name: screenName}, screenData, data);

       // Emit only to given socket, if specified
        if (socket !== undefined)
          socket.emit(eventId, allData);
        else
          this.groupSocket.to(this.players_id).emit(eventId, allData);

    }
  }

  ShowTeamInfo() {
    const data = _.map(this.GetActivePlayers(),
      (player) => ({
        uid: player.uid,
        username: player.username,
        needs: player.role.needs,
        secretGoal: player.role.secretGoal,
        goatMet: _.contains(this.playersMetGoal, player.uid),
      }));

    // Load team info
    this.Templates.Load('partials/shared/teaminfo', data, (teamHtml) => {
      // Tell facilitator team info
      if (this.groupSocket) {
        this.groupSocket.to(this._current_decider.socket_id).emit('game:team_info', teamHtml);
      }
    });
  }

  StartTimer(socket, timeAdded) {
    const {
      id,
    } = this.currentScreens[this.currentPhaseIndex];
    const seconds = (id === 'meet') ? this.GetConfig().thinkSeconds : this.GetConfig().deliberateSeconds;

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
    let resetActive = (this._active_player_index === _.keys(this.GetActivePlayers()).length - 1);

    if (resetActive) {
      this._active_player_index = 0;
    }

    const {
      id,
    } = this.currentScreens[this.currentPhaseIndex];

    // If doubledown phase, track how many players say 'no',
    // then advance phase if all have done so
    if (id === 'doubledown') {
      this.playersDoubledownDone += 1;

      if (this.playersDoubledownDone === _.keys(this.GetActivePlayers()).length) {
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

    const {
      id,
    } = this.currentScreens[this.currentPhaseIndex];
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
    const {
      id,
    } = this.currentScreens[this.currentPhaseIndex];
    const forceScreen = 'true';

    this.groupSocket.to(this.players_id).emit('game:skip_rules', {
      force: forceScreen,
    });
  }

  NextPlayer() {
    const {
      id,
    } = this.currentScreens[this.currentPhaseIndex];

    // At last player?
    const resetActive = (this._active_player_index === _.keys(this.GetActivePlayers()).length - 1);

    // If doubledown phase, reset active player to cycle 'buy' screen back to first player
    if (id === 'doubledown') {
      if (resetActive) {
        this._active_player_index = 0;
        this.playersDoubledownDone = 0;
      } else {
        this._active_player_index++;
      }
    } else if (id === 'pitch') {
      if (resetActive) {
        this._active_player_index = 0;
        this.currentScreenIndex++;
      } else {
        this._active_player_index++;
      }
    } else {
      this._active_player_index++;
    }

    this.FindScreen(id, true);
  }

  LoadScreenAtIndex(index) {
    this.currentPhaseIndex = index - 1;

    const {
      id,
    } = this.currentScreens[this.currentPhaseIndex];
    this.FindScreen(id);
  }

  PlayerRejoined(socket) {
    const {
      id,
    } = this.currentScreens[this.currentPhaseIndex];
    this.FindScreen(id, false, socket);
  }

  ShowEvent(state, index) {
    if (state === 'reject') return;
    this.groupSocket.to(this.players_id).emit('player:show_event', index);
  }

  PlayerDone(data) {
    this.playersReady++;
    let playerCt = _.keys(this.GetActivePlayers()).length;

    if (this.playersReady === playerCt) { 
      this.groupSocket.to(this._current_decider.socket_id).emit('game:ready', data);
      // this.playersReady = 0;
    }
  }

  PlayerMetGoal(playerUid, needIndex) {
    const uid = parseInt(playerUid);
    const player = this.GetPlayerByUserId(uid);
    this.playersMetGoal.push(uid);

    this.groupSocket.to(this.players_id).emit('game:met_goal', player.username);
  }

  PlayerMetNeed(playerUid, needIndex) {
    const player = this.GetPlayerByUserId(parseInt(playerUid));
    // Get need that was met
    const need = player.role.needs[needIndex];

    this.groupSocket.to(this.players_id).emit('game:met_need', need);
  }


  PlayerCallVote(socket) {
    const player = this.GetPlayerById(socket.id);
    const data = {
      username: player.username,
      question: this._deck_data.questions[0],
    };
    this.voteCallerSocketId = player.uid;

    this.Templates.Load('partials/shared/vote', data, (html) => {
      this.groupSocket.to(this.players_id).emit('player:callvote', html);
    });
  }

  PlayerVote(socket, vote) {
    this.votesReceived++;
    if (vote === 'yes') {
      this.votesYes++;
    }

    if (this.votesReceived === _.keys(this.GetActivePlayers()).length) {
      const voteWon = (this.votesYes === _.keys(this.GetActivePlayers()).length);
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
    const didWin = (score / this.maxScore) >= thresholdPerc;

    this.Templates.Load('partials/shared/end', {
      won: didWin,
    }, (html) => {
      this.groupSocket.to(this.players_id).emit('game:end', html);
    });
  }
}

module.exports = GameLogic;
