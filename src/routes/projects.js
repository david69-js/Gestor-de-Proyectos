const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects.controller');

// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await projectsController.getAllProjects();
        res.json(projects);
    } catch (error) {
        console.error('Error getting all projects:', error);
        res.status(500).json({ error: 'Error retrieving projects' });
    }
});

// Get project by ID with details
router.get('/:id', async (req, res) => {
    try {
        const project = await projectsController.getProjectById(req.params.id);
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
        const newProject = await projectsController.createProject(req.body, req.headers.authorization?.split(' ')[1]);
        res.status(201).json(newProject);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Error creating project' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedProject = await projectsController.updateProject(req.params.id, req.body);
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
        const deletedProject = await projectsController.deleteProject(req.params.id);
        if (!deletedProject) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(deletedProject);
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Error deleting project' });
    }
});

module.exports = router;