const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getConnection } = require('../config/db');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads');
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Allow common file types
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Error: Only specific file types are allowed!'));
        }
    }
});

// Upload file to project
router.post('/project/:projectId', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const pool = await getConnection();
    let transaction = null;

    try {
        transaction = pool.transaction();
        await transaction.begin();

        const result = await transaction.request()
            .input('proyecto_id', req.params.projectId)
            .input('nombre_archivo', req.file.originalname)
            .input('ruta_archivo', req.file.path)
            .query('INSERT INTO Archivos (proyecto_id, nombre_archivo, ruta_archivo) OUTPUT INSERTED.* VALUES (@proyecto_id, @nombre_archivo, @ruta_archivo)');

        await transaction.commit();
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        if (transaction) await transaction.rollback();
        fs.unlinkSync(req.file.path);
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Error uploading file' });
    }
});

// Delete file
router.delete('/:fileId', async (req, res) => {
    const pool = await getConnection();
    let transaction = null;

    try {
        transaction = pool.transaction();
        await transaction.begin();

        // Get file info before deleting
        const fileInfo = await transaction.request()
            .input('id', req.params.fileId)
            .query('SELECT * FROM Archivos WHERE id = @id');

        if (fileInfo.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'File not found' });
        }

        // Delete file record from database
        await transaction.request()
            .input('id', req.params.fileId)
            .query('DELETE FROM Archivos WHERE id = @id');

        // Delete physical file
        const filePath = fileInfo.recordset[0].ruta_archivo;
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await transaction.commit();
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Error deleting file' });
    }
});

// Get project files
router.get('/project/:projectId', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('proyecto_id', req.params.projectId)
            .query('SELECT * FROM Archivos WHERE proyecto_id = @proyecto_id');

        res.json(result.recordset);
    } catch (error) {
        console.error('Error getting project files:', error);
        res.status(500).json({ error: 'Error getting project files' });
    }
});

// Download file
router.get('/:fileId', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', req.params.fileId)
            .query('SELECT * FROM Archivos WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        const file = result.recordset[0];
        if (!fs.existsSync(file.ruta_archivo)) {
            return res.status(404).json({ error: 'File not found on server' });
        }

        res.download(file.ruta_archivo, file.nombre_archivo);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ error: 'Error downloading file' });
    }
});

module.exports = router;