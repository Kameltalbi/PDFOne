import express from 'express';
import { upload } from '../middleware/upload.js';
import { splitPdf, type SplitMode } from '../services/split.js';
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

    const mode: SplitMode = req.body.mode === 'separate' ? 'separate' : 'extract';
    const pages = req.body.pages ? JSON.parse(req.body.pages) : [];
    const result = await runPdfJob(() => splitPdf(uploadedFile.path, pages, mode), { signal });

    res.json({
      success: true,
      data: publicToolResult(req, res, result),
      message: 'PDF divisé avec succès'
    });
  } catch (error) {
    console.error('Split error:', error);
    const status = queueErrorStatus(error) || 400;
    res.status(status).json({
      success: false,
      error: publicErrorFromUnknown(error, 'Impossible de diviser ce PDF.')
    });
  } finally {
    await cleanupUploads(uploadedFile);
  }
});

export default router;
