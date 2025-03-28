const db = require('../config/db');

async function getAllTasks(req, res) {
    try {
        const pool = await getConnection();
        const result = await pool.request().execute('ObtenerTareas');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error getting tasks:', error);
        res.status(500).json({ error: 'Error getting tasks' });
    }
}

async function getTaskById(req, res) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', req.params.id)
            .execute('ObtenerTareaPorId');
        
        if (result.recordset[0]) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (error) {
        console.error('Error getting task:', error);
        res.status(500).json({ error: 'Error getting task' });
    }
}

const { getConnection } = require('../config/db');

async function createTask(req, res) {
    const { proyecto_id, nombre_tarea, descripcion, fecha_limite, estado_id, usuarios } = req.body;
    const pool = await getConnection();
    
    try {
        await pool.request().query('BEGIN TRANSACTION');

        const taskResult = await pool.request()
            .input('proyecto_id', proyecto_id)
            .input('nombre_tarea', nombre_tarea)
            .input('descripcion', descripcion)
            .input('fecha_limite', fecha_limite)
            .input('estado_id', estado_id)
            .execute('CrearTarea');

        const taskId = taskResult.recordset[0].id_tarea;

        if (usuarios && usuarios.length > 0) {
            for (const usuarioId of usuarios) {
                await pool.request()
                    .input('usuario_id', usuarioId)
                    .input('tarea_id', taskId)
                    .execute('AsignarTareaAUsuario');
            }
        }

        await pool.request().query('COMMIT');
        res.status(201).json(taskResult.recordset[0]);
    } catch (error) {
        await pool.request().query('ROLLBACK');
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Error creating task' });
    }
}

async function updateTask(req, res) {
    const { proyecto_id, nombre_tarea, descripcion, fecha_limite, estado_id, usuarios } = req.body;
    const id = req.params.id;
    const pool = await getConnection();
    
    try {
        await pool.request().query('BEGIN TRANSACTION');

        const taskResult = await pool.request()
            .input('id_tarea', id)
            .input('proyecto_id', proyecto_id)
            .input('nombre_tarea', nombre_tarea)
            .input('descripcion', descripcion)
            .input('fecha_limite', fecha_limite)
            .input('estado_id', estado_id)
            .execute('ActualizarTarea');

        if (usuarios && usuarios.length > 0) {
            // First, remove all existing user assignments
            await pool.request()
                .input('tarea_id', id)
                .execute('EliminarAsignacionesUsuario');

            // Then add new user assignments
            for (const usuarioId of usuarios) {
                await pool.request()
                    .input('usuario_id', usuarioId)
                    .input('tarea_id', id)
                    .execute('AsignarTareaAUsuario');
            }
        }

        await pool.request().query('COMMIT');
        res.status(201).json(taskResult.recordset[0]);
    } catch (error) {
        await pool.request().query('ROLLBACK');
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Error creating task' });
    }
}

async function updateTaskStatus(taskId, estado_id) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id_tarea', taskId)
        .input('estado_id', estado_id)
        .execute('ActualizarEstadoTarea');
    return result.recordset[0];
}

async function deleteTask(req, res) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', req.params.id)
            .execute('EliminarTarea');

        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Task deleted successfully' });
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Error deleting task' });
    }
}

async function assignTaskToUser(taskId, userId) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('tarea_id', taskId)
        .input('usuario_id', userId)
        .execute('AsignarTareaAUsuario');
    return result.recordset[0];
}

async function unassignUser(req, res) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('tarea_id', req.params.id)
            .input('usuario_id', req.params.userId)
            .execute('DesasignarUsuarioDeTarea');

        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'User unassigned successfully' });
        } else {
            res.status(404).json({ error: 'Assignment not found' });
        }
    } catch (error) {
        console.error('Error unassigning user:', error);
        res.status(500).json({ error: 'Error unassigning user' });
    }
}

async function addComment(req, res) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('tarea_id', req.params.id)
            .input('usuario_id', req.user.id)
            .input('comentario', req.body.comentario)
            .execute('AgregarComentario');

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Error adding comment' });
    }
}

async function addTag(req, res) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('tarea_id', req.params.id)
            .input('etiqueta_id', req.body.etiqueta_id)
            .execute('AsignarEtiquetaATarea');

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error('Error adding tag:', error);
        res.status(500).json({ error: 'Error adding tag' });
    }
}

async function removeTag(req, res) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('tarea_id', req.params.id)
            .input('etiqueta_id', req.params.tagId)
            .execute('EliminarEtiquetaDeTarea');

        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Tag removed successfully' });
        } else {
            res.status(404).json({ error: 'Tag not found' });
        }
    } catch (error) {
        console.error('Error removing tag:', error);
        res.status(500).json({ error: 'Error removing tag' });
    }
}

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    assignTaskToUser,
    unassignUser,
    addComment,
    addTag,
    removeTag
};