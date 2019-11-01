module.exports = (app) => {
  const io = require('socket.io')(app, {
    path: '/at-stake-socket',
  });

  const CommonHandler = require('./handlers/Common');
  const PlayerLogin = require('./handlers/PlayerLogin');

  io.on('connection', (socket) => {
    // Create event handlers for this socket
    const eventHandlers = {
      common: new CommonHandler(io, socket),
      login: new PlayerLogin(io, socket),
    };

    // Bind events to handlers
    for (const category in eventHandlers) {
      const { handler } = eventHandlers[category];
      for (const event in handler) {
        socket.on(event, handler[event]);
      }
    }
    // socket.emit('pong');

    socket.send(socket.id);
  });

  logger.info('socket.io inititalized');
};
