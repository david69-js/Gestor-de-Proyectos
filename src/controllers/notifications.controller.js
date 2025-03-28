const { getConnection } = require('../config/db');

async function getUserNotifications(req, res) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('usuario_id', req.params.userId)
            .execute('ObtenerNotificacionesUsuario');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error getting user notifications:', error);
        res.status(500).json({ error: 'Error getting user notifications' });
    }
}

async function getUnreadNotificationsCount(req, res) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('usuario_id', req.params.userId)
            .query(`
                SELECT COUNT(*) as unread_count
                FROM Notificaciones
                WHERE usuario_id = @usuario_id AND leida = 0
            `);
        res.json({ unread_count: result.recordset[0].unread_count });
    } catch (error) {
        console.error('Error getting unread notifications count:', error);
        res.status(500).json({ error: 'Error getting unread notifications count' });
    }
}

async function createNotification(req, res) {
    const { usuario_id, mensaje } = req.body;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('usuario_id', usuario_id)
            .input('mensaje', mensaje)
            .execute('CrearNotificacion');

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: 'Error creating notification' });
    }
}

async function markNotificationAsRead(req, res) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', req.params.id)
            .query('UPDATE Notificaciones SET leida = 1 OUTPUT INSERTED.* WHERE id = @id');

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ error: 'Notification not found' });
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Error marking notification as read' });
    }
}

async function deleteNotification(req, res) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', req.params.id)
            .query('DELETE FROM Notificaciones OUTPUT DELETED.* WHERE id = @id');

        if (result.recordset.length > 0) {
            res.json({ message: 'Notification deleted successfully' });
        } else {
            res.status(404).json({ error: 'Notification not found' });
        }
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Error deleting notification' });
    }
}

module.exports = {
    getUserNotifications,
    getUnreadNotificationsCount,
    createNotification,
    markNotificationAsRead,
    deleteNotification
};