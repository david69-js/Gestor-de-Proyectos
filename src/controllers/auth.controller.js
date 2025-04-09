const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../config/db');

async function registerUser(userData) {
    const { nombre, correo, contrasena, imagen_perfil, numero_telefono, fecha_nacimiento } = userData;
    const pool = await getConnection();

    try {
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

        // Create user without using transaction
        const result = await pool.request()
            .input('nombre', nombre)
            .input('correo', correo)
            .input('contrasena', hashedPassword)
            .input('imagen_perfil', imagen_perfil || null)
            .input('numero_telefono', numero_telefono || null)
            .input('fecha_nacimiento', fecha_nacimiento || null)
            .execute('RegistrarUsuario');

        // Check if result contains the user ID
        const userId = result.recordset[0]?.usuario_id;

        if (!userId) {
            throw new Error('User registration failed, no user ID returned.');
        }

        // Return the user with the ID
        return {
            id_usuario: userId,
            nombre,
            correo,
            imagen_perfil,
            numero_telefono,
            fecha_nacimiento
        };
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




module.exports = {
    registerUser,
    loginUser,
};