import type { NextFunction, Request, Response } from 'express';
import { PLAN_LIMITS, calendarMonthKey } from '@mini-pdf-tools/shared';
import { getEntitlement, incrementUsage, isEntitlementActive, todayUtc, type AiBalance } from '../services/entitlements.js';
import { ACCESS_COOKIE, QUOTA_COOKIE, type AccessPayload } from '../services/billing.js';
import { clearCookie, clientIp, readCookie, setCookie, signValue, verifyValue } from '../utils/cookies.js';

export const FREE_DAILY_DOCS = PLAN_LIMITS.free.dailyJobs ?? 5;
const FREE_AI_LIMIT = PLAN_LIMITS.free.aiCredits;

const ipUsage = new Map<string, { day: string; count: number; aiMonth: string; aiUsed: number }>();

type QuotaPayload = { day: string; count: number; aiMonth?: string; aiUsed?: number };

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
    if (value.day !== day && value.aiMonth !== calendarMonthKey()) ipUsage.delete(key);
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

function readQuota(req: Request): { day: string; count: number; aiMonth: string; aiUsed: number } {
  const day = todayUtc();
  const month = calendarMonthKey();
  pruneIpUsage(day);
  const cookie = verifyValue<QuotaPayload>(readCookie(req, QUOTA_COOKIE));
  const ip = ipUsage.get(clientIp(req));
  const cookieCount = cookie?.day === day ? cookie.count : 0;
  const ipCount = ip?.day === day ? ip.count : 0;
  const cookieAi = cookie?.aiMonth === month ? (cookie.aiUsed || 0) : 0;
  const ipAi = ip?.aiMonth === month ? ip.aiUsed : 0;
  return {
    day,
    count: Math.max(cookieCount, ipCount),
    aiMonth: month,
    aiUsed: Math.max(cookieAi, ipAi)
  };
}

export function getFreeUsage(req: Request) {
  const usage = readQuota(req);
  return {
    usedToday: usage.count,
    dailyLimit: FREE_DAILY_DOCS,
    remainingToday: Math.max(0, FREE_DAILY_DOCS - usage.count)
  };
}

export function getFreeAiUsage(req: Request): AiBalance {
  const usage = readQuota(req);
  return {
    used: usage.aiUsed,
    limit: FREE_AI_LIMIT,
    remaining: Math.max(0, FREE_AI_LIMIT - usage.aiUsed),
    period: PLAN_LIMITS.free.aiPeriod
  };
}

function writeQuota(req: Request, res: Response, next: { day: string; count: number; aiMonth: string; aiUsed: number }) {
  ipUsage.set(clientIp(req), next);
  setCookie(res, QUOTA_COOKIE, signValue({
    day: next.day,
    count: next.count,
    aiMonth: next.aiMonth,
    aiUsed: next.aiUsed
  } satisfies QuotaPayload), 60 * 60 * 24 * 40);
}

export function reserveFreeAi(req: Request, res: Response, amount: number): AiBalance & { ok: boolean } {
  const safe = Math.max(0, Math.floor(amount));
  const current = readQuota(req);
  if (current.aiUsed + safe > FREE_AI_LIMIT) {
    return { ok: false, ...getFreeAiUsage(req) };
  }
  writeQuota(req, res, { ...current, aiUsed: current.aiUsed + safe });
  return {
    ok: true,
    used: current.aiUsed + safe,
    limit: FREE_AI_LIMIT,
    remaining: Math.max(0, FREE_AI_LIMIT - current.aiUsed - safe),
    period: PLAN_LIMITS.free.aiPeriod
  };
}

export function releaseFreeAi(req: Request, res: Response, amount: number): void {
  const safe = Math.max(0, Math.floor(amount));
  if (!safe) return;
  const current = readQuota(req);
  writeQuota(req, res, { ...current, aiUsed: Math.max(0, current.aiUsed - safe) });
}

function commitFreeUsage(req: Request, res: Response, count: number, day: string) {
  const current = readQuota(req);
  writeQuota(req, res, { ...current, day, count });
}

function releaseFreeUsage(req: Request, res: Response, previous: number, day: string) {
  const restored = Math.max(0, previous);
  const current = readQuota(req);
  if (restored === 0 && current.aiUsed === 0) {
    ipUsage.delete(clientIp(req));
    clearCookie(res, QUOTA_COOKIE);
    return;
  }
  writeQuota(req, res, { ...current, day, count: restored });
}

/** Run once before response headers leave, so Set-Cookie can still be applied. */
function beforeHeaders(res: Response, onHeaders: () => void, onAbort?: () => void) {
  let done = false;
  const finish = (kind: 'headers' | 'abort') => {
    if (done) return;
    done = true;
    if (kind === 'abort') onAbort?.();
    else onHeaders();
  };
  const origWriteHead = res.writeHead.bind(res);
  res.writeHead = ((...args: Parameters<Response['writeHead']>) => {
    finish('headers');
    return origWriteHead(...args);
  }) as Response['writeHead'];
  const origEnd = res.end.bind(res);
  res.end = ((...args: Parameters<Response['end']>) => {
    finish('headers');
    return origEnd(...args);
  }) as Response['end'];
  res.on('close', () => finish('abort'));
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
      beforeHeaders(res, () => {
        if (committed) return;
        if (res.statusCode >= 200 && res.statusCode < 400) {
          committed = true;
          void incrementUsage(access.customerId);
        }
      });
      return next();
    }

    const day = todayUtc();
    const usage = getFreeUsage(req);
    if (usage.usedToday >= FREE_DAILY_DOCS) {
      return res.status(402).json({ success: false, code: 'QUOTA', error: quotaMessage(req) });
    }

    const reserved = usage.usedToday + 1;
    const current = readQuota(req);
    ipUsage.set(clientIp(req), { ...current, day, count: reserved });

    let settled = false;
    const settleSuccessOrFailure = () => {
      if (settled) return;
      settled = true;
      if (res.statusCode >= 200 && res.statusCode < 400) {
        commitFreeUsage(req, res, reserved, day);
      } else {
        releaseFreeUsage(req, res, usage.usedToday, day);
      }
    };
    const settleAbort = () => {
      if (settled) return;
      settled = true;
      releaseFreeUsage(req, res, usage.usedToday, day);
    };
    beforeHeaders(res, settleSuccessOrFailure, settleAbort);
    return next();
  } catch (error) {
    console.error('Quota error:', error);
    return next();
  }
}
