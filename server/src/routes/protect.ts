import express from 'express';
import { upload } from '../middleware/upload.js';
import { protectPdf } from '../services/protect.js';
import { cleanupUploads } from '../utils/temp.js';

const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;

  try {
    if (!uploadedFile) {
      return res.status(400).json({ success: false, error: 'Aucun fichier PDF reçu.' });
    }

    const password = String(req.body.password || '');
    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        error: 'Le mot de passe doit contenir au moins 4 caractères.'
      });
    }

    const result = await protectPdf(uploadedFile.path, password);

    res.json({
      success: true,
      data: result,
      message: 'PDF protégé avec succès'
    });
  } catch (error) {
    console.error('Protect error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Impossible de protéger ce PDF.'
    });
  } finally {
    await cleanupUploads(uploadedFile);
  }
});

export default router;
