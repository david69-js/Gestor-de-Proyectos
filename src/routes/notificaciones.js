const express = require('express');
const router = express.Router();
const { 
    obtenerNotificaciones, 
    marcarComoLeida, 
    obtenerNotificacionesNoLeidas 
} = require('../controllers/notificaciones.controller');

// Obtener todas las notificaciones del usuario
router.get('/', async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const notificaciones = await obtenerNotificaciones(id_usuario);
        res.json(notificaciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las notificaciones' });
    }
});

// Marcar notificación como leída
router.put('/:id/leer', async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const resultado = await marcarComoLeida(req.params.id, id_usuario);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: 'Error al marcar la notificación' });
    }
});

// Obtener notificaciones no leídas
router.get('/no-leidas', async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const notificaciones = await obtenerNotificacionesNoLeidas(id_usuario);
        res.json(notificaciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las notificaciones no leídas' });
    }
});

module.exports = router;