const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');

// Get all users
router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT id, nombre, correo, fecha_registro FROM Usuarios');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: 'Error getting users' });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', req.params.id)
            .query('SELECT id, nombre, correo, fecha_registro FROM Usuarios WHERE id = @id');
        
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: 'Error getting user' });
    }
});

// Create new user
router.post('/', async (req, res) => {
    const { nombre, correo, contrasena } = req.body;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('nombre', nombre)
            .input('correo', correo)
            .input('contrasena', contrasena)
            .query('INSERT INTO Usuarios (nombre, correo, contrasena) OUTPUT INSERTED.* VALUES (@nombre, @correo, @contrasena)');
        
        const user = result.recordset[0];
        delete user.contrasena; // Don't send password in response
        res.status(201).json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.number === 2627) { // SQL Server unique constraint violation
            res.status(400).json({ error: 'Email already exists' });
        } else {
            res.status(500).json({ error: 'Error creating user' });
        }
    }
});

// Update user
router.put('/:id', async (req, res) => {
    const { nombre, correo } = req.body;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', req.params.id)
            .input('nombre', nombre)
            .input('correo', correo)
            .query('UPDATE Usuarios SET nombre = @nombre, correo = @correo OUTPUT INSERTED.* WHERE id = @id');

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            delete user.contrasena;
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        if (error.number === 2627) {
            res.status(400).json({ error: 'Email already exists' });
        } else {
            res.status(500).json({ error: 'Error updating user' });
        }
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', req.params.id)
            .query('DELETE FROM Usuarios OUTPUT DELETED.* WHERE id = @id');

        if (result.recordset.length > 0) {
            res.json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error deleting user' });
    }
});

// Get user roles
router.get('/:id/roles', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', req.params.id)
            .query(`
                SELECT r.id, r.nombre_rol
                FROM Roles r
                INNER JOIN Usuarios_Roles ur ON r.id = ur.rol_id
                WHERE ur.usuario_id = @id
            `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error getting user roles:', error);
        res.status(500).json({ error: 'Error getting user roles' });
    }
});

module.exports = router;