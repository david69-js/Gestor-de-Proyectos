const express = require('express');
const upload = require('../config/uploadConfig');
const router = express.Router();

router.post('/', upload.single('upload'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }
    // CKEditor expects the URL in the "url" field
    console.log(req.file);
    res.json({
        url: `http://${process.env.HOST}:${process.env.PORT}/uploads/${req.file.filename}`
    });
});

module.exports = router;