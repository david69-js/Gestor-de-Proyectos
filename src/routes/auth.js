const express = require('express');
const {
    getConnection
} = require('../config/db');
const router = express.Router();
const {
    registerUser,
    loginUser
} = require('../controllers/auth.controller.js');
const upload = require('../config/uploadConfig');

// Register new user - Update the stored procedure execution
router.post('/register',upload.single('imagen_perfil'),async (req, res) => {
    const BASE_URL = process.env.BASE_URL;
    try {
        const imagen_perfil = req.file ? `${BASE_URL}/uploads/${req.file.filename}` : null;

        // Agregar imagen a req.body para la lógica de update
        req.body.imagen_perfil = imagen_perfil;

        const user = await registerUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(400).json({ error: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { user, token, roles } = await loginUser(req.body);

        res.json({ user, token, roles });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(401).json({ error: error.message });
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