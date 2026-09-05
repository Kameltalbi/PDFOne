import express from 'express';
import { upload } from '../middleware/upload.js';
import { compressPdf, type CompressQuality } from '../services/compress.js';
import { cleanupUploads } from '../utils/temp.js';
import { requestSignal } from '../utils/jobQueue.js';
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
    const result = await compressPdf(uploadedFile.path, quality, requestSignal(req));

    res.json({
      success: true,
      data: publicToolResult(req, res, result),
      message: 'PDF compressé avec succès'
    });
  } catch (error) {
    console.error('Compress error:', error);
    const code = error instanceof Error ? (error as Error & { code?: string }).code : undefined;
    const status = code === 'SERVER_BUSY' || code === 'QUEUE_WAIT_TIMEOUT' || code === 'TEMP_DISK_FULL'
      ? 503
      : code === 'REQUEST_ABORTED'
        ? 499
        : 500;
    res.status(status).json({
      success: false,
      code,
      error: publicErrorFromUnknown(error, 'Impossible de compresser ce PDF.')
    });
  } finally {
    await cleanupUploads(uploadedFile);
  }
});

export default router;
