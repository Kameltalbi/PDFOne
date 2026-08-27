import express from 'express';
import { upload } from '../middleware/upload.js';
import { mergePDFs } from '../services/merge.js';
import { cleanupUploads } from '../utils/temp.js';

const router = express.Router();

router.post('/', upload.array('files', 10), async (req, res) => {
  const uploadedFiles = (req.files as Express.Multer.File[]) || [];

  try {
    if (uploadedFiles.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Ajoutez au moins 2 fichiers PDF à fusionner.'
      });
    }

    const fileOrder = req.body.order ? JSON.parse(req.body.order) : [];
    let sortedFiles = uploadedFiles;
    if (Array.isArray(fileOrder) && fileOrder.length > 0) {
      sortedFiles = fileOrder
        .map((index: number) => uploadedFiles[index])
        .filter((file: Express.Multer.File | undefined): file is Express.Multer.File => Boolean(file));
    }

    const pageNumbers = req.body.pageNumbers === 'true' || req.body.pageNumbers === true;
    const result = await mergePDFs(sortedFiles.map((file) => file.path), { pageNumbers });

    res.json({
      success: true,
      data: result,
      message: 'PDFs fusionnés avec succès'
    });
  } catch (error) {
    console.error('Merge error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Impossible de fusionner ces PDF.'
    });
  } finally {
    await cleanupUploads(uploadedFiles);
  }
});

export default router;
