const express = require('express');
const router = express.Router();
const { 
    getProjectProgressReport,
    getTimeTrackingReport,
    getUserParticipationReport
} = require('../controllers/reports.controller');

// Reporte de progreso de proyectos (por proyecto u organización)
router.get('/projects/:projectId/progress', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { organizationId } = req.query;
        const report = await getProjectProgressReport(projectId, organizationId);
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'Error al generar el reporte de progreso' });
    }
});

// Reporte de seguimiento de tiempo (por usuario o proyecto)
router.get('/time-tracking', async (req, res) => {
    try {
        const { userId, startDate, endDate, projectId } = req.query;
        const report = await getTimeTrackingReport(userId, startDate, endDate, projectId);
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'Error al generar el reporte de tiempo' });
    }
});

// Reporte de participación de usuarios (por organización o proyecto)
router.get('/user-participation', async (req, res) => {
    try {
        const { organizationId, projectId } = req.query;
        const report = await getUserParticipationReport(organizationId, projectId);
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'Error al generar el reporte de participación' });
    }
});

module.exports = router;