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

// eslint-disable-next-line func-names
const Common = function (nsp, socket) {
  const currentSpace = nsp;
  const currentSocket = socket;

  this.getSession = (pkg, action) => {
    const session = Session.Get(pkg.gameId);

    if (!session) {
      logger.error(`Game w/ code ${pkg.gameId} not found!`, action);
      return;
    }

    if (action) action(session);
  };

  // Expose handler methods for events
  this.handler = {

    'game:intro': (pkg) => {
      this.getSession(pkg, (sesh) => sesh.Intro(currentSpace));
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
      this.getSession(pkg, (sesh) => sesh.StartGame());
    },

    'game:next': (pkg) => {
      this.getSession(pkg, (sesh) => sesh.NextPhase());
    },

    'game:skip_rules': (pkg) => {
      this.getSession(pkg, (sesh) => sesh.SkipScreen());
    },

    'game:next_screen': (pkg) => {
      this.getSession(pkg, (sesh) => sesh.NextScreen());
    },

    'game:load_screen': (pkg) => {
      this.getSession(pkg, (sesh) => sesh.LoadScreenAtIndex(pkg.msgData.index));
    },

    'game:start_timer': (pkg) => {
      this.getSession(pkg, (sesh) => sesh.StartTimer());
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

    'game:exit': (pkg) => {
      this.getSession(pkg, (sesh) => sesh.EndGame());
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