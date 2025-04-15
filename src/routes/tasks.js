const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');

// Get all tasks
router.get('/', tasksController.getAllTasks);

// Get task by ID with details
router.get('/:id', tasksController.getTaskById);


// Add comment to task
router.post('/:id/comments', tasksController.addComment);

// Update task status
//router.put('/:id/status', tasksController.updateTaskStatus);
module.exports = router;