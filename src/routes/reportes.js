const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');

// Ruta para reporte de progreso de proyectos
router.get('/projects/:projectId/progress', reportsController.getProjectProgressReport);

// Ruta para reporte de tiempo/tareas
router.get('/users/:userId/time-tracking', reportsController.getTimeTrackingReport);

// Ruta para reporte de participación de usuarios
router.get('/organizations/:organizationId/user-participation', reportsController.getUserParticipationReport);

module.exports = router;