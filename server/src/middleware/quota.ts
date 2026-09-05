import type { NextFunction, Request, Response } from 'express';
import { getEntitlement, incrementUsage, isEntitlementActive, todayUtc } from '../services/entitlements.js';
import { ACCESS_COOKIE, QUOTA_COOKIE, type AccessPayload } from '../services/billing.js';
import { clearCookie, clientIp, readCookie, setCookie, signValue, verifyValue } from '../utils/cookies.js';

export const FREE_DAILY_DOCS = Math.max(1, Number(process.env.FREE_DAILY_DOCS || 3));
const ipUsage = new Map<string, { day: string; count: number }>();

type QuotaPayload = { day: string; count: number };

function quotaMessage(req: Request): string {
  const lang = String(req.headers['accept-language'] || 'fr').slice(0, 2).toLowerCase();
  if (lang === 'en') return `Free plan is limited to ${FREE_DAILY_DOCS} documents per day. Upgrade to continue.`;
  if (lang === 'es') return `El plan gratuito está limitado a ${FREE_DAILY_DOCS} documentos al día. Pase a Pro para continuar.`;
  if (lang === 'de') return `Der Gratisplan ist auf ${FREE_DAILY_DOCS} Dokumente pro Tag begrenzt. Upgraden Sie, um fortzufahren.`;
  if (lang === 'pt') return `O plano gratuito está limitado a ${FREE_DAILY_DOCS} documentos por dia. Passe a Pro para continuar.`;
  if (lang === 'tr') return `Ücretsiz plan günde ${FREE_DAILY_DOCS} belge ile sınırlıdır. Devam etmek için Pro’ya geçin.`;
  if (lang === 'ar') return `الخطة المجانية محدودة بـ ${FREE_DAILY_DOCS} مستندات في اليوم. قم بالترقية للمتابعة.`;
  if (lang === 'it') return `Il piano gratuito è limitato a ${FREE_DAILY_DOCS} documenti al giorno. Passa a Pro per continuare.`;
  return `Le plan gratuit est limité à ${FREE_DAILY_DOCS} documents par jour. Passez Pro pour continuer.`;
}

function pruneIpUsage(day: string) {
  if (ipUsage.size < 200) return;
  for (const [key, value] of ipUsage) {
    if (value.day !== day) ipUsage.delete(key);
  }
}

export async function getPaidAccess(req: Request, res: Response): Promise<AccessPayload | null> {
  const access = verifyValue<AccessPayload>(readCookie(req, ACCESS_COOKIE));
  if (!access) return null;
  const stored = await getEntitlement(access.customerId);
  if (stored) {
    if (!isEntitlementActive(stored)) {
      clearCookie(res, ACCESS_COOKIE);
      return null;
    }
    return {
      email: stored.email,
      customerId: stored.customerId,
      plan: stored.plan,
      expiresAt: stored.expiresAt
    };
  }
  if (access.expiresAt && Date.parse(access.expiresAt) <= Date.now()) {
    clearCookie(res, ACCESS_COOKIE);
    return null;
  }
  return access;
}

export async function isPaid(req: Request, res: Response): Promise<boolean> {
  return Boolean(await getPaidAccess(req, res));
}

export function getFreeUsage(req: Request) {
  const day = todayUtc();
  pruneIpUsage(day);
  const cookie = verifyValue<QuotaPayload>(readCookie(req, QUOTA_COOKIE));
  const ip = ipUsage.get(clientIp(req));
  const cookieCount = cookie?.day === day ? cookie.count : 0;
  const ipCount = ip?.day === day ? ip.count : 0;
  const usedToday = Math.max(cookieCount, ipCount);
  return {
    usedToday,
    dailyLimit: FREE_DAILY_DOCS,
    remainingToday: Math.max(0, FREE_DAILY_DOCS - usedToday)
  };
}

function commitFreeUsage(req: Request, res: Response, count: number, day: string) {
  ipUsage.set(clientIp(req), { day, count });
  setCookie(res, QUOTA_COOKIE, signValue({ day, count }), 60 * 60 * 36);
}

function releaseFreeUsage(req: Request, res: Response, previous: number, day: string) {
  const restored = Math.max(0, previous);
  if (restored === 0) {
    ipUsage.delete(clientIp(req));
    clearCookie(res, QUOTA_COOKIE);
    return;
  }
  commitFreeUsage(req, res, restored, day);
}

/**
 * Commercial daily quota only.
 * Successful responses (2xx/3xx) keep the reserved unit; failures release it.
 * Burst protection lives in rateLimitMiddleware; job admission in jobQueue.
 */
export async function quotaMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();
  if (
    req.path.startsWith('/billing')
    || req.path.startsWith('/auth')
    || req.path.startsWith('/admin')
    || req.path.startsWith('/blog')
    || req.path === '/pages/form-inspect'
  ) return next();

  try {
    const access = await getPaidAccess(req, res);
    if (access) {
      let committed = false;
      const commit = () => {
        if (committed) return;
        if (res.statusCode >= 200 && res.statusCode < 400) {
          committed = true;
          void incrementUsage(access.customerId);
        }
      };
      res.on('finish', commit);
      res.on('close', commit);
      return next();
    }

    const day = todayUtc();
    const usage = getFreeUsage(req);
    if (usage.usedToday >= FREE_DAILY_DOCS) {
      return res.status(402).json({ success: false, code: 'QUOTA', error: quotaMessage(req) });
    }

    const reserved = usage.usedToday + 1;
    // Reserve in memory only; cookie is written on success so failures don't stick client-side.
    ipUsage.set(clientIp(req), { day, count: reserved });

    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      if (res.statusCode >= 200 && res.statusCode < 400) {
        commitFreeUsage(req, res, reserved, day);
      } else {
        releaseFreeUsage(req, res, usage.usedToday, day);
      }
    };
    res.on('finish', settle);
    res.on('close', settle);
    return next();
  } catch (error) {
    console.error('Quota error:', error);
    return next();
  }
}
