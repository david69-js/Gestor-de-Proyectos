const express = require('express');
const router = express.Router();
const {
    getUserById,
    updateUser,
    deleteUser,
    getUserRoles,
    changePassword,
    updateUserDetails
} = require('../controllers/users.controller.js');


// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        res.json(user);
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(404).json({ error: error.message });
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

router.put('/update-user', async (req, res) => {
    try {
        const message = await updateUserDetails(req.user.id, req.body);
        res.json(message);
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(401).json({ error: error.message });
    }
});


// Update user
router.put('/:id', async (req, res) => {
    try {
        const user = await updateUser(req.params.id, req.body);
        res.json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(404).json({ error: error.message });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        const message = await deleteUser(req.params.id);
        res.json(message);
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(404).json({ error: error.message });
    }
});

// Get user roles
router.get('/:id/roles', async (req, res) => {
    try {
        const roles = await getUserRoles(req.params.id);
        res.json(roles);
    } catch (error) {
        console.error('Error getting user roles:', error);
        res.status(500).json({ error: 'Error getting user roles' });
    }
});

module.exports = router;