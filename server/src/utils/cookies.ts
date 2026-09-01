import crypto from 'crypto';
import type { Request, Response } from 'express';

function secret() {
  return process.env.SESSION_SECRET || 'pdfone-dev-secret-change-me';
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function signValue(payload: unknown): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyValue<T>(token: string | null | undefined): T | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  if (!safeEqual(sig, expected)) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

export function readCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

function cookieDomain(): string {
  const raw = process.env.COOKIE_DOMAIN || process.env.APP_URL || '';
  try {
    const host = raw.startsWith('http') ? new URL(raw).hostname : raw.replace(/^\./, '');
    if (!host || host === 'localhost' || host.endsWith('.local') || /^\d+\.\d+/.test(host)) return '';
    const parts = host.split('.').filter(Boolean);
    if (parts.length < 2) return '';
    return `; Domain=.${parts.slice(-2).join('.')}`;
  } catch {
    return '';
  }
}

function cookieFlags(maxAgeSec: number) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${cookieDomain()}${secure}`;
}

export function setCookie(res: Response, name: string, value: string, maxAgeSec: number) {
  res.append('Set-Cookie', `${name}=${encodeURIComponent(value)}; ${cookieFlags(maxAgeSec)}`);
}

export function clearCookie(res: Response, name: string) {
  res.append('Set-Cookie', `${name}=; ${cookieFlags(0)}`);
}

export function clientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}
