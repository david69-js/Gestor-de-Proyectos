const { getConnection } = require('../config/db');
const bcrypt = require('bcryptjs');

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

async function changePassword(userId, passwordData) {
    const { contrasena_actual, nueva_contrasena } = passwordData;
    try {
        const pool = await getConnection();

        // Get current user
        const user = await pool.request()
            .input('id', userId)
            .query('SELECT contrasena FROM Usuarios WHERE id = @id');

        if (user.recordset.length === 0) {
            throw new Error('User not found');
        }

        // Verify current password
        const validPassword = await bcrypt.compare(contrasena_actual, user.recordset[0].contrasena);
        if (!validPassword) {
            throw new Error('Current password is incorrect');
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nueva_contrasena, salt);

        // Update password using stored procedure
        await pool.request()
            .input('userId', userId)
            .input('nueva_contrasena', hashedPassword)
            .execute('CambiarContrasena');

        return { message: 'Password updated successfully' };
    } catch (error) {
        console.error('Error changing password:', error);
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
    changePassword,
    getUserRoles
};