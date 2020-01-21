/**
 * @Stake v3
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

// eslint-disable-next-line func-names
const Common = function (nsp, socket) {
  const currentSpace = nsp;
  const currentSocket = socket;

  // Expose handler methods for events
  this.handler = {

    'game:intro': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.Intro(currentSpace);
    },

    'game:ready': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.PlayerDone(pkg.msgData);
    },

    'game:event': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.ShowEvent(pkg.msgData.state, pkg.msgData.index);
    },

    'game:tutorial': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.StartTutorial(currentSpace);
    },

    'game:start': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.StartGame();
    },

    'game:next': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.NextPhase();
    },

    'game:skip_rules': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.SkipScreen();
    },

    'game:next_screen': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.NextScreen(pkg.msgData);
    },

    'game:next_player': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.NextPlayer();
    },

    'game:load_screen': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.LoadScreenAtIndex(pkg.msgData.index);
    },

    'game:next_round': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.AdvanceRound(currentSpace);
    },

    'game:start_timer': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.StartTimer(currentSpace);
    },

    'game:exit': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.EndGame(currentSpace);
    },

    'game:ranking': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.GameRating(pkg.msgData);
    },

    'game:stop_countdown': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.StopCountdown();
    },

    'player:met_goal': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.PlayerMetGoal(pkg.msgData.uid);
    },

    'player:met_need': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.PlayerMetNeed(pkg.msgData.uid, pkg.msgData.index);
    },

    'player:call_vote': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.PlayerCallVote(currentSocket);
    },

    'player:vote': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.PlayerVote(pkg.msgData);
    },

    'player:vote_end': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.PlayerVoteEnd(currentSpace);
    },

    /* Pauses all game cooldowns (debugging only) */
    'debug:pause': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.PauseResumeCooldown(currentSpace);
    },

    /* End game now (debugging only) */
    'debug:end': (pkg) => {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.EndGame(currentSpace);
    },

  };
};

module.exports = Common;
