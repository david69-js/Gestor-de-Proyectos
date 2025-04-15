const express = require('express');
const router = express.Router();
const {
    getUserById,
    deleteUser,
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

module.exports = router;