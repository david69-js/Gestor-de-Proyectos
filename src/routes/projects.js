const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects.controller');

// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await projectsController.getAllProjects(req.user);
        res.json(projects);
    } catch (error) {
        console.error('Error getting all projects:', error);
        res.status(500).json({ error: 'Error retrieving projects' });
    }
});

// Get project by ID with details
router.get('/:id', async (req, res) => {
    try {
        const project = await projectsController.getProjectById(req.params.id, req.user);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        console.error('Error getting project by id:', error);
        res.status(500).json({ error: 'Error retrieving project' });
    }
});

router.post('/', async (req, res) => {
    try {
        const newProject = await projectsController.createProject(req.body, req.user);
        res.status(201).json(newProject);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Error creating project' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedProject = await projectsController.updateProject(req.params.id, req.body, req.user);
        if (!updatedProject) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Error updating project' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedProject = await projectsController.deleteProject(req.params.id, req.user);
        if (!deletedProject) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(deletedProject);
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Error deleting project' });
    }
});

// Add participant to project
router.post('/:id/participants', async (req, res) => {
    try {
        const { userId } = req.body;
        const projectId = req.params.id;
        const result = await projectsController.addParticipant(projectId, userId, req.user);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error adding participant:', error);
        res.status(500).json({ error: 'Error adding participant to project' });
    }
});

// Remove participant from project
router.delete('/:id/participants/:userId', async (req, res) => {
    try {
        const { id, userId } = req.params;
        const result = await projectsController.removeParticipant(id, userId, req.user);
        res.json(result);
    } catch (error) {
        console.error('Error removing participant:', error);
        res.status(500).json({ error: 'Error removing participant from project' });
    }
});

module.exports = router;