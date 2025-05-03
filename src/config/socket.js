// socket.js
const socketIo = require('socket.io');

let io;

function init(server) {
  io = socketIo(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });
}

function getIo() {
  if (!io) {
    throw new Error('Socket.IO no ha sido inicializado');
  }
  return io;
}

module.exports = { init, getIo };
