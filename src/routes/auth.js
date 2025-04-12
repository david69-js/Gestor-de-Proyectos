const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql'); // Add this line to import the mssql module
const { getConnection } = require('../config/db');

// Register new user - Update the stored procedure execution
router.post('/register', async (req, res) => {
    const { nombre, correo, contrasena } = req.body;
    try {
        const pool = await getConnection();

        // Check if user already exists
        const userExists = await pool.request()
            .input('correo', correo)
            .query('SELECT 1 FROM Usuarios WHERE correo = @correo');

        if (userExists.recordset.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        // Create user using stored procedure
        const result = await pool.request()
            .input('nombre', nombre)
            .input('correo', correo)
            .input('contrasena', hashedPassword)
            .query(`
                EXEC RegistrarUsuario @nombre, @correo, @contrasena;
            `);

        // Fetch the newly created user
        const userResult = await pool.request()
            .input('correo', sql.VarChar, correo)
            .query('SELECT * FROM Usuarios WHERE correo = @correo');

        const user = userResult.recordset[0];
        delete user.contrasena;

        // Assign default role (Usuario)
        const roleResult = await pool.request()
            .query('SELECT id FROM Roles WHERE nombre_rol = \'Administrador\'');
        
        const roleId = roleResult.recordset[0].id;

        await pool.request()
            .input('usuario_id', user.id)
            .input('rol_id', roleId)
            .query(`
                INSERT INTO Usuarios_Roles (usuario_id, rol_id)
                VALUES (@usuario_id, @rol_id)
            `);

        res.status(201).json(user);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Error registering user' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { correo, contrasena } = req.body;
    console.log(correo, contrasena)
    try {
        const pool = await getConnection();

        // Get user using stored procedure
        
        const result = await pool.request()
            .input('correo', correo)
            .query('EXEC IniciarSesion @correo');


        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Invalid Email' });
        }

        const user = result.recordset[0];
        const roles = result.recordset.map(r => r.roles);

        // Verify password
        const validPassword = await bcrypt.compare(contrasena, user.contrasena);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Create token
        const token = jwt.sign(
            { 
                id: user.id,
                roles: roles
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        delete user.contrasena;
        res.json({
            user,
            token,
            roles: roles
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Get current user profile
router.get('/profile', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', req.user.id)
            .query('SELECT id, nombre, correo, fecha_registro FROM Usuarios WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ error: 'Error getting profile' });
    }
});

// Change password
router.post('/change-password', async (req, res) => {
    const { contrasena_actual, nueva_contrasena } = req.body;
    try {
        const pool = await getConnection();

        // Get current user
        const user = await pool.request()
            .input('id', req.user.id)
            .query('SELECT * FROM Usuarios WHERE id = @id');

        if (user.recordset.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const validPassword = await bcrypt.compare(contrasena_actual, user.recordset[0].contrasena);
        if (!validPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nueva_contrasena, salt);

        // Update password
        await pool.request()
            .input('id', req.user.id)
            .input('contrasena', hashedPassword)
            .query('UPDATE Usuarios SET contrasena = @contrasena WHERE id = @id');

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Error changing password' });
    }
});

// Get all users (admin only)
router.get('/users', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query('EXEC ObtenerUsuarios');

        // Remove passwords from response
        const users = result.recordset.map(user => {
            const { contrasena, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: 'Error getting users' });
    }
});

module.exports = router;