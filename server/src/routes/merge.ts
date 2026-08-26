import express from 'express';
import { upload } from '../middleware/upload.js';
import { mergePDFs } from '../services/merge.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, '../../../temp');

const router = express.Router();

// POST /api/merge - Merge multiple PDF files
router.post('/', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    if (req.files.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 PDF files are required for merging'
      });
    }

    // Get file order from request body
    const fileOrder = req.body.order ? JSON.parse(req.body.order) : [];
    
    // Sort files according to the order array if provided
    const uploadedFiles = req.files as Express.Multer.File[];
    let sortedFiles = uploadedFiles;
    if (fileOrder.length > 0) {
      sortedFiles = fileOrder
        .map((index: number) => uploadedFiles[index])
        .filter((file: Express.Multer.File | undefined): file is Express.Multer.File => file !== undefined);
    }

    // Merge PDFs
    const mergedPdfPath = await mergePDFs(sortedFiles.map(f => f.path));

    // Generate download URL
    const filename = `merged-${Date.now()}.pdf`;
    const downloadPath = path.join(tempDir, filename);
    await fs.rename(mergedPdfPath, downloadPath);

    // Clean up uploaded files
    for (const file of sortedFiles) {
      try {
        await fs.unlink(file.path);
      } catch (error) {
        console.error(`Failed to delete file: ${file.path}`, error);
      }
    }

    res.json({
      success: true,
      data: {
        downloadUrl: `/temp/${filename}`,
        filename: filename
      },
      message: 'PDFs merged successfully'
    });

  } catch (error) {
    console.error('Merge error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to merge PDFs'
    });
  }
});

export default router;
