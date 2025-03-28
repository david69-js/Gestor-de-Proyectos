const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../config/db');

// Register new user
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

        res.status(201).json(user);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Error registering user' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { correo, contrasena } = req.body;
    try {
        const pool = await getConnection();

        // Get user
        const result = await pool.request()
            .input('correo', correo)
            .query('SELECT * FROM Usuarios WHERE correo = @correo');

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.recordset[0];

        // Verify password
        const validPassword = await bcrypt.compare(contrasena, user.contrasena);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
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
        res.json({
            user,
            token,
            roles: roles.recordset.map(r => r.nombre_rol)
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

module.exports = router;