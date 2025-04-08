const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    changePassword
} = require('../controllers/auth.controller.js');

// Register new user
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
    try {
        const { user, token, roles } = await loginUser(req.body);
        res.json({ user, token, roles });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(401).json({ error: error.message });
    }
});

// Change password
router.post('/change-password', async (req, res) => {
    try {
        const message = await changePassword(req.user.id, req.body);
        res.json(message);
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(401).json({ error: error.message });
    }
});

module.exports = router;