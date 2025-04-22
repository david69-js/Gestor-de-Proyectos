const { getConnection } = require('../config/db');

async function obtenerNotificaciones(id_usuario) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('usuario_id', id_usuario)
            .execute('sp_ObtenerNotificaciones');
        
        return result.recordset;
    } catch (error) {
        console.error('Error al obtener las notificaciones:', error);
        throw error;
    }
}

async function marcarComoLeida(id, id_usuario) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', id)
            .input('usuario_id', id_usuario)
            .execute('sp_MarcarNotificacionComoLeida');
        
        return { mensaje: 'Notificación marcada como leída' };
    } catch (error) {
        console.error('Error al marcar la notificación:', error);
        throw error;
    }
}

async function obtenerNotificacionesNoLeidas(id_usuario) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('usuario_id', id_usuario)
            .execute('sp_ObtenerNotificacionesNoLeidas');
        
        return result.recordset;
    } catch (error) {
        console.error('Error al obtener las notificaciones no leídas:', error);
        throw error;
    }
}

module.exports = {
    obtenerNotificaciones,
    marcarComoLeida,
    obtenerNotificacionesNoLeidas
};