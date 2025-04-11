const express = require('express');
const { createInvitation } = require('../controllers/invtaciones'); // Corrected import

const router = express.Router();

// Crear una invitación
router.post('/crear-invitacion', createInvitation);

module.exports = router;