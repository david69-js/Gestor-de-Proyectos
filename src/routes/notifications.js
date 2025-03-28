const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');

// Get all notifications for a user
router.get('/user/:userId', notificationsController.getUserNotifications);

// Get unread notifications count for a user
router.get('/user/:userId/unread', notificationsController.getUnreadNotificationsCount);

// Create a new notification
router.post('/', notificationsController.createNotification);

// Mark notification as read
router.put('/:id/read', notificationsController.markNotificationAsRead);

// Delete notification
router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;