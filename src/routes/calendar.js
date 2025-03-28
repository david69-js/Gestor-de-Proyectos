const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');

// Get all calendar events
router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT ec.*, u.nombre as nombre_usuario
            FROM Eventos_Calendar ec
            JOIN Usuarios u ON ec.usuario_id = u.id
            ORDER BY ec.fecha_evento
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error getting calendar events:', error);
        res.status(500).json({ error: 'Error getting calendar events' });
    }
});

// Get calendar events by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('usuario_id', req.params.userId)
            .query(`
                SELECT ec.*, u.nombre as nombre_usuario
                FROM Eventos_Calendar ec
                JOIN Usuarios u ON ec.usuario_id = u.id
                WHERE ec.usuario_id = @usuario_id
                ORDER BY ec.fecha_evento
            `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error getting user calendar events:', error);
        res.status(500).json({ error: 'Error getting user calendar events' });
    }
});

// Get calendar events by date range
router.get('/range', async (req, res) => {
    const { start_date, end_date } = req.query;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('start_date', new Date(start_date))
            .input('end_date', new Date(end_date))
            .query(`
                SELECT ec.*, u.nombre as nombre_usuario
                FROM Eventos_Calendar ec
                JOIN Usuarios u ON ec.usuario_id = u.id
                WHERE ec.fecha_evento BETWEEN @start_date AND @end_date
                ORDER BY ec.fecha_evento
            `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error getting calendar events by range:', error);
        res.status(500).json({ error: 'Error getting calendar events by range' });
    }
});

// Get calendar event by ID
router.get('/:id', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', req.params.id)
            .query(`
                SELECT ec.*, u.nombre as nombre_usuario
                FROM Eventos_Calendar ec
                JOIN Usuarios u ON ec.usuario_id = u.id
                WHERE ec.id = @id
            `);

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ error: 'Calendar event not found' });
        }
    } catch (error) {
        console.error('Error getting calendar event:', error);
        res.status(500).json({ error: 'Error getting calendar event' });
    }
});

// Create new calendar event
router.post('/', async (req, res) => {
    const { nombre_evento, descripcion, fecha_evento, usuario_id } = req.body;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('nombre_evento', nombre_evento)
            .input('descripcion', descripcion)
            .input('fecha_evento', new Date(fecha_evento))
            .input('usuario_id', usuario_id)
            .query('INSERT INTO Eventos_Calendar (nombre_evento, descripcion, fecha_evento, usuario_id) OUTPUT INSERTED.* VALUES (@nombre_evento, @descripcion, @fecha_evento, @usuario_id)');

        // Create notification for the event
        await pool.request()
            .input('usuario_id', usuario_id)
            .input('mensaje', `Nuevo evento creado: ${nombre_evento}`)
            .query('INSERT INTO Notificaciones (usuario_id, mensaje) VALUES (@usuario_id, @mensaje)');

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error('Error creating calendar event:', error);
        res.status(500).json({ error: 'Error creating calendar event' });
    }
});

// Update calendar event
router.put('/:id', async (req, res) => {
    const { nombre_evento, descripcion, fecha_evento } = req.body;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', req.params.id)
            .input('nombre_evento', nombre_evento)
            .input('descripcion', descripcion)
            .input('fecha_evento', new Date(fecha_evento))
            .query('UPDATE Eventos_Calendar SET nombre_evento = @nombre_evento, descripcion = @descripcion, fecha_evento = @fecha_evento OUTPUT INSERTED.* WHERE id = @id');

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ error: 'Calendar event not found' });
        }
    } catch (error) {
        console.error('Error updating calendar event:', error);
        res.status(500).json({ error: 'Error updating calendar event' });
    }
});

// Delete calendar event
router.delete('/:id', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', req.params.id)
            .query('DELETE FROM Eventos_Calendar OUTPUT DELETED.* WHERE id = @id');

        if (result.recordset.length > 0) {
            res.json({ message: 'Calendar event deleted successfully' });
        } else {
            res.status(404).json({ error: 'Calendar event not found' });
        }
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        res.status(500).json({ error: 'Error deleting calendar event' });
    }
});

module.exports = router;