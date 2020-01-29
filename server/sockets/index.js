/**
 * @Stake v4
 * Developed by Engagement Lab, 2016-2020
 * ==============
 * Socket connection, event, and handlers initialization.
 *
 * @class sockets
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */

const SocketIO = require('socket.io');
const SocketIORedis = require('socket.io-redis');
const CommonHandler = require('./handlers/Common');
const ConnectionHandler = require('./handlers/Connection');

module.exports = (app) => {
  const io = new SocketIO(app, {
    path: '/at-stake-socket',
  });
  const redisAdapter = SocketIORedis;

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

    // Parse through all events and assign to handler
    Object.keys(eventTypes).forEach((key) => {
      const category = eventTypes[key];

      if (typeof category !== 'undefined' && category !== null) {
        const events = category.eventIds;
        events.forEach((event) => {
          // Get handler
          const {
            handler,
          } = category;
          socket.on(event, (req) => {
            // Call handler tied to event
            handler(event, req);
          });
        });
      }
    });

    socket.send(socket.id);
  });

  logger.info('socket.io inititalized');
};