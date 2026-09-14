import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { upload, uploadExtensions } from '../middleware/upload.js';
import { pdfToPng } from '../services/toJpg.js';
import { pdfToText } from '../services/toText.js';
import { unlockPdf } from '../services/unlock.js';
import { ocrPdf } from '../services/ocr.js';
import { parseSummaryLanguage, parseSummaryMode, summarizePdf, translatePdf } from '../services/nlp.js';
import { convertOfficeFile } from '../services/office.js';
import { releaseAiCredits, reserveAiCredits } from '../services/entitlements.js';
import { getPaidAccess, releaseFreeAi, reserveFreeAi } from '../middleware/quota.js';
import { assertPremiumAccess } from '../middleware/premiumGate.js';
import { cleanupUploads, unlinkQuiet } from '../utils/temp.js';
import { publicToolResult } from '../utils/downloadGrant.js';
import { publicErrorFromUnknown } from '../utils/publicError.js';
import { requestSignal, runPdfJob } from '../utils/jobQueue.js';
import { countPdfPages } from '../utils/pdf.js';
import { AI_BILLABLE_PAGE_CAP, aiCreditCost, type AiTool } from '@mini-pdf-tools/shared';

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

function aiPageCapMessage(req: express.Request, tool: AiTool, pages: number, cap: number): string {
  const lang = String(req.headers['accept-language'] || 'fr').slice(0, 2).toLowerCase();
  if (tool !== 'translate') {
    return lang === 'en'
      ? `This document has ${pages} pages (maximum ${cap} billed).`
      : `Ce document a ${pages} pages (maximum ${cap} facturées).`;
  }
  const copy: Record<string, string> = {
    en: `Translation keeps layout up to ${cap} pages. This PDF has ${pages} pages.`,
    fr: `La traduction conserve la mise en page jusqu’à ${cap} pages. Ce PDF en a ${pages}.`,
    es: `La traducción conserva la maquetación hasta ${cap} páginas. Este PDF tiene ${pages}.`,
    de: `Die Übersetzung erhält das Layout bis ${cap} Seiten. Dieses PDF hat ${pages} Seiten.`,
    pt: `A tradução mantém o layout até ${cap} páginas. Este PDF tem ${pages}.`,
    tr: `Çeviri düzeni en fazla ${cap} sayfa korur. Bu PDF ${pages} sayfa.`,
    ar: `تحتفظ الترجمة بالتخطيط حتى ${cap} صفحة. هذا الملف فيه ${pages} صفحة.`,
    it: `La traduzione mantiene il layout fino a ${cap} pagine. Questo PDF ne ha ${pages}.`
  };
  return copy[lang] || copy.fr;
}

function aiCapMessage(req: express.Request, needed: number, remaining: number, limit: number): string {
  const lang = String(req.headers['accept-language'] || 'fr').slice(0, 2).toLowerCase();
  const copy: Record<string, string> = {
    en: `Not enough AI credits (${needed} needed, ${remaining} left of ${limit}). Translate costs 1 credit per page (max 100). Summarize costs 1 credit per page (max 20 per file).`,
    fr: `Crédits IA insuffisants (${needed} nécessaires, ${remaining} restants sur ${limit}). Traduction : 1 crédit par page (max 100). Résumé : 1 crédit par page (max 20 par fichier).`,
    es: `Créditos de IA insuficientes (${needed} necesarios, ${remaining} restantes de ${limit}).`,
    de: `Nicht genug KI-Guthaben (${needed} nötig, ${remaining} von ${limit} übrig).`,
    pt: `Créditos de IA insuficientes (${needed} necessários, ${remaining} restantes de ${limit}).`,
    tr: `Yetersiz YZ kredisi (${needed} gerekli, ${limit} içinden ${remaining} kaldı).`,
    ar: `رصيد الذكاء الاصطناعي غير كافٍ (${needed} مطلوب، تبقى ${remaining} من ${limit}).`,
    it: `Crediti IA insufficienti (${needed} necessari, ${remaining} rimasti su ${limit}).`
  };
  return copy[lang] || copy.fr;
}

async function withAiCredits<T>(
  req: express.Request,
  res: express.Response,
  tool: AiTool,
  filePath: string,
  run: () => Promise<T>
): Promise<T | undefined> {
  const pages = await countPdfPages(filePath);
  const pageCap = AI_BILLABLE_PAGE_CAP[tool];
  if (tool === 'translate' && pages > pageCap) {
    res.status(400).json({
      success: false,
      code: 'AI_PAGE_CAP',
      pages,
      cap: pageCap,
      error: aiPageCapMessage(req, tool, pages, pageCap)
    });
    return undefined;
  }
  const cost = aiCreditCost(tool, pages);
  const access = await getPaidAccess(req, res);
  const reserved = access
    ? await reserveAiCredits(access.customerId, access.plan, cost)
    : reserveFreeAi(req, res, cost);
  if (!reserved.ok) {
    res.status(402).json({
      success: false,
      code: 'AI_CAP',
      needed: cost,
      remaining: reserved.remaining,
      limit: reserved.limit,
      error: aiCapMessage(req, cost, reserved.remaining, reserved.limit)
    });
    return undefined;
  }
  try {
    return await run();
  } catch (error) {
    if (access) await releaseAiCredits(access.customerId, access.plan, cost);
    else releaseFreeAi(req, res, cost);
    throw error;
  }
}

router.post('/to-png', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;
  const signal = requestSignal(req);
  try {
    if (!uploadedFile) return res.status(400).json({ success: false, error: 'Aucun fichier PDF reçu.' });
    // Already admitted via pdfQueue inside pdfToRaster / worker pool.
    return res.json({
      success: true,
      data: publicToolResult(req, res, await pdfToPng(uploadedFile.path, signal))
    });
  } catch (error) {
    return sendError(res, error, 'Impossible de convertir ce PDF en PNG.');
  } finally {
    await cleanupUploads(uploadedFile);
  }
});

router.post('/to-text', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;
  const signal = requestSignal(req);
  try {
    if (!uploadedFile) return res.status(400).json({ success: false, error: 'Aucun fichier PDF reçu.' });
    const result = await runPdfJob(
      () => pdfToText(uploadedFile.path, String(req.body.password || '')),
      { signal }
    );
    return res.json({
      success: true,
      data: publicToolResult(req, res, result)
    });
  } catch (error) {
    return sendError(res, error, 'Impossible d’extraire le texte.');
  } finally {
    await cleanupUploads(uploadedFile);
  }
});

router.post('/unlock', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;
  const signal = requestSignal(req);
  try {
    if (!uploadedFile) return res.status(400).json({ success: false, error: 'Aucun fichier PDF reçu.' });
    const result = await runPdfJob(
      (jobSignal) => unlockPdf(uploadedFile.path, String(req.body.password || ''), jobSignal),
      { signal }
    );
    return res.json({
      success: true,
      data: publicToolResult(req, res, result)
    });
  } catch (error) {
    return sendError(res, error, 'Impossible de déverrouiller ce PDF.');
  } finally {
    await cleanupUploads(uploadedFile);
  }
});

router.post('/ocr', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;
  const signal = requestSignal(req);
  try {
    if (!uploadedFile) return res.status(400).json({ success: false, error: 'Aucun fichier PDF reçu.' });
    if (!(await assertPremiumAccess(req, res, 'ocr'))) return;
    // Already admitted via ocrQueue inside ocrPdf.
    return res.json({
      success: true,
      data: publicToolResult(req, res, await ocrPdf(uploadedFile.path, String(req.body.lang || 'fr'), signal))
    });
  } catch (error) {
    return sendError(res, error, 'Impossible d’effectuer l’OCR.');
  } finally {
    await cleanupUploads(uploadedFile);
  }
});

router.post('/summarize', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;
  const signal = requestSignal(req);
  try {
    if (!uploadedFile) return res.status(400).json({ success: false, error: 'Aucun fichier PDF reçu.' });
    const mode = parseSummaryMode(req.body.mode ?? req.body.length ?? 'detailed');
    if (!mode) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_SUMMARY_MODE',
        error: 'Invalid summary mode. Use quick, detailed, or key_points.'
      });
    }
    const language = parseSummaryLanguage(req.body.language ?? 'same');
    if (!language) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_SUMMARY_LANGUAGE',
        error: 'Invalid summary language.'
      });
    }
    const result = await withAiCredits(req, res, 'summarize', uploadedFile.path, () => runPdfJob(
      () => summarizePdf(uploadedFile.path, mode, language),
      { signal }
    ));
    if (result === undefined) return;
    return res.json({
      success: true,
      data: publicToolResult(req, res, result)
    });
  } catch (error) {
    return sendError(res, error, 'Impossible de résumer ce PDF.');
  } finally {
    await cleanupUploads(uploadedFile);
  }
});

router.post('/translate', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;
  const signal = requestSignal(req);
  try {
    if (!uploadedFile) return res.status(400).json({ success: false, error: 'Aucun fichier PDF reçu.' });
    const result = await withAiCredits(req, res, 'translate', uploadedFile.path, () => runPdfJob(
      () => translatePdf(
        uploadedFile.path,
        String(req.body.target || 'en'),
        String(req.body.source || 'auto'),
        String(req.body.mode || 'layout') === 'text' ? 'text' : 'layout'
      ),
      { signal }
    ));
    if (result === undefined) return;
    return res.json({
      success: true,
      data: publicToolResult(req, res, result)
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
  const signal = requestSignal(req);
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
    // Already admitted via officeQueue inside convertOfficeFile.
    return res.json({
      success: true,
      data: publicToolResult(req, res, await convertOfficeFile(source, 'html-to-pdf', signal))
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
