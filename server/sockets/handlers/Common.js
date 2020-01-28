/**
 * @Stake v4
 * Developed by Engagement Lab, 2016-2017
 * ==============
 * Common game socket handler.
 *
 * @class sockets/handlers
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */

const Session = require('learning-games-core').SessionManager;

function Common(nsp, socket) {
  const currentSpace = nsp;
  const currentSocket = socket;

  this.eventIds = [
    'game:intro',
    'game:ready',
    'game:event',
    'game:tutorial',
    'game:start',
    'game:next',
    'game:skip_rules',
    'game:next_screen',
    'game:load_screen',
    'game:start_timer',
    'game:ranking',
    'game:stop_countdown',
    'game:exit',

    'player:met_goal',
    'player:met_need',
    'player:call_vote',
    'player:vote',
    'player:vote_end',
  ];

  this.getSession = (payload, action) => {
    const session = Session.Get(payload.gameId);

    if (!session) {
      logger.error(`Game w/ code ${payload.gameId} not found!`, action);
      return;
    }

    if (action) action(session);
  };

  // Expose handler methods for events
  this.handler = (id, payload) => {
    this.getSession(payload, (session) => {
      switch (id) {
        default:
          break;

        case 'game:intro':
          session.Intro(currentSpace);
          break;

        case 'game:ready':
          session.PlayerDone(payload.msgData);
          break;

        case 'game:event':
          session.ShowEvent(payload.msgData.state, payload.msgData.index);
          break;

        case 'game:tutorial':
          session.StartTutorial(currentSpace);
          break;

        case 'game:start':
          session.StartGame();
          break;

        case 'game:next':
          session.NextPhase();
          break;
        case 'game:skip_rules':
          session.SkipScreen();
          break;
        case 'game:next_screen':
          session.NextScreen();
          break;
        case 'game:load_screen':
          session.LoadScreenAtIndex(payload.msgData.index);
          break;
        case 'game:start_timer':
          session.StartTimer();
          break;
        case 'game:ranking':
          session.GameRating(payload.msgData);
          break;
        case 'game:stop_countdown':
          session.StopCountdown();
          break;
        case 'game:exit':
          session.EndGame();
          break;

        case 'player:met_goal':
          session.PlayerMetGoal(payload.msgData.uid);
          break;
        case 'player:met_need':
          session.PlayerMetNeed(payload.msgData.uid, payload.msgData.index);
          break;
        case 'player:call_vote':
          session.PlayerCallVote(currentSocket);
          break;
        case 'player:vote':
          session.PlayerVote(payload.msgData);
          break;
        case 'player:vote_end':
          session.PlayerVoteEnd(currentSpace);
          break;
      }
    });

    /* Pauses all game cooldowns (debugging only) */
    /*     'debug:pause': (payload) => {
      const session = Session.Get(payload.gameId);

      if (!session) return;
      session.PauseResumeCooldown(currentSpace);
    }, */

    /* End game now (debugging only) */
    /*     'debug:end': (payload) => {
      const session = Session.Get(payload.gameId);

      if (!session) return;
      session.EndGame(currentSpace);
    }, */
  };
}

module.exports = Common;