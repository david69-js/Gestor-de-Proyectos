const { getConnection } = require('../config/db');

async function getAllProjects() {
    try {
        const pool = await getConnection();
        const result = await pool.request().execute('ObtenerProyectos');

        return result.recordset;
    } catch (error) {
        console.error('Error getting all projects:', error);
        throw error;
    }
}

async function getProjectById(id) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_proyecto', id)
            .execute('ObtenerProyectoPorId');

        if (!result.recordset[0]) return null;

        const project = result.recordset[0];
        const tasks = result.recordsets[1];
        const participants = result.recordsets[2];

        return {
            ...project,
            tasks: tasks,
            participants: participants
        };
    } catch (error) {
        console.error('Error getting project by id:', error);
        throw error;
    }
}

async function createProject(projectData) {
    const { nombre_proyecto, descripcion, fecha_fin } = projectData;
    const pool = await getConnection();
    
    try {
        const transaction = pool.transaction();
        await transaction.begin();

        const request = transaction.request();
        const projectResult = await request
            .input('nombre_proyecto', nombre_proyecto)
            .input('descripcion', descripcion)
            .input('fecha_fin', fecha_fin)
            .execute('CrearProyecto');

        const projectId = projectResult.recordset[0].id_proyecto;

        // Ensure transaction is committed after successful execution
        await transaction.commit();
        return projectResult.recordset[0];
    } catch (error) {
        // Rollback transaction in case of error
        if (transaction) {
            await transaction.rollback();
        }
        console.error('Error creating project:', error);
        throw error;
    }
}

async function updateProject(id, projectData) {
    try {
        const { nombre_proyecto, descripcion, fecha_inicio, fecha_fin } = projectData;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', id)
            .input('nombre_proyecto', nombre_proyecto)
            .input('descripcion', descripcion)
            .input('fecha_inicio', fecha_inicio)
            .input('fecha_fin', fecha_fin)
            .execute('ActualizarProyecto');
        return result.recordset[0];
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
}

async function deleteProject(id) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', id)
            .execute('EliminarProyecto');
        return result.recordset[0];
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
}

async function addParticipant(projectId, userId) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('proyecto_id', projectId)
            .input('usuario_id', userId)
            .execute('AgregarParticipante');
        return result.recordset[0];
    } catch (error) {
        console.error('Error adding participant:', error);
        throw error;
    }
}

async function removeParticipant(projectId, userId) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('proyecto_id', projectId)
            .input('usuario_id', userId)
            .execute('EliminarParticipante');
        return result.recordset[0];
    } catch (error) {
        console.error('Error removing participant:', error);
        throw error;
    }
}

module.exports = {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addParticipant,
    removeParticipant
};