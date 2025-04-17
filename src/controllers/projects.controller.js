const { getConnection } = require('../config/db');

async function getAllProjects(user) {
    let id_organizacion;
    try {
        id_organizacion = user.id_organizacion;

        const pool = await getConnection();
        const result = await pool.request()
        .input('id_organizacion', id_organizacion)
        .execute('sp_ObtenerProyectosPorOrganizacion');

        return result.recordset;
    } catch (error) {
        console.error('Error getting all projects:', error);
        throw error;
    }
}

async function getProjectById(id, user) {
    
    let organizacion_id;
    try {
        organizacion_id = user.id_organizacion;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_proyecto', id)
            .input('id_organizacion', organizacion_id)
            .execute('sp_ObtenerProyectoPorId');

        if (!result.recordset[0]) return null;

        const project = result.recordset[0];
        const tasks = result.recordsets[1];

        return {
            ...project,
            tasks: tasks
        };
    } catch (error) {
        console.error('Error getting project by id:', error);
        throw error;
    }
}

async function createProject(projectData, token) {
    const { nombre_proyecto, descripcion, fecha_fin } = projectData;

    // Decodificar el token y obtener el id_usuario
    let id_usuario;
    let id_organizacion;
    try {
        id_usuario = token.id; 
        id_organizacion = token.id_organizacion;

    } catch (error) {
        console.error('Crendenciales invalidas:', error);
        throw new Error('Crendenciales invalidas o expiradas');
    }

    const pool = await getConnection();
    let transaction = null;
    
    try {
         transaction = pool.transaction();
        await transaction.begin();

        const request = transaction.request();
        const projectResult = await request
            .input('nombre_proyecto', nombre_proyecto)
            .input('descripcion', descripcion)
            .input('fecha_fin', fecha_fin)
            .input('id_usuario', id_usuario)  // Pasar el id_usuario al procedimiento
            .input('id_organizacion', id_organizacion)
            .execute('sp_CrearProyecto');


        // Confirmar la transacción después de la ejecución exitosa
        await transaction.commit();

        return projectResult.recordset[0];  // Devuelve el proyecto creado
    } catch (error) {
        // Revertir en caso de error
        if (transaction) {
            await transaction.rollback();
        }
        console.error('Error creando el proyecto:', error);
        throw error;
    }
}

async function updateProject(id, projectData, token) {
    try {
        const { nombre_proyecto, descripcion, fecha_fin } = projectData;
        const id_organizacion = token.id_organizacion;
        
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_proyecto', id)
            .input('nombre_proyecto', nombre_proyecto)
            .input('descripcion', descripcion)
            .input('fecha_fin', fecha_fin)
            .input('id_organizacion', id_organizacion)
            .execute('sp_ActualizarProyecto');
            
        return result.recordset[0];
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
}

async function deleteProject(id, token) {
    try {
        const id_organizacion = token.id_organizacion;
        const pool = await getConnection();
        await pool.request()
            .input('id_proyecto', id)
            .input('id_organizacion', id_organizacion)
            .execute('sp_EliminarProyecto');
        return { message: 'Project deleted successfully' };
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
}

async function addParticipant(projectId, userId, token) {
    try {
        const id_organizacion = token.id_organizacion;
        const rol = token.rol;
        const pool = await getConnection();
        const result = await pool.request()
            .input('proyecto_id', projectId)
            .input('id_usuario', userId)
            .input('id_organizacion', id_organizacion)
            .input('rol', rol)
            .execute('sp_AgregarParticipante');
        return result.recordset[0];
    } catch (error) {
        console.error('Error adding participant:', error);
        throw error;
    }
}

async function removeParticipant(projectId, userId, token) {
    try {
        const id_organizacion = token.id_organizacion;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_proyecto', projectId)
            .input('id_usuario', userId)
            .input('id_organizacion', id_organizacion)
            .execute('sp_EliminarParticipante');
        return result.recordset[0];
    } catch (error) {
        console.error('Error removing participant:', error);
        throw error;
    }
}

async function getUsersByProject(projectId, token) {
    try {
        const id_organizacion = token.id_organizacion;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_proyecto', projectId)
            .input('id_organizacion', id_organizacion)
            .execute('sp_ObtenerUsuariosPorProyecto');
        return result.recordset;
    } catch (error) {
        console.error('Error removing participant:', error);
        throw error;
    }
}


async function getTasksByProject(projectId, token) {
    try {
        const id_organizacion = token.id_organizacion;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_proyecto', projectId)
            .input('id_usuario', userId)
            .input('id_organizacion', id_organizacion)
            .execute('sp_EliminarParticipante');
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
    removeParticipant,
    getUsersByProject
};