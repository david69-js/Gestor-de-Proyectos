const { getConnection } = require('../config/db');
const bcrypt = require('bcryptjs');

async function getUserById(id, id_organizacion) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_usuario', id)
            .input('id_organizacion', id_organizacion)
            .execute('sp_ObtenerUsuarioPorId');
        
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
    const pool = await getConnection();
    const transaction = pool.transaction();

    try {
        await transaction.begin();

        // Get current user
        const user = await transaction.request()
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

        // Update password
        await transaction.request()
            .input('userId', userId)
            .input('nueva_contrasena', hashedPassword)
            .execute('sp_CambiarContrasena');

        await transaction.commit();
        return { message: 'Password updated successfully' };
    } catch (error) {
        await transaction.rollback();
        console.error('Error changing password:', error);
        throw error;
    }
}

async function deleteUser(userId) {
    const pool = await getConnection();
    const transaction = pool.transaction();

    try {
        await transaction.begin();

        const result = await transaction.request()
            .input('id_usuario', userId)
            .execute('sp_EliminarUsuario');

        if (result.rowsAffected[0] > 0) {
            await transaction.commit();
            return { message: 'User and related records deleted successfully' };
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting user:', error);
        throw error;
    }
}

async function updateUserDetails(userId, userDetails) {
    const { nombre, imagen_perfil, numero_telefono, fecha_nacimiento } = userDetails;
    const pool = await getConnection();
    const transaction = pool.transaction();

    try {
        await transaction.begin();

        await transaction.request()
            .input('id', userId)
            .input('nombre', nombre || null)
            .input('imagen_perfil', imagen_perfil || null)
            .input('numero_telefono', numero_telefono || null)
            .input('fecha_nacimiento', fecha_nacimiento || null)
            .execute('sp_ActualizarUsuario');

        await transaction.commit();
        console.log('User details updated successfully');
    } catch (error) {
        await transaction.rollback();
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