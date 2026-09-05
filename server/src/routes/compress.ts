import express from 'express';
import { upload } from '../middleware/upload.js';
import { compressPdf, type CompressQuality } from '../services/compress.js';
import { cleanupUploads } from '../utils/temp.js';
import { publicToolResult } from '../utils/downloadGrant.js';
import { publicErrorFromUnknown } from '../utils/publicError.js';

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
      data: publicToolResult(req, res, result),
      message: 'PDF compressé avec succès'
    });
  } catch (error) {
    console.error('Compress error:', error);
    res.status(500).json({
      success: false,
      error: publicErrorFromUnknown(error, 'Impossible de compresser ce PDF.')
    });
  } finally {
    await cleanupUploads(uploadedFile);
  }
});

export default router;
