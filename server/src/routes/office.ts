import express from 'express';
import { uploadExtensions } from '../middleware/upload.js';
import { convertOfficeFile, OFFICE_JOBS, type OfficeJob } from '../services/office.js';
import { cleanupUploads } from '../utils/temp.js';
import { publicToolResult } from '../utils/downloadGrant.js';
import { publicErrorFromUnknown } from '../utils/publicError.js';

const router = express.Router();

function officeRoute(job: OfficeJob, message: string) {
  const uploader = uploadExtensions([...OFFICE_JOBS[job].in], message);
  router.post(`/${job}`, uploader.single('file'), async (req, res) => {
    const uploadedFile = req.file;
    try {
      if (!uploadedFile) {
        return res.status(400).json({ success: false, error: 'Aucun fichier reçu.' });
      }
      const result = await convertOfficeFile(uploadedFile.path, job);
      return res.json({ success: true, data: publicToolResult(req, res, result) });
    } catch (error) {
      console.error('Office convert error:', error);
      return res.status(400).json({
        success: false,
        error: publicErrorFromUnknown(error, 'Impossible de convertir ce fichier.')
      });
    } finally {
      await cleanupUploads(uploadedFile);
    }
  });
}

officeRoute('pdf-to-word', 'Seuls les fichiers PDF sont acceptés.');
officeRoute('word-to-pdf', 'Seuls les fichiers Word (DOC, DOCX, ODT, RTF) sont acceptés.');
officeRoute('pdf-to-excel', 'Seuls les fichiers PDF sont acceptés.');
officeRoute('excel-to-pdf', 'Seuls les fichiers Excel (XLS, XLSX, ODS, CSV) sont acceptés.');
officeRoute('pdf-to-ppt', 'Seuls les fichiers PDF sont acceptés.');
officeRoute('ppt-to-pdf', 'Seuls les fichiers PowerPoint (PPT, PPTX, ODP) sont acceptés.');
officeRoute('html-to-pdf', 'Seuls les fichiers HTML sont acceptés.');

export default router;
