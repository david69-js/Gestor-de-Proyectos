const express = require('express');
const {
    getConnection
} = require('../config/db');
const router = express.Router();
const {
    registerUser,
    loginUser
} = require('../controllers/auth.controller.js');

// Register new user - Update the stored procedure execution
router.post('/register', async (req, res) => {
    try {
        const user = await registerUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(400).json({ error: error.message });
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