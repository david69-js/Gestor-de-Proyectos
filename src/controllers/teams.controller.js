const { getConnection } = require('../config/db');

async function getAllTeams() {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Equipos');
    return result.recordset;
}

async function getTeamById(id) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', id)
        .query('SELECT * FROM Equipos WHERE id = @id');
    return result.recordset[0];
}

async function getTeamMembers(id) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', id)
        .query(`
            SELECT u.id, u.nombre, u.correo, me.fecha_union, me.rol
            FROM Usuarios u
            JOIN Miembros_Equipo me ON u.id = me.usuario_id
            WHERE me.equipo_id = @id
        `);
    return result.recordset;
}

async function createTeam(teamData) {
    const { nombre_equipo, descripcion, miembros } = teamData;
    const pool = await getConnection();
    
    try {
        await pool.request().query('BEGIN TRANSACTION');

        const teamResult = await pool.request()
            .input('nombre_equipo', nombre_equipo)
            .input('descripcion', descripcion)
            .execute('CrearEquipo');

        const teamId = teamResult.recordset[0].id_equipo;

        if (miembros && miembros.length > 0) {
            for (const miembroId of miembros) {
                await pool.request()
                    .input('usuario_id', miembroId)
                    .input('equipo_id', teamId)
                    .execute('AgregarMiembroEquipo');
            }
        }

        await pool.request().query('COMMIT');
        return teamResult.recordset[0];
    } catch (error) {
        await pool.request().query('ROLLBACK');
        throw error;
    }
}

async function updateTeam(id, teamData) {
    const { nombre_equipo, descripcion } = teamData;
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', id)
        .input('nombre_equipo', nombre_equipo)
        .input('descripcion', descripcion)
        .query('UPDATE Equipos SET nombre_equipo = @nombre_equipo, descripcion = @descripcion OUTPUT INSERTED.* WHERE id = @id');
    return result.recordset[0];
}

async function deleteTeam(id) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', id)
        .query('DELETE FROM Equipos OUTPUT DELETED.* WHERE id = @id');
    return result.recordset[0];
}

async function addTeamMember(teamId, userId, rol) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('equipo_id', teamId)
        .input('usuario_id', userId)
        .input('rol', rol)
        .execute('AgregarMiembroEquipo');
    return result.recordset[0];
}

async function removeTeamMember(teamId, userId) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('equipo_id', teamId)
        .input('usuario_id', userId)
        .query('DELETE FROM Miembros_Equipo OUTPUT DELETED.* WHERE equipo_id = @equipo_id AND usuario_id = @usuario_id');
    return result.recordset[0];
}

module.exports = {
    getAllTeams,
    getTeamById,
    getTeamMembers,
    createTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember
};