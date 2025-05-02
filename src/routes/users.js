const express = require('express');
const router = express.Router();
const {
    getUserById,
    deleteUser,
    changePassword,
    updateUserDetails,
    getUsersByOrganization // Importar el nuevo controlador
} = require('../controllers/users.controller.js');
const upload = require('../config/uploadConfig');


// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const id_organizacion = req.user.id_organizacion;
        const user = await getUserById(req.params.id, id_organizacion);
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

router.put('/update-user', upload.single('imagen_perfil') ,async (req, res) => {
    try {
        const imagen_perfil = req.file ? `/uploads/${req.file.filename}` : req.body.imagen_perfil;

        // Agregar imagen a req.body para la lógica de update
        req.body.imagen_perfil = imagen_perfil;

        // Asegúrate que req.user exista (por ejemplo con autenticación previa)
        const message = await updateUserDetails(req.user.id, req.body);
        res.json(message);
    } catch (error) {
        console.error('Error changing user details:', error);
        res.status(401).json({ error: error.message });
    }
});

// Delete user
router.delete('/', async (req, res) => {
    try {
        const message = await deleteUser(req.user.id);
        res.json(message);
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(404).json({ error: error.message });
    }
});

// Get all users by organization
router.get('/organization/users', async (req, res) => {
    try {
        const id_organizacion = req.user.id_organizacion;
        const users = await getUsersByOrganization(id_organizacion);
        res.json(users);
    } catch (error) {
        console.error('Error getting users by organization:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;