const { getConnection } = require('../config/db');

async function getAllTasksByOrganizacion(projectId, id_organizacion) {
    try {

        const pool = await getConnection();
        const result = await pool.request()
        .input('id_proyecto', projectId)
        .input('id_organizacion', id_organizacion)
        .execute('sp_ObtenerTareasPorOrganizacion');
        
        return result.recordset;
    } catch (error) {
        console.error('Error getting tasks:', error);
        res.status(500).json({ error: 'Error getting tasks' });
    }
}

async function getTaskById(projectId, id_organizacion, id_tarea) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
        .input('id_proyecto', projectId)
        .input('id_organizacion', id_organizacion)
        .input('id_tarea', id_tarea)
        .execute('sp_ObtenerTareaIdPorOrganizacion');
        
        if (result.recordset[0]) {
           result.recordset[0];
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (error) {
        console.error('Error getting task:', error);
        res.status(500).json({ error: 'Error getting task' });
    }
}


async function createTaskByProjectOrg(tarea, id_project, id_organizacion, id_usuario) {
    const { nombre_tarea, descripcion, fecha_limite, estado_id } = tarea;

    if (!id_usuario || !id_organizacion || !id_project) {
        throw new Error('Credenciales inválidas o expiradas');
    }

    const pool = await getConnection();
    let transaction = null;

    try {
        transaction = pool.transaction();
        await transaction.begin();
        console.log('Transacción iniciada correctamente');

        const request = transaction.request();
        const taskResult = await request
            .input('id_proyecto', id_project)
            .input('id_organizacion', id_organizacion)
            .input('id_usuario', id_usuario)
            .input('nombre_tarea', nombre_tarea)
            .input('descripcion', descripcion)
            .input('fecha_limite', fecha_limite)
            .input('estado_id', estado_id)
            .execute('sp_CrearTarea');

        await transaction.commit();
        console.log('Transacción completada correctamente');

        return taskResult.recordset;
    } catch (error) {
        if (transaction && transaction._aborted !== true) {
            try {
                console.log('Error detectado, realizando rollback...');
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Error haciendo rollback:', rollbackError);
            }
        }
        console.error('Error creando tarea:', error);
        throw error;
    }
}


async function updateTaskByProjectOrg(taskData, id_project, id_tarea, id_organizacion, id_usuario) {
    const { nombre_tarea, descripcion, fecha_limite, estado_id } = taskData;
    const pool = await getConnection();
    let transaction = null;

    try {
        transaction = pool.transaction();
        await transaction.begin();

        const request = transaction.request();
        const taskResult = await request
            .input('id_tarea', id_tarea)
            .input('id_proyecto', id_project)
            .input('id_organizacion', id_organizacion)
            .input('nombre_tarea', nombre_tarea)
            .input('descripcion', descripcion)
            .input('fecha_limite', fecha_limite)
            .input('estado_id', estado_id)
            .execute('sp_ActualizarTarea');

        await transaction.commit();
        return taskResult.recordset[0];
    } catch (error) {
        if (transaction && transaction._aborted !== true) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Error during rollback:', rollbackError);
            }
        }
        throw error;
    }
}

async function deleteTaskByProjectOrg(id_tarea, id_project, id_organizacion, id_usuario) {
    const pool = await getConnection();
    const transaction = pool.transaction();

    try {
        await transaction.begin();
        
        const result = await transaction.request()
            .input('id_tarea', id_tarea)
            .input('id_proyecto', id_project)
            .input('id_organizacion', id_organizacion)
            .execute('sp_EliminarTarea');

        // Verificación adicional
        const verificacion = await transaction.request()
            .input('id_tarea', id_tarea)
            .query('SELECT COUNT(*) as existe FROM Tareas WHERE id = @id_tarea');

        if (verificacion.recordset[0].existe > 0) {
            throw new Error('No se pudo verificar la eliminación');
        }

        await transaction.commit();
        return result.recordset[0];
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting task:', error);
        throw error;
    }
}

async function assignTaskToUser(id_tarea, id_usuario, id_project, id_organizacion) {
    const pool = await getConnection();
    const transaction = pool.transaction();

    try {
        await transaction.begin();
        
        const result = await transaction.request()
            .input('id_tarea', id_tarea)
            .input('id_usuario', id_usuario)
            .input('id_proyecto', id_project)
            .input('id_organizacion', id_organizacion)
            .execute('sp_AsignarUsuarioATarea');

        // Verificación adicional
        const verificacion = await transaction.request()
            .input('id_tarea', id_tarea)
            .input('id_usuario', id_usuario)
            .query('SELECT COUNT(*) as existe FROM Tareas_Usuarios WHERE id_tarea = @id_tarea AND id_usuario = @id_usuario');

        if (!verificacion.recordset[0].existe > 0) {
            throw new Error('No se pudo verificar la asignación');
        }

        await transaction.commit();
        return result.recordset;
    } catch (error) {
        await transaction.rollback();
        console.error('Error assigning user to task:', error);
        throw error;
    }
}

async function unassignTaskFromUser(id_tarea, id_usuario, id_project, id_organizacion) {
    const pool = await getConnection();
    const transaction = pool.transaction();

    try {
        await transaction.begin();
        
        const result = await transaction.request()
            .input('id_tarea', id_tarea)
            .input('id_usuario', id_usuario)
            .input('id_proyecto', id_project)
            .input('id_organizacion', id_organizacion)
            .execute('sp_DesasignarUsuarioTarea');

        // Verificación adicional
        const verificacion = await transaction.request()
            .input('id_tarea', id_tarea)
            .input('id_usuario', id_usuario)
            .query('SELECT COUNT(*) as existe FROM Tareas_Usuarios WHERE id_tarea = @id_tarea AND id_usuario = @id_usuario');

        if (verificacion.recordset[0].existe > 0) {
            throw new Error('No se pudo verificar la desasignación');
        }

        await transaction.commit();
        return result.recordset[0];
    } catch (error) {
        await transaction.rollback();
        console.error('Error unassigning user from task:', error);
        throw error;
    }
}

async function addComment(comentario, id_tarea, id_project, id_organizacion, id_usuario) {
    const pool = await getConnection();
    const transaction = pool.transaction();

    try {
        await transaction.begin();
        
        const result = await transaction.request()
            .input('id_tarea', id_tarea)
            .input('id_usuario', id_usuario)
            .input('id_proyecto', id_project)
            .input('id_organizacion', id_organizacion)
            .input('comentario', comentario)
            .execute('sp_AgregarComentario');

        // Verificación adicional
        const verificacion = await transaction.request()
            .input('id_tarea', id_tarea)
            .input('id_usuario', id_usuario)
            .query('SELECT COUNT(*) as existe FROM Comentarios WHERE id_tarea = @id_tarea AND id_usuario = @id_usuario');

        if (!verificacion.recordset[0].existe > 0) {
            throw new Error('No se pudo verificar el comentario');
        }

        await transaction.commit();
        return result.recordset[0];
    } catch (error) {
        await transaction.rollback();
        console.error('Error adding comment:', error);
        throw error;
    }
}


module.exports = {
    getAllTasksByOrganizacion,
    getTaskById,
    createTaskByProjectOrg,
    updateTaskByProjectOrg,
    deleteTaskByProjectOrg,
    assignTaskToUser,
    addComment,
    unassignTaskFromUser  // Add the new function to exports
};