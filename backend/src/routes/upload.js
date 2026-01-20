import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middlewares/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Upload signature
router.post('/signature', authenticateToken, (req, res) => {
    try {
        if (!req.files || !req.files.signature) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const signatureFile = req.files.signature;

        // Validation
        const allowedTypes = /image\/(jpeg|jpg|png|gif)/;
        if (!allowedTypes.test(signatureFile.mimetype)) {
            return res.status(400).json({ error: 'Only image files are allowed' });
        }

        if (signatureFile.size > 2 * 1024 * 1024) {
            return res.status(400).json({ error: 'File size too large. Max 2MB' });
        }

        // Generate filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(signatureFile.name);
        const filename = 'signature-' + uniqueSuffix + ext;
        const uploadPath = path.join(__dirname, '../../uploads/signatures', filename);

        // Move file
        signatureFile.mv(uploadPath, (err) => {
            if (err) {
                console.error('File move error:', err);
                return res.status(500).json({ error: 'Failed to save signature' });
            }

            const fileUrl = `/uploads/signatures/${filename}`;
            res.json({ url: fileUrl, filename: filename });
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload signature' });
    }
});

export default router;
