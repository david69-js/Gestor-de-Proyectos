const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { verifyToken } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const invitacionesRoutes = require('./routes/invtaciones');
const anunciosRoutes = require('./routes/anuncios');
const usersRoutes = require('./routes/users');
const projectsRoutes = require('./routes/projects');
const tasksRoutes = require('./routes/tasks');
const notificationsRoutes = require('./routes/notificaciones');
const reportsRoutes = require('./routes/reportes');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'public/uploads');
if (!require('fs').existsSync(uploadDir)){
    require('fs').mkdirSync(uploadDir, { recursive: true });
}

// Static files directory for uploads
app.use('/uploads', express.static(uploadDir));

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/invitaciones', verifyToken, invitacionesRoutes);
app.use('/api/users', verifyToken, usersRoutes);
app.use('/api/projects', verifyToken, projectsRoutes);
app.use('/api/tasks', verifyToken, tasksRoutes);
app.use('/api/notificaciones', verifyToken, notificationsRoutes);
app.use('/api/anuncios', verifyToken, anunciosRoutes);
app.use('/api/reports', verifyToken, reportsRoutes); // Nueva ruta para reportes

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
