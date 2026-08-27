import express from 'express';
import { upload } from '../middleware/upload.js';
import { compressPdf, type CompressQuality } from '../services/compress.js';
import { cleanupUploads } from '../utils/temp.js';

const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;

  try {
    if (!uploadedFile) {
      return res.status(400).json({ success: false, error: 'Aucun fichier PDF reçu.' });
    }

    const quality = (['low', 'medium', 'high'].includes(req.body.quality)
      ? req.body.quality
      : 'medium') as CompressQuality;
    const result = await compressPdf(uploadedFile.path, quality);

    res.json({
      success: true,
      data: result,
      message: 'PDF compressé avec succès'
    });
  } catch (error) {
    console.error('Compress error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Impossible de compresser ce PDF.'
    });
  } finally {
    await cleanupUploads(uploadedFile);
  }
});

export default router;
