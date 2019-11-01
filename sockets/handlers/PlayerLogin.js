/**
 * @Stake v3
 * Developed by Engagement Lab, 2016-2017
 * ==============
 * PlayerLogin submission socket handler.
 *
 * @class sockets/handlers
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */


const logger = require('winston');
const Session = require('learning-games-core').SessionManager;

// Arrow functions can't be used as constructors, so we must use function()
// eslint-disable-next-line func-names
const PlayerLogin = function (nsp, socket, emitter) {
  const currentSpace = nsp;
  const currentSocket = socket;

  let playerGameId;

  // Expose handler methods for events
  this.handler = {

    room: (payload) => {
      if (!payload.gameId) return;

      playerGameId = payload.gameId;

      if (!Session.Get(playerGameId)) {
        currentSocket.emit('game:notfound');
        return;
      }

      currentSocket.join(payload.gameId, (err) => {
        if (err) throw err;
      });

      // Decider registration
      if (payload.msgData.type === 'decider' && Session.Get(playerGameId)) {
        const player = {
          socket_id: currentSocket.id,
          username: payload.msgData.username,
          uid: payload.msgData.uid,
        };

        Session.GroupView(payload.gameId, currentSocket.id);
        Session.Get(playerGameId).ModeratorJoin(currentSpace, player);
      }

      logger.info(`${currentSocket.id} connected to room.`);
    },

    'login:submit': (payload) => {
      const player = {
        socket_id: currentSocket.id,
        username: payload.msgData.username,
        uid: payload.msgData.uid,
      };

      console.log(payload);
      // Mark player as ready inside game session
      Session.Get(payload.gameId).PlayerReady(
        player,
        currentSpace,
        false,
      );

      logger.info(`${player.username} logged in.`);

      // Advance player to waiting screen
      const data = {
        code: payload.gameId,
        id: currentSocket.id,
      };

      currentSocket.emit('player:loggedin', data);
    },

    'login:active': (payload) => {
      const session = Session.Get(payload.gameId);

      if (!session) return;

      if (!session.GameInSession()) {
        currentSocket.emit('game:notfound');
        return;
      }

      // See if this player is still marked as active inside game session
      if (session.PlayerIsActive(payload.uid)) {
        const player = {
          socket_id: currentSocket.id,
          username: payload.username,
          uid: payload.uid,
        };
        console.log(payload);
        // Mark player as ready inside game session
        session.PlayerReady(
          player,
          currentSocket,
          payload.decider,
        );
      } else {
        logger.info('login:active', `Player "${payload.uid}" not active.`);
      }
    },

    disconnect: (payload) => {
      const session = Session.Get(playerGameId);

      if (!session) return;

      const isGroup = (currentSocket.id === session.groupModerator);

      if (isGroup) logger.info(`${playerGameId} group view disconnecting. Bu-bye.`);
      else {
        const player = session.GetPlayerById(currentSocket.id);

        if (player) logger.info(`Player '${player.username}' disconnecting. Nooooo!`);
      }

      if (playerGameId && session) session.PlayerLost(currentSocket.id, currentSocket);
    },

    hello: (payload) => {
      console.log('ping ');
      currentSocket.emit('ohhai');
    },

  };

  logger.info('New PlayerLogin for socket: '.green + currentSocket.id);
};
module.exports = PlayerLogin;
