import express from 'express';
import { upload } from '../middleware/upload.js';
import { pdfToJpg } from '../services/toJpg.js';
import { cleanupUploads } from '../utils/temp.js';

const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;

  try {
    if (!uploadedFile) {
      return res.status(400).json({ success: false, error: 'Aucun fichier PDF reçu.' });
    }

    const quality = Math.min(100, Math.max(40, Number(req.body.quality) || 85));
    const result = await pdfToJpg(uploadedFile.path, quality);

    res.json({
      success: true,
      data: result,
      message: 'PDF converti en JPG'
    });
  } catch (error) {
    console.error('PDF to JPG error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Impossible de convertir ce PDF en JPG.'
    });
  } finally {
    await cleanupUploads(uploadedFile);
  }
});

export default router;
