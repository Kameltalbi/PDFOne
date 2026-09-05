import express from 'express';
import { uploadImages } from '../middleware/upload.js';
import { imagesToPdf } from '../services/imagesToPdf.js';
import { cleanupUploads } from '../utils/temp.js';
import { publicToolResult } from '../utils/downloadGrant.js';
import { publicErrorFromUnknown } from '../utils/publicError.js';

const router = express.Router();

router.post('/', uploadImages.array('files', 20), async (req, res) => {
  const uploadedFiles = (req.files as Express.Multer.File[]) || [];

  try {
    if (uploadedFiles.length === 0) {
      return res.status(400).json({ success: false, error: 'Ajoutez au moins une image.' });
    }

    const fileOrder = req.body.order ? JSON.parse(req.body.order) : [];
    let sortedFiles = uploadedFiles;
    if (Array.isArray(fileOrder) && fileOrder.length > 0) {
      sortedFiles = fileOrder
        .map((index: number) => uploadedFiles[index])
        .filter((file: Express.Multer.File | undefined): file is Express.Multer.File => Boolean(file));
    }

    const result = await imagesToPdf(sortedFiles.map((file) => file.path));

    res.json({
      success: true,
      data: publicToolResult(req, res, result),
      message: 'Images converties en PDF'
    });
  } catch (error) {
    console.error('Images to PDF error:', error);
    res.status(500).json({
      success: false,
      error: publicErrorFromUnknown(error, 'Impossible de convertir ces images en PDF.')
    });
  } finally {
    await cleanupUploads(uploadedFiles);
  }
});

export default router;
