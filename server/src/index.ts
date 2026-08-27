import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
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
import officeRoutes from './routes/office.js';
import extrasRoutes from './routes/extras.js';
import { quotaMiddleware } from './middleware/quota.js';
import { applyStripeEvent, getStripe } from './services/billing.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

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

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/temp', express.static(path.join(__dirname, '../../temp')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
app.use('/api/office', officeRoutes);
app.use('/api', extrasRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Le fichier dépasse la limite de 100 Mo.'
      : err.code === 'LIMIT_FILE_COUNT'
        ? 'Trop de fichiers envoyés.'
        : 'Fichier rejeté.';
    return res.status(400).json({ success: false, error: message });
  }

  if (err instanceof Error && /seuls les fichiers|seules les images/i.test(err.message)) {
    return res.status(400).json({ success: false, error: err.message });
  }

  return next(err);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Temp directory: ${path.join(__dirname, '../../temp')}`);
});
