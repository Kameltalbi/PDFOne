import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';
import mergeRoutes from './routes/merge.js';
import splitRoutes from './routes/split.js';
import compressRoutes from './routes/compress.js';
import protectRoutes from './routes/protect.js';
import toJpgRoutes from './routes/toJpg.js';
import imagesToPdfRoutes from './routes/imagesToPdf.js';
import editRoutes from './routes/edit.js';
import pagesRoutes from './routes/pages.js';
import billingRoutes from './routes/billing.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import blogRoutes from './routes/blog.js';
import officeRoutes from './routes/office.js';
import extrasRoutes from './routes/extras.js';
import { quotaMiddleware } from './middleware/quota.js';
import { rateLimitMiddleware } from './middleware/rateLimit.js';
import { applyStripeEvent, getStripe } from './services/billing.js';
import { startTempCleanup, tempDir, unlinkQuiet } from './utils/temp.js';
import { allQueueStats } from './utils/jobQueue.js';
import { absoluteMaxFileBytes, FREE_MAX_FILE_BYTES } from './utils/limits.js';
import {
  pingConverters,
  runtimeHealthSnapshot,
  startEventLoopMonitor
} from './utils/runtimeHealth.js';
import { assertSessionSecretConfigured, readCookie } from './utils/cookies.js';
import { corsOriginCallback } from './utils/corsAllowlist.js';
import {
  DOWNLOAD_OWNER_COOKIE,
  canDownloadFile,
  revokeDownloadGrant
} from './utils/downloadGrant.js';

dotenv.config();
assertSessionSecretConfigured();

const app = express();
const PORT = process.env.PORT || 3002;
app.set('trust proxy', 1);

app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret || typeof signature !== 'string') {
    return res.status(400).send('Webhook Stripe non configuré.');
  }

  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    await applyStripeEvent(event);
    return res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return res.status(400).send('Webhook invalide.');
  }
});

app.use(cors({
  origin: corsOriginCallback,
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/temp/:name', async (req, res) => {
  const name = path.basename(req.params.name);
  if (!name || name !== req.params.name) {
    return res.status(404).json({ success: false, error: 'Fichier introuvable.' });
  }

  const owner = readCookie(req, DOWNLOAD_OWNER_COOKIE);
  if (!canDownloadFile(name, owner)) {
    return res.status(404).json({ success: false, error: 'Fichier introuvable ou déjà supprimé.' });
  }

  const filepath = path.join(tempDir, name);
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Pragma', 'no-cache');
  res.download(filepath, name, async (error) => {
    if (error) {
      if (!res.headersSent) {
        res.status(404).json({ success: false, error: 'Fichier introuvable ou déjà supprimé.' });
      }
      return;
    }
    revokeDownloadGrant(name);
    await unlinkQuiet(filepath);
  });
});

app.get('/health', async (_req, res) => {
  const runtime = await runtimeHealthSnapshot();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    queues: allQueueStats(),
    limits: {
      freeMaxFileBytes: FREE_MAX_FILE_BYTES,
      absoluteMaxFileBytes: absoluteMaxFileBytes()
    },
    ...runtime
  });
});

app.get('/health/ready', async (_req, res) => {
  const [runtime, converters] = await Promise.all([runtimeHealthSnapshot(), pingConverters()]);
  const ready = runtime.tempDisk.freeBytes == null
    || runtime.tempDisk.freeBytes >= (runtime.tempDisk.minFreeBytes || 0);
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    queues: allQueueStats(),
    converters,
    tempDisk: runtime.tempDisk,
    eventLoopLagMs: runtime.eventLoopLagMs,
    memory: runtime.memory
  });
});

app.use('/api', rateLimitMiddleware);
app.use('/api', quotaMiddleware);
app.use('/api/merge', mergeRoutes);
app.use('/api/split', splitRoutes);
app.use('/api/compress', compressRoutes);
app.use('/api/protect', protectRoutes);
app.use('/api/to-jpg', toJpgRoutes);
app.use('/api/jpg-to-pdf', imagesToPdfRoutes);
app.use('/api/edit', editRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/office', officeRoutes);
app.use('/api', extrasRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Le fichier dépasse la limite autorisée.'
      : err.code === 'LIMIT_FILE_COUNT'
        ? 'Trop de fichiers envoyés.'
        : 'Fichier rejeté.';
    return res.status(400).json({ success: false, error: message });
  }

  if (err instanceof Error && (err as Error & { code?: string }).code === 'SERVER_BUSY') {
    return res.status(503).json({ success: false, code: 'SERVER_BUSY', error: err.message });
  }

  if (err instanceof Error && ['QUEUE_WAIT_TIMEOUT', 'JOB_TIMEOUT', 'TEMP_DISK_FULL', 'DATA_LOCK_TIMEOUT'].includes((err as Error & { code?: string }).code || '')) {
    return res.status(503).json({ success: false, code: (err as Error & { code?: string }).code, error: err.message });
  }

  if (err instanceof Error && (err as Error & { code?: string }).code === 'REQUEST_ABORTED') {
    return res.status(499).json({ success: false, code: 'REQUEST_ABORTED', error: err.message });
  }

  if (err instanceof Error && /seuls les fichiers|seules les images/i.test(err.message)) {
    return res.status(400).json({ success: false, error: err.message });
  }

  return next(err);
});

app.listen(PORT, () => {
  startTempCleanup();
  startEventLoopMonitor();
  console.log(`Server running on port ${PORT}`);
});
