const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../config/db');

async function registerUser(userData) {
    const { nombre, correo, contrasena } = userData;
    try {
        const pool = await getConnection();

        // Check if user already exists
        const userExists = await pool.request()
            .input('correo', correo)
            .query('SELECT 1 FROM Usuarios WHERE correo = @correo');

        if (userExists.recordset.length > 0) {
            throw new Error('User already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        // Create user
        const result = await pool.request()
            .input('nombre', nombre)
            .input('correo', correo)
            .input('contrasena', hashedPassword)
            .query('INSERT INTO Usuarios (nombre, correo, contrasena) OUTPUT INSERTED.* VALUES (@nombre, @correo, @contrasena)');

        const user = result.recordset[0];
        delete user.contrasena;

        // Assign default role (Miembro del Equipo)
        await pool.request()
            .input('usuario_id', user.id)
            .query(`
                INSERT INTO Usuarios_Roles (usuario_id, rol_id)
                SELECT @usuario_id, id FROM Roles WHERE nombre_rol = 'Miembro del Equipo'
            `);

        return user;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
}

async function loginUser(userData) {
    const { correo, contrasena } = userData;
    try {
        const pool = await getConnection();

        // Get user
        const result = await pool.request()
            .input('correo', correo)
            .query('SELECT * FROM Usuarios WHERE correo = @correo');

        if (result.recordset.length === 0) {
            throw new Error('Invalid credentials');
        }

        const user = result.recordset[0];

        // Verify password
        const validPassword = await bcrypt.compare(contrasena, user.contrasena);
        if (!validPassword) {
            throw new Error('Invalid credentials');
        }

        // Get user roles
        const roles = await pool.request()
            .input('usuario_id', user.id)
            .query(`
                SELECT r.nombre_rol
                FROM Roles r
                INNER JOIN Usuarios_Roles ur ON r.id = ur.rol_id
                WHERE ur.usuario_id = @usuario_id
            `);

        // Create token
        const token = jwt.sign(
            { 
                id: user.id,
                roles: roles.recordset.map(r => r.nombre_rol)
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        delete user.contrasena;
        return {
            user,
            token,
            roles: roles.recordset.map(r => r.nombre_rol)
        };
    } catch (error) {
        console.error('Error logging in:', error);
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
            .query('SELECT * FROM Usuarios WHERE id = @id');

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
        await pool.request()
            .input('id', userId)
            .input('contrasena', hashedPassword)
            .query('UPDATE Usuarios SET contrasena = @contrasena WHERE id = @id');

        return { message: 'Password updated successfully' };
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
}

module.exports = {
    registerUser,
    loginUser,
    changePassword
};