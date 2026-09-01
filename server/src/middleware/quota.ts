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

export async function quotaMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();
  if (req.path.startsWith('/billing') || req.path.startsWith('/auth')) return next();

  try {
    const access = await getPaidAccess(req, res);
    if (access) {
      await incrementUsage(access.customerId);
      return next();
    }

    const day = todayUtc();
    const usage = getFreeUsage(req);
    const count = usage.usedToday + 1;

    if (count > FREE_DAILY_DOCS) {
      return res.status(402).json({ success: false, code: 'QUOTA', error: quotaMessage(req) });
    }

    ipUsage.set(clientIp(req), { day, count });
    setCookie(res, QUOTA_COOKIE, signValue({ day, count }), 60 * 60 * 36);
    return next();
  } catch (error) {
    console.error('Quota error:', error);
    return next();
  }
}
