const { getConnection } = require('../config/db');

async function getAllUsers() {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT id, nombre, correo, fecha_registro FROM Usuarios');
        return result.recordset;
    } catch (error) {
        console.error('Error getting users:', error);
        throw error;
    }
}

async function getUserById(id) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', id)
            .query('SELECT id, nombre, correo, fecha_registro FROM Usuarios WHERE id = @id');
        
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

async function createUser(userData) {
    const { nombre, correo, contrasena } = userData;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('nombre', nombre)
            .input('correo', correo)
            .input('contrasena', contrasena)
            .query('INSERT INTO Usuarios (nombre, correo, contrasena) OUTPUT INSERTED.* VALUES (@nombre, @correo, @contrasena)');
        
        const user = result.recordset[0];
        delete user.contrasena; // Don't send password in response
        return user;
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.number === 2627) { // SQL Server unique constraint violation
            throw new Error('Email already exists');
        } else {
            throw error;
        }
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
            .query('UPDATE Usuarios SET nombre = @nombre, correo = @correo OUTPUT INSERTED.* WHERE id = @id');

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
            .query('DELETE FROM Usuarios OUTPUT DELETED.* WHERE id = @id');

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
            .query(`
                SELECT r.id, r.nombre_rol
                FROM Roles r
                INNER JOIN Usuarios_Roles ur ON r.id = ur.rol_id
                WHERE ur.usuario_id = @id
            `);
        return result.recordset;
    } catch (error) {
        console.error('Error getting user roles:', error);
        throw error;
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUserRoles
};