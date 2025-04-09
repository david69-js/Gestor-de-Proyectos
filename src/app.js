const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { verifyToken } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const teamsRoutes = require('./routes/teams');
const projectsRoutes = require('./routes/projects');
const tasksRoutes = require('./routes/tasks');
const filesRoutes = require('./routes/files');
const calendarRoutes = require('./routes/calendar');
const notificationsRoutes = require('./routes/notifications');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files directory for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/teams', verifyToken, teamsRoutes);
app.use('/api/users', verifyToken, usersRoutes);
app.use('/api/projects',verifyToken, projectsRoutes);
app.use('/api/tasks', verifyToken, tasksRoutes);
app.use('/api/files', verifyToken, filesRoutes);
app.use('/api/calendar', verifyToken, calendarRoutes);
app.use('/api/notifications', verifyToken, notificationsRoutes);

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