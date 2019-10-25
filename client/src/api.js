import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:8000');
function subscribeToTimer(cb) {
  socket.on('ohhai', timestamp => cb(null, timestamp));
  socket.emit('hello');
}
export { subscribeToTimer };