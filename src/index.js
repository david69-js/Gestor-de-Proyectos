// index.js
const app = require('./app');
require('dotenv').config();
const http = require('http');
const { init } = require('./config/socket');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Crear servidor HTTP
const server = http.createServer(app);

// Inicializar Socket.IO con configuración CORS
init(server);

// Iniciar servidor
server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
