import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { upload, uploadExtensions } from '../middleware/upload.js';
import { pdfToPng } from '../services/toJpg.js';
import { pdfToText } from '../services/toText.js';
import { unlockPdf } from '../services/unlock.js';
import { ocrPdf } from '../services/ocr.js';
import { summarizePdf, translatePdf } from '../services/nlp.js';
import { convertOfficeFile } from '../services/office.js';
import { cleanupUploads, unlinkQuiet } from '../utils/temp.js';

const router = express.Router();

function sendError(res: express.Response, error: unknown, fallback: string) {
  console.error(fallback, error);
  return res.status(400).json({
    success: false,
    error: error instanceof Error ? error.message : fallback
  });
}

router.post('/to-png', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;
  try {
    if (!uploadedFile) return res.status(400).json({ success: false, error: 'Aucun fichier PDF reçu.' });
    return res.json({ success: true, data: await pdfToPng(uploadedFile.path) });
  } catch (error) {
    return sendError(res, error, 'Impossible de convertir ce PDF en PNG.');
  } finally {
    await cleanupUploads(uploadedFile);
  }
});

router.post('/to-text', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;
  try {
    if (!uploadedFile) return res.status(400).json({ success: false, error: 'Aucun fichier PDF reçu.' });
    return res.json({ success: true, data: await pdfToText(uploadedFile.path, String(req.body.password || '')) });
  } catch (error) {
    return sendError(res, error, 'Impossible d’extraire le texte.');
  } finally {
    await cleanupUploads(uploadedFile);
  }
});

router.post('/unlock', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;
  try {
    if (!uploadedFile) return res.status(400).json({ success: false, error: 'Aucun fichier PDF reçu.' });
    return res.json({ success: true, data: await unlockPdf(uploadedFile.path, String(req.body.password || '')) });
  } catch (error) {
    return sendError(res, error, 'Impossible de déverrouiller ce PDF.');
  } finally {
    await cleanupUploads(uploadedFile);
  }
});

router.post('/ocr', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;
  try {
    if (!uploadedFile) return res.status(400).json({ success: false, error: 'Aucun fichier PDF reçu.' });
    return res.json({ success: true, data: await ocrPdf(uploadedFile.path, String(req.body.lang || 'fr')) });
  } catch (error) {
    return sendError(res, error, 'Impossible d’effectuer l’OCR.');
  } finally {
    await cleanupUploads(uploadedFile);
  }
});

router.post('/summarize', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;
  try {
    if (!uploadedFile) return res.status(400).json({ success: false, error: 'Aucun fichier PDF reçu.' });
    const length = req.body.length === 'short' ? 'short' : 'medium';
    return res.json({ success: true, data: await summarizePdf(uploadedFile.path, length) });
  } catch (error) {
    return sendError(res, error, 'Impossible de résumer ce PDF.');
  } finally {
    await cleanupUploads(uploadedFile);
  }
});

router.post('/translate', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;
  try {
    if (!uploadedFile) return res.status(400).json({ success: false, error: 'Aucun fichier PDF reçu.' });
    return res.json({
      success: true,
      data: await translatePdf(uploadedFile.path, String(req.body.target || 'en'), String(req.body.source || 'en'))
    });
  } catch (error) {
    return sendError(res, error, 'Impossible de traduire ce PDF.');
  } finally {
    await cleanupUploads(uploadedFile);
  }
});

const htmlUpload = uploadExtensions(['.html', '.htm'], 'Seuls les fichiers HTML sont acceptés.');

function asHtmlDocument(html: string) {
  const trimmed = html.trim();
  if (!trimmed) return trimmed;
  if (/<html[\s>]/i.test(trimmed)) return trimmed;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${trimmed}</body></html>`;
}

router.post('/html-to-pdf', (req, res, next) => {
  htmlUpload.single('file')(req, res, (error: unknown) => {
    if (error && !String(req.body?.html || '').trim()) {
      return next(error);
    }
    return next();
  });
}, async (req, res) => {
  const uploadedFile = req.file;
  let written: string | null = null;
  try {
    const pasted = String(req.body.html || '').trim();
    if (!uploadedFile && !pasted) {
      return res.status(400).json({ success: false, error: 'Ajoutez un fichier HTML ou collez du HTML.' });
    }
    let source = uploadedFile?.path;
    if (!source) {
      const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdfone-html-'));
      written = path.join(dir, 'document.html');
      await fs.writeFile(written, asHtmlDocument(pasted), 'utf8');
      source = written;
    }
    return res.json({ success: true, data: await convertOfficeFile(source, 'html-to-pdf') });
  } catch (error) {
    return sendError(res, error, 'Impossible de convertir ce HTML en PDF.');
  } finally {
    await cleanupUploads(uploadedFile);
    await unlinkQuiet(written);
    if (written) await fs.rm(path.dirname(written), { recursive: true, force: true }).catch(() => undefined);
  }
});

export default router;
