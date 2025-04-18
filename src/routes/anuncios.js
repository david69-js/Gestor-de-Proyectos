const express = require('express');
const router = express.Router();
const {
    crearAnuncio,
    obtenerAnunciosPorProyecto,
    obtenerAnuncio,
    eliminarAnuncio
} = require('../controllers/anuncios.controller');

// Create announcement
router.post('/proyecto/:id_proyecto', async (req, res) => {
    try {
        const { titulo, descripcion } = req.body;
        const { id_organizacion, id }= req.user;
        const { id_proyecto } = req.params

        const anuncio = await crearAnuncio(
            id_proyecto,
            id_organizacion,
            id,
            titulo,
            descripcion
        );
        res.json(anuncio);
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get announcements by project
router.get('/proyecto/:id_proyecto/anuncio/:id_anuncio', async (req, res) => {
    try {
        const id_proyecto = req.params.id_proyecto;
        const id_organizacion = req.user.id_organizacion;
        const id_anuncio = req.params.id_anuncio;

        console.log(id_proyecto, id_organizacion, id_anuncio);
        const anuncios = await obtenerAnuncio(id_anuncio,id_organizacion, id_proyecto);
        res.json(anuncios);
    } catch (error) {
        console.error('Error getting announcement:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get specific announcement
router.get('/proyecto/:id_proyecto/', async (req, res) => {
    try {
        const id_proyecto = req.params.id_proyecto;
        const id_organizacion = req.user.id_organizacion;

        const anuncio = await obtenerAnunciosPorProyecto(id_proyecto,id_organizacion);
        res.json(anuncio);
    } catch (error) {
        console.error('Error getting announcement:', error);
        res.status(400).json({ error: error.message });
    }
});

// Delete announcement
router.delete('/proyecto/:id_proyecto/anuncio/:id_anuncio', async (req, res) => {
    try {
        const id_anuncio = req.params.id_anuncio;
        const id_proyecto = req.params.id_proyecto;
        const id_organizacion = req.user.id_organizacion;
        const id_usuario = req.user.id;

        const result = await eliminarAnuncio(id_anuncio, id_proyecto, id_organizacion, id_usuario);
        res.json(result);
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;