import type { NextFunction, Request, Response } from 'express';
import { clientIp } from '../utils/cookies.js';

type Bucket = { windowStart: number; count: number };

const buckets = new Map<string, Bucket>();

function envInt(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const WINDOW_MS = envInt('RATE_LIMIT_WINDOW_MS', 60_000);
const MAX_REQUESTS = envInt('RATE_LIMIT_MAX', 30);

function pruneBuckets(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > WINDOW_MS * 2) buckets.delete(key);
  }
}

function rateLimitMessage(req: Request): string {
  const lang = String(req.headers['accept-language'] || 'fr').slice(0, 2).toLowerCase();
  if (lang === 'en') return 'Too many requests. Please wait a moment and try again.';
  if (lang === 'es') return 'Demasiadas solicitudes. Espere un momento e inténtelo de nuevo.';
  if (lang === 'de') return 'Zu viele Anfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.';
  if (lang === 'pt') return 'Demasiados pedidos. Aguarde um momento e tente novamente.';
  if (lang === 'tr') return 'Çok fazla istek. Lütfen biraz bekleyip yeniden deneyin.';
  if (lang === 'ar') return 'طلبات كثيرة جدًا. يرجى الانتظار قليلًا ثم المحاولة مجددًا.';
  if (lang === 'it') return 'Troppe richieste. Attendi un momento e riprova.';
  return 'Trop de requêtes. Réessayez dans un instant.';
}

/**
 * Burst protection only — separate from commercial free-plan quotas
 * and from PDF/Office/OCR admission queues.
 */
export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();
  if (
    req.path.startsWith('/billing')
    || req.path.startsWith('/auth')
    || req.path.startsWith('/admin')
    || req.path.startsWith('/blog')
  ) return next();

  const now = Date.now();
  pruneBuckets(now);
  const key = clientIp(req);
  const current = buckets.get(key);
  if (!current || now - current.windowStart >= WINDOW_MS) {
    buckets.set(key, { windowStart: now, count: 1 });
    return next();
  }

  current.count += 1;
  if (current.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - current.windowStart)) / 1000);
    res.setHeader('Retry-After', String(Math.max(1, retryAfter)));
    return res.status(429).json({
      success: false,
      code: 'RATE_LIMIT',
      error: rateLimitMessage(req)
    });
  }
  return next();
}
