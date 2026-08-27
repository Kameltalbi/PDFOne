import express from 'express';
import { upload } from '../middleware/upload.js';
import { cropPages, deletePages, numberPages, reorderPages, rotatePages, watermarkPdf } from '../services/pages.js';
import { signPdf } from '../services/sign.js';
import { cleanupUploads } from '../utils/temp.js';

const router = express.Router();

function parseJsonBody(value: unknown, fallback: unknown) {
  if (typeof value !== 'string' || value.trim() === '') return fallback;
  return JSON.parse(value);
}

async function handlePageTool(
  req: express.Request,
  res: express.Response,
  run: (filePath: string) => Promise<{ downloadUrl: string; filename: string; filepath: string }>,
  fallback: string
) {
  const uploadedFile = req.file;
  try {
    if (!uploadedFile) {
      return res.status(400).json({ success: false, error: 'Aucun fichier PDF reçu.' });
    }
    const result = await run(uploadedFile.path);
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Pages tool error:', error);
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : fallback
    });
  } finally {
    await cleanupUploads(uploadedFile);
  }
}

router.post('/delete', upload.single('file'), async (req, res) => {
  try {
    const pages = parseJsonBody(req.body.pages, []);
    return await handlePageTool(req, res, (filePath) => deletePages(filePath, pages), 'Impossible de supprimer ces pages.');
  } catch {
    return res.status(400).json({ success: false, error: 'Sélection de pages invalide.' });
  }
});

router.post('/reorder', upload.single('file'), async (req, res) => {
  try {
    const order = parseJsonBody(req.body.order, []);
    return await handlePageTool(req, res, (filePath) => reorderPages(filePath, order), 'Impossible de réorganiser ces pages.');
  } catch {
    return res.status(400).json({ success: false, error: 'L’ordre des pages est invalide.' });
  }
});

router.post('/rotate', upload.single('file'), async (req, res) => {
  try {
    const rotations = parseJsonBody(req.body.rotations, []);
    return await handlePageTool(req, res, (filePath) => rotatePages(filePath, rotations), 'Impossible de pivoter ce PDF.');
  } catch {
    return res.status(400).json({ success: false, error: 'Les rotations demandées sont invalides.' });
  }
});

router.post('/watermark', upload.single('file'), async (req, res) => {
  const text = typeof req.body.text === 'string' ? req.body.text : '';
  const opacity = Number(req.body.opacity);
  const rotation = Number(req.body.rotation);
  const color = typeof req.body.color === 'string' ? req.body.color : '#9ca3af';
  const mosaic = req.body.mosaic === 'true' || req.body.mosaic === true;
  return await handlePageTool(
    req,
    res,
    (filePath) => watermarkPdf(filePath, { text, opacity, rotation, color, mosaic }),
    'Impossible d’ajouter ce filigrane.'
  );
});

router.post('/numbers', upload.single('file'), async (req, res) => {
  const format = typeof req.body.format === 'string' ? req.body.format : 'n_of_n';
  const position = typeof req.body.position === 'string' ? req.body.position : 'bottom-center';
  const start = Number(req.body.start);
  const color = typeof req.body.color === 'string' ? req.body.color : '#4b5563';
  const locale = typeof req.body.locale === 'string' ? req.body.locale : (req.headers['accept-language'] || 'en');
  return await handlePageTool(
    req,
    res,
    (filePath) => numberPages(filePath, { format, position, start, color, locale }),
    'Impossible d’ajouter les numéros de page.'
  );
});

router.post('/crop', upload.single('file'), async (req, res) => {
  return await handlePageTool(
    req,
    res,
    (filePath) => cropPages(filePath, {
      top: Number(req.body.top),
      right: Number(req.body.right),
      bottom: Number(req.body.bottom),
      left: Number(req.body.left)
    }),
    'Impossible de rogner ce PDF.'
  );
});

router.post('/sign', upload.single('file'), async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name : '';
  const reason = typeof req.body.reason === 'string' ? req.body.reason : '';
  const position = typeof req.body.position === 'string' ? req.body.position : 'bottom-right';
  const scope = typeof req.body.scope === 'string' ? req.body.scope : 'last';
  const locale = typeof req.body.locale === 'string' ? req.body.locale : (req.headers['accept-language'] || 'fr');
  const signedLabel = typeof req.body.signedLabel === 'string' ? req.body.signedLabel : '';
  const dateLabel = typeof req.body.dateLabel === 'string' ? req.body.dateLabel : '';
  const reasonLabel = typeof req.body.reasonLabel === 'string' ? req.body.reasonLabel : '';
  return await handlePageTool(
    req,
    res,
    (filePath) => signPdf(filePath, { name, reason, position, scope, locale, signedLabel, dateLabel, reasonLabel }),
    'Impossible de signer ce PDF.'
  );
});

export default router;
