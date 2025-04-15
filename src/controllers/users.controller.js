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
            .execute('sp_CompararContrasenaPorId');

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
            .execute('sp_CambiarContrasena');

        return { message: 'Password updated successfully' };
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
}

async function deleteUser(id) {
    try {
        const pool = await getConnection();

        // Eliminar el usuario
        const result = await pool.request()
            .input('id_usuario', id)
            .execute('EliminarUsuario');

        if (result.rowsAffected[0] > 0) {
            return { message: 'User and related records deleted successfully' };
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

async function updateUserDetails(userId, userDetails) {
    const { nombre ,imagen_perfil, numero_telefono, fecha_nacimiento } = userDetails;
    const pool = await getConnection();

    try {
        // Update user details using the stored procedure
        await pool.request()
            .input('id', userId)
            .input('nombre', nombre)
            .input('imagen_perfil', imagen_perfil || null)
            .input('numero_telefono', numero_telefono || null)
            .input('fecha_nacimiento', fecha_nacimiento || null)
            .execute('ActualizarUsuario');

        console.log('User details updated successfully');
    } catch (error) {
        console.error('Error updating user details:', error);
        throw error;
    }
}
module.exports = {
    getUserById,
    deleteUser,
    changePassword,
    updateUserDetails
};