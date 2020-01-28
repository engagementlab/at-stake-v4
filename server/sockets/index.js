/* eslint-disable no-restricted-syntax */

const Server = require('socket.io');
const CommonHandler = require('./handlers/Common');
const ConnectionHandler = require('./handlers/Connection');

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

  io.of('/').adapter.on('error', (err) => {
    throw new Error('Socket.io redis unable to connect! Make sure redis is running.', err);
  });

  io.on('connection', (socket) => {
    // Create event handlers for this socket
    const eventTypes = {
      common: new CommonHandler(io, socket),
      connection: new ConnectionHandler(io, socket),
    };

    for (const category in eventTypes) {
      if (typeof eventTypes[category] !== 'undefined' && eventTypes[category] !== null) {
        const events = eventTypes[category].eventIds;
        events.forEach((event) => {
          const {
            handler,
          } = eventTypes[category];
          socket.on(event, (req) => {
            // Call handler tied to event
            handler(event, req);
          });
        });
      }
    }

    socket.send(socket.id);
  });

  logger.info('socket.io inititalized');
};