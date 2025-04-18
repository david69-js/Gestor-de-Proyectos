const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { verifyToken } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const invitacionesRoutes = require('./routes/invtaciones'); // Corrected import
const usersRoutes = require('./routes/users');
const projectsRoutes = require('./routes/projects');
const tasksRoutes = require('./routes/tasks');
const calendarRoutes = require('./routes/calendar');
const notificationsRoutes = require('./routes/notifications');

const app = express();

// Middleware
app.use(cors());
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
app.use('/api/invitaciones', verifyToken, invitacionesRoutes); // Corrected usage
app.use('/api/users', verifyToken, usersRoutes);
app.use('/api/projects',verifyToken, projectsRoutes);
app.use('/api/tasks', verifyToken, tasksRoutes);
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