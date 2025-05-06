const express = require('express');
const router = express.Router();
const { 
    getProjectProgressReport,
} = require('../controllers/reports.controller');

// Reporte de progreso de proyectos (por proyecto u organización)
router.get('/projects/:projectId/progress/:organizacionId', async (req, res) => {
    try {
        const { projectId, organizacionId } = req.params;
        console.log(projectId, organizacionId);
        const report = await getProjectProgressReport(projectId, organizacionId);
        return res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'Error al generar el reporte de progreso' });
    }
});

module.exports = router;