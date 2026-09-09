import express from 'express';
import { upload } from '../middleware/upload.js';
import { protectPdf } from '../services/protect.js';
import { cleanupUploads } from '../utils/temp.js';
import { publicToolResult } from '../utils/downloadGrant.js';
import { publicErrorFromUnknown } from '../utils/publicError.js';
import { queueErrorStatus, requestSignal, runPdfJob } from '../utils/jobQueue.js';

const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;
  const signal = requestSignal(req);

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

    const result = await runPdfJob(() => protectPdf(uploadedFile.path, password), { signal });

    res.json({
      success: true,
      data: publicToolResult(req, res, result),
      message: 'PDF protégé avec succès'
    });
  } catch (error) {
    console.error('Protect error:', error);
    const status = queueErrorStatus(error) || 500;
    res.status(status).json({
      success: false,
      error: publicErrorFromUnknown(error, 'Impossible de protéger ce PDF.')
    });
  } finally {
    await cleanupUploads(uploadedFile);
  }
});

export default router;
