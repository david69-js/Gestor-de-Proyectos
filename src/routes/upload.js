const express = require('express');
const upload = require('../config/uploadConfig');
const router = express.Router();
const BASE_URL = process.env.BASE_URL

// Modificado para permitir múltiples archivos
router.post('/', upload.array('upload', 10), (req, res) => {  // Limite de 10 imágenes, ajusta si es necesario

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No images uploaded' });
    }
    
    const fileUrls = req.files.map(file => `${BASE_URL}/api/uploads/${file.filename}`);

    // Responder con un array de URLs
    res.json({
        urls: fileUrls
    });
});

module.exports = router;
