const express = require('express');
const router = express.Router();
const { enviarInvitacion } = require('../utils/invitations');

// Endpoint to send an invitation
router.post('/send-invitation', async (req, res) => {
    const { correo, codigo } = req.body;
    try {
        await enviarInvitacion(correo, codigo);
        res.status(200).json({ message: 'Invitation sent successfully' });
    } catch (error) {
        console.error('Error sending invitation:', error);
        res.status(500).json({ error: 'Error sending invitation' });
    }
});

module.exports = router;