const { getConnection } = require('../config/db');

async function getUserById(id) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', id)
            .execute('ObtenerUsuarioPorId');
        
        if (result.recordset.length > 0) {
            return result.recordset[0];
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error getting user:', error);
        throw error;
    }
}

async function updateUser(id, userData) {
    const { nombre, correo } = userData;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', id)
            .input('nombre', nombre)
            .input('correo', correo)
            .execute('ActualizarUsuario');

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            delete user.contrasena;
            return user;
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        if (error.number === 2627) {
            throw new Error('Email already exists');
        } else {
            throw error;
        }
    }
}

async function deleteUser(id) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', id)
            .execute('EliminarUsuario');

        if (result.recordset.length > 0) {
            return { message: 'User deleted successfully' };
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

async function getUserRoles(id) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', id)
            .execute('ObtenerRolesDeUsuario');
        return result.recordset;
    } catch (error) {
        console.error('Error getting user roles:', error);
        throw error;
    }
}

module.exports = {
    getUserById,
    updateUser,
    deleteUser,
    getUserRoles
};