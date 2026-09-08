import express from 'express';
import fs from 'fs/promises';
import { upload } from '../middleware/upload.js';
import { editPdf, type PdfAnnotation } from '../services/edit.js';
import { originalDownloadName } from '../utils/downloadGrant.js';
import { publicErrorFromUnknown } from '../utils/publicError.js';

const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;

  try {
    if (!uploadedFile) {
      return res.status(400).json({ success: false, error: 'Aucun fichier PDF reçu' });
    }

    const annotations = JSON.parse(req.body.annotations || '[]') as PdfAnnotation[];
    if (!Array.isArray(annotations) || annotations.length > 1000) {
      return res.status(400).json({ success: false, error: 'Annotations invalides' });
    }

    const outputPath = await editPdf(uploadedFile.path, annotations);
    const downloadName = originalDownloadName(
      uploadedFile.originalname,
      'edited.pdf'
    ) || 'document.pdf';

    res.download(outputPath, downloadName, async () => {
      await fs.unlink(outputPath).catch(() => undefined);
    });
  } catch (error) {
    console.error('PDF edit error:', error);
    res.status(500).json({
      success: false,
      error: publicErrorFromUnknown(error, 'Impossible de modifier le PDF')
    });
  } finally {
    if (uploadedFile) await fs.unlink(uploadedFile.path).catch(() => undefined);
  }
});

export default router;
