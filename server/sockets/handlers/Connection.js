/**
 * @Stake v4
 * Developed by Engagement Lab, 2016-2020
 * ==============
 * Connection and player login socket handler.
 *
 * @class sockets/handlers
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */

const Session = require('learning-games-core').SessionManager;

const JoinRoom = function(payload, currentSocket, currentSpace) {
  if (!payload.gameId) return;
  const { gameId } = payload;
  const session = Session.Get(gameId);

  if (!session) {
    currentSocket.emit('game:notfound');
    return;
  }

  currentSocket.join(gameId, err => {
    if (err) throw err;
  });

  // Decider registration
  if (payload.msgData.type === 'decider' && session) {
    const player = {
      socket_id: currentSocket.id,
      username: payload.msgData.username,
      uid: payload.msgData.uid
    };

    Session.GroupView(gameId, currentSocket.id);
    Session.Get(gameId).ModeratorJoin(currentSpace, player);
  }

  logger.info(`${currentSocket.id} connected to room.`);
  if (!gameId) return;

  currentSocket.join(gameId, err => {
    if (err) throw err;
  });

  logger.info(`${currentSocket.id} connected to room.`);
};

function PlayerLogin(payload, currentSocket, currentSpace) {
  const player = {
    socket_id: currentSocket.id,
    username: payload.msgData.username,
    uid: payload.msgData.uid
  };

  if (!Session.Get(payload.gameId)) return;

  // Mark player as ready inside game session
  Session.Get(payload.gameId).PlayerReady(player, currentSpace, false);

  logger.info(`${player.username} logged in.`);

  // Advance player to waiting screen
  const data = {
    code: payload.gameId,
    id: currentSocket.id
  };

  currentSocket.emit('player:loggedin', data);
}

async function PlayerDisconnect(playerGameId, currentSocket) {
  if (!playerGameId) return;

  const session = Session.Get(playerGameId);

  if (!session) return;

  const isFacilitator = currentSocket.id === session.groupModerator;

  if (isFacilitator) {
    logger.info(`${playerGameId} group view disconnecting. Bu-bye.`);
    if (process.env.NODE_ENV === 'development')
      session.End(currentSocket, true);
  } else {
    const player = await session.GetPlayerById(currentSocket.id);

    if (player)
      logger.info(`Player '${player.username}' disconnecting. Nooooo!`);
  }

  if (playerGameId && session)
    await session.PlayerLost(currentSocket.id, currentSocket);
}

async function PlayerCheckActive(payload, currentSocket) {
  const session = Session.Get(payload.gameId);

  if (!session) return;

  if (!session.GameInSession()) {
    currentSocket.emit('game:notfound');
    return;
  }

  const isActive = await session.PlayerIsActive(payload.msgData.uid);

  // See if this player is still marked as active inside game session
  if (isActive) {
    const player = {
      socket_id: currentSocket.id,
      username: payload.msgData.username,
      uid: payload.msgData.uid
    };

    // Mark player as ready inside game session
    await session.PlayerReady(player, currentSocket, payload.msgData.decider);
  } else {
    logger.info(`Player "${payload.msgData.uid}" not active.`);
  }
}

// Arrow functions can't be used as constructors, so we must use function()
// eslint-disable-next-line func-names
const Connection = function(nsp, socket) {
  const currentSpace = nsp;
  const currentSocket = socket;

  this.playerGameId = null;
  this.eventIds = ['room', 'login:submit', 'login:active', 'disconnect'];

  // Expose handler methods for events
  this.handler = (id, payload) => {
    switch (id) {
      default:
        break;

      case 'room':
        // Cache this game id and join
        this.playerGameId = payload.gameId;
        JoinRoom(payload, currentSocket, currentSpace);

        break;

      case 'login:submit':
        PlayerLogin(payload, currentSocket, currentSpace);

        break;

      case 'login:active':
        PlayerCheckActive(payload, currentSocket);

        break;

      case 'disconnect':
        PlayerDisconnect(this.playerGameId, currentSocket);
        break;
    }
  };

  logger.info('New PlayerLogin for socket: '.green + currentSocket.id);
};
module.exports = Connection;
