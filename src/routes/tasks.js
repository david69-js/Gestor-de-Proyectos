const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');
const { checkRole } = require('../middleware/auth');

// Get all tasks
router.get('/', tasksController.getAllTasks);

// Get task by ID with details
router.get('/:id', tasksController.getTaskById);

// Create new task
router.post('/', checkRole(['Administrador', 'Líder de Proyecto']), tasksController.createTask);

// Update task
//router.put('/:id', checkRole(['Administrador', 'Líder de Proyecto']), tasksController.updateTask);

// Delete task
router.delete('/:id', checkRole(['Administrador', 'Líder de Proyecto']), tasksController.deleteTask);

// Add comment to task
router.post('/:id/comments', tasksController.addComment);

// Update task status
//router.put('/:id/status', tasksController.updateTaskStatus);

// Assign user to task
router.post('/:id/assign', checkRole(['Administrador', 'Líder de Proyecto']), tasksController.assignTaskToUser);

// Unassign user from task
router.delete('/:id/assign/:userId', checkRole(['Administrador', 'Líder de Proyecto']), tasksController.unassignUser);

// Add tag to task
router.post('/:id/tags', checkRole(['Administrador', 'Líder de Proyecto']), tasksController.addTag);

// Remove tag from task
router.delete('/:id/tags/:tagId', checkRole(['Administrador', 'Líder de Proyecto']), tasksController.removeTag);

module.exports = router;