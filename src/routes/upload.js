const express = require('express');
const upload = require('../config/uploadConfig');
const router = express.Router();

// Modificado para permitir múltiples archivos
router.post('/', upload.array('upload', 10), (req, res) => {  // Limite de 10 imágenes, ajusta si es necesario
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No images uploaded' });
    }
    
    const fileUrls = req.files.map(file => `http://${process.env.HOST}:${process.env.PORT}/uploads/${file.filename}`);

    // Responder con un array de URLs
    res.json({
        urls: fileUrls
    });
});

module.exports = router;
