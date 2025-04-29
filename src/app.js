const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { verifyToken } = require('./middleware/auth');

// Importar rutas
const authRoutes = require('./routes/auth');
const invitacionesRoutes = require('./routes/invtaciones');
const anunciosRoutes = require('./routes/anuncios');
const usersRoutes = require('./routes/users');
const projectsRoutes = require('./routes/projects');
const tasksRoutes = require('./routes/tasks');
const notificationsRoutes = require('./routes/notificaciones');
const reportsRoutes = require('./routes/reportes');
const uploadRoutes = require('./routes/upload');

const app = express();

// Middleware global
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Aumentar el límite de tamaño de los datos JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Crear la carpeta 'public/uploads' si no existe
const uploadDir = path.join(__dirname, '..', 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Carpeta "public/uploads" creada.');
}


app.get('/', (req, res) => {
    res.send('hello');
});

// Servir archivos estáticos desde /upload
app.use('/uploads', express.static(uploadDir));

// Rutas públicas
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// Rutas protegidas
app.use('/api/invitaciones', verifyToken, invitacionesRoutes);
app.use('/api/users', verifyToken, usersRoutes);
app.use('/api/projects', verifyToken, projectsRoutes);
app.use('/api/tasks', verifyToken, tasksRoutes);
app.use('/api/notificaciones', verifyToken, notificationsRoutes);
app.use('/api/anuncios', verifyToken, anunciosRoutes);
app.use('/api/reports', verifyToken, reportsRoutes);

// Middleware de errores
app.use((err, req, res, next) => {
  console.error('❌ Error interno:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Middleware para rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
