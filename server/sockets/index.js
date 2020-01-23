/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */

const Server = require('socket.io');
const CommonHandler = require('./handlers/Common');
const PlayerLogin = require('./handlers/PlayerLogin');

module.exports = (app) => {
  const io = new Server(app, {
    path: '/at-stake-socket',
  });
  const redisAdapter = require('socket.io-redis');

  // Setup redis adapter
  io.adapter(redisAdapter({
    host: 'localhost',
    port: 6379,
    key: 'at-stake-socket',
  }));

  io.on('connection', (socket) => {
    // Create event handlers for this socket
    const eventHandlers = {
      common: new CommonHandler(io, socket),
      login: new PlayerLogin(io, socket),
    };

    for (const category in eventHandlers) {
      if (typeof eventHandlers[category] === 'undefined' || eventHandlers[category] === null) {
        console.warn(`eventHandlers[${category}] is undefined!`);
        return;
      }

      const {
        handler,
      } = eventHandlers[category];

      for (const event in handler) {
        socket.on(event, handler[event]);
      }
    }
    // socket.emit('pong');

    socket.send(socket.id);
  });

  logger.info('socket.io inititalized');
};