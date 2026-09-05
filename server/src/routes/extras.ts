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
import { consumeWeekAi, WEEK_AI_LIMIT } from '../services/entitlements.js';
import { getPaidAccess } from '../middleware/quota.js';
import { cleanupUploads, unlinkQuiet } from '../utils/temp.js';
import { publicToolResult } from '../utils/downloadGrant.js';
import { publicErrorFromUnknown } from '../utils/publicError.js';

const router = express.Router();

function sendError(res: express.Response, error: unknown, fallback: string) {
  console.error(fallback, error);
  const code = error instanceof Error ? (error as Error & { code?: string }).code : undefined;
  const status = code === 'SERVER_BUSY' || code === 'QUEUE_WAIT_TIMEOUT' || code === 'JOB_TIMEOUT' || code === 'TEMP_DISK_FULL'
    ? 503
    : code === 'REQUEST_ABORTED'
      ? 499
      : 400;
  return res.status(status).json({
    success: false,
    code,
    error: publicErrorFromUnknown(error, fallback)
  });
}

function aiCapMessage(req: express.Request): string {
  const lang = String(req.headers['accept-language'] || 'fr').slice(0, 2).toLowerCase();
  const copy: Record<string, string> = {
    en: `The 7-day pass includes up to ${WEEK_AI_LIMIT} summarize and translate uses. Merge, compress, OCR, and edit stay unlimited.`,
    fr: `Le Pass Semaine inclut jusqu’à ${WEEK_AI_LIMIT} utilisations de résumé et de traduction. Fusion, compression, OCR et édition restent illimitées.`,
    es: `El pase de 7 días incluye hasta ${WEEK_AI_LIMIT} usos de resumen y traducción. Combinar, comprimir, OCR y editar siguen ilimitados.`,
    de: `Der 7-Tage-Pass umfasst bis zu ${WEEK_AI_LIMIT} Zusammenfassungs- und Übersetzungsnutzungen. Zusammenführen, Komprimieren, OCR und Bearbeiten bleiben unbegrenzt.`,
    pt: `O passe de 7 dias inclui até ${WEEK_AI_LIMIT} usos de resumo e tradução. Unir, comprimir, OCR e editar continuam ilimitados.`,
    tr: `7 günlük geçiş, en fazla ${WEEK_AI_LIMIT} özetleme ve çeviri kullanımı içerir. Birleştirme, sıkıştırma, OCR ve düzenleme sınırsız kalır.`,
    ar: `يشمل تمرير الأيام السبعة حتى ${WEEK_AI_LIMIT} استخدامات للتلخيص والترجمة. الدمج والضغط والتعرف الضوئي والتحرير تبقى بلا حد.`,
    it: `Il pass di 7 giorni include fino a ${WEEK_AI_LIMIT} utilizzi di riassunto e traduzione. Unione, compressione, OCR e modifica restano illimitati.`
  };
  return copy[lang] || copy.fr;
}

async function allowWeekAi(req: express.Request, res: express.Response): Promise<boolean> {
  const access = await getPaidAccess(req, res);
  if (!access) return true;
  const result = await consumeWeekAi(access.customerId, access.plan);
  if (result.ok) return true;
  res.status(402).json({ success: false, code: 'AI_CAP', error: aiCapMessage(req) });
  return false;
}

router.post('/to-png', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;
  try {
    if (!uploadedFile) return res.status(400).json({ success: false, error: 'Aucun fichier PDF reçu.' });
    return res.json({ success: true, data: publicToolResult(req, res, await pdfToPng(uploadedFile.path)) });
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
    return res.json({
      success: true,
      data: publicToolResult(req, res, await pdfToText(uploadedFile.path, String(req.body.password || '')))
    });
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
    return res.json({
      success: true,
      data: publicToolResult(req, res, await unlockPdf(uploadedFile.path, String(req.body.password || '')))
    });
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
    return res.json({
      success: true,
      data: publicToolResult(req, res, await ocrPdf(uploadedFile.path, String(req.body.lang || 'fr')))
    });
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
    if (!(await allowWeekAi(req, res))) return;
    const length = req.body.length === 'short' ? 'short' : 'medium';
    return res.json({
      success: true,
      data: publicToolResult(req, res, await summarizePdf(uploadedFile.path, length))
    });
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
    if (!(await allowWeekAi(req, res))) return;
    return res.json({
      success: true,
      data: publicToolResult(
        req,
        res,
        await translatePdf(uploadedFile.path, String(req.body.target || 'en'), String(req.body.source || 'en'))
      )
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
    return res.json({
      success: true,
      data: publicToolResult(req, res, await convertOfficeFile(source, 'html-to-pdf'))
    });
  } catch (error) {
    return sendError(res, error, 'Impossible de convertir ce HTML en PDF.');
  } finally {
    await cleanupUploads(uploadedFile);
    await unlinkQuiet(written);
    if (written) await fs.rm(path.dirname(written), { recursive: true, force: true }).catch(() => undefined);
  }
});

export default router;
