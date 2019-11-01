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


const Common = function (nsp, socket) {
  const currentSpace = nsp;
  const currentSocket = socket;
  const Session = require('learning-games-core').SessionManager;

  // Expose handler methods for events
  this.handler = {

    'game:intro': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.Intro(currentSpace);
    },

    'game:ready': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.PlayerDone(pkg.msgData);
    },

    'game:event': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.ShowEvent(pkg.msgData.state, pkg.msgData.index);
    },

    'game:tutorial': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.StartTutorial(currentSpace);
    },

    'game:start': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.StartGame(currentSpace, false);
    },

    'game:next': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.NextPhase();
    },

    'game:skip_rules': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.SkipScreen();
    },

    'game:next_screen': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.NextScreen(pkg.msgData);
    },

    'game:next_player': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.NextPlayer();
    },

    'game:load_screen': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.LoadScreenAtIndex(pkg.msgData.index);
    },

    'game:next_round': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.AdvanceRound(currentSpace);
    },

    'game:start_timer': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.StartTimer(currentSpace);
    },

    'game:exit': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.EndGame(currentSpace);
    },

    'game:ranking': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.GameRating(pkg.msgData);
    },

    'game:stop_countdown': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.StopCountdown();
    },

    'player:met_goal': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.PlayerMetGoal(pkg.msgData.uid);
    },

    'player:met_need': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.PlayerMetNeed(pkg.msgData.uid, pkg.msgData.index);
    },

    'player:callvote': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.PlayerCallVote(currentSocket);
    },

    'player:vote': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.PlayerVote(currentSpace, pkg.msgData);
    },

    'player:vote_end': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.PlayerVoteEnd(currentSpace);
    },

    /* Pauses all game cooldowns (debugging only) */
    'debug:pause': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.PauseResumeCooldown(currentSpace);
    },

    /* End game now (debugging only) */
    'debug:end': function (pkg) {
      const session = Session.Get(pkg.gameId);

      if (!session) return;
      session.EndGame(currentSpace);
    },

  };
};

module.exports = Common;
