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
    const pool = await getConnection();
    const transaction = pool.transaction();

    try {
        await transaction.begin();

        const result = await transaction.request()
            .input('id', id)
            .input('usuario_id', id_usuario)
            .execute('sp_MarcarNotificacionComoLeida');

        // Verificación adicional
        const verificacion = await transaction.request()
            .input('id', id)
            .query('SELECT leida FROM Notificaciones WHERE id = @id');

        if (!verificacion.recordset[0] || verificacion.recordset[0].leida !== 1) {
            throw new Error('No se pudo verificar el cambio de estado');
        }

        await transaction.commit();
        return { mensaje: 'Notificación marcada como leída' };
    } catch (error) {
        await transaction.rollback();
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