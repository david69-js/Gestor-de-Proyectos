const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');

// Get all tasks
router.get('/project/:projectId/tareas', async (req, res) => {
    try {
        const id_project = req.params.projectId;
        const id_organizacion = req.user.id_organizacion;
        const tasks = await tasksController.getAllTasksByOrganizacion(id_project, id_organizacion);
        res.json(tasks);
    } catch (error) {
        console.error('Error getting all projects:', error);
        res.status(500).json({ error: 'Error retrieving projects' });
    }
});

router.get('/project/:projectId/tareas/:tareaId', async (req, res) => {
    try {
        const id_project = req.params.projectId;
        const id_tarea = req.params.tareaId;
        const id_organizacion = req.user.id_organizacion;
        const task = await tasksController.getTaskById(id_project, id_organizacion, id_tarea);
        res.status(201).json(task);
    } catch (error) {
        console.error('Error getting task:', error);
        res.status(500).json({ error: 'Error retrieving task' });
    }
});

router.post('/project/:projecId/tareas', async (req, res) => {
    try {
        const id_project = req.params.projecId;
        const id = req.user.id;
        const id_organizacion = req.user.id_organizacion;
        const newTask = await tasksController.createTaskByProjectOrg(req.body, id_project, id_organizacion, id);
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        if (error.message === 'Credenciales inválidas o expiradas') {
            res.status(401).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error creating task' });
        }
    }
});

// Update task
router.put('/project/:projectId/tareas/:tareaId', async (req, res) => {
    try {
        const id_project = req.params.projectId;
        const id_tarea = req.params.tareaId;
        const {id_organizacion, id} = req.user;
        
        const updatedTask = await tasksController.updateTaskByProjectOrg(req.body, id_project, id_tarea, id_organizacion, id);
        res.status(200).json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        if (error.message === 'Credenciales inválidas o expiradas') {
            res.status(401).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error updating task' });
        }
    }
});

// Delete task
router.delete('/project/:projectId/tareas/:tareaId', async (req, res) => {
    try {
        const id_project = req.params.projectId;
        const id_tarea = req.params.tareaId;
        const {id_organizacion, id} = req.user;
        
        const result = await tasksController.deleteTaskByProjectOrg(id_tarea, id_project, id_organizacion, id);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error deleting task:', error);
        if (error.message === 'Credenciales inválidas o expiradas') {
            res.status(401).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error deleting task' });
        }
    }
});

router.post('/project/:projectId/tareas/:tareaId/usuario/:userId', async (req, res) => {
    try {
        const {id_organizacion } = req.user;
        const {tareaId, userId, projectId} = req.params;
        
        const result = await tasksController.assignTaskToUser(tareaId, userId, projectId, id_organizacion);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error assigning user to task:', error);
        if (error.message === 'Credenciales inválidas o expiradas') {
            res.status(401).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error assigning user to task' });
        }
    }
});

// Unassign user from task
router.delete('/project/:projectId/tareas/:tareaId/usuario/:userId', async (req, res) => {
    try {
        const {id_organizacion} = req.user;
        const {tareaId, userId, projectId} = req.params;
        
        const result = await tasksController.unassignTaskFromUser(tareaId, userId, projectId, id_organizacion);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error unassigning user from task:', error);
        if (error.message === 'Credenciales inválidas o expiradas') {
            res.status(401).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error unassigning user from task' });
        }
    }
});

// Add comment to task
router.post('/project/:projectId/tareas/:tareaId/comentarios', async (req, res) => {
    try {
        const {id_organizacion, id} = req.user;
        const {tareaId, projectId} = req.params;
        
        const result = await tasksController.addComment(req.body.comentario, tareaId, projectId, id_organizacion, id);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error adding comment:', error);
        if (error.message === 'Credenciales inválidas o expiradas') {
            res.status(401).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error adding comment' });
        }
    }
});



module.exports = router;