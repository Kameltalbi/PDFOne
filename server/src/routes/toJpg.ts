import express from 'express';
import { upload } from '../middleware/upload.js';
import { pdfToJpg } from '../services/toJpg.js';
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

    const quality = Math.min(100, Math.max(40, Number(req.body.quality) || 85));
    const result = await pdfToJpg(uploadedFile.path, quality);

    res.json({
      success: true,
      data: publicToolResult(req, res, result),
      message: 'PDF converti en JPG'
    });
  } catch (error) {
    console.error('PDF to JPG error:', error);
    res.status(500).json({
      success: false,
      error: publicErrorFromUnknown(error, 'Impossible de convertir ce PDF en JPG.')
    });
  } finally {
    await cleanupUploads(uploadedFile);
  }
});

export default router;
