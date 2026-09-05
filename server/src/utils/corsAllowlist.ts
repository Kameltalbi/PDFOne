import type { IncomingMessage } from 'node:http';

function parseOriginList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

function originFromUrl(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.origin;
  } catch {
    return null;
  }
}

/** Explicit CORS allowlist — never reflect arbitrary Origin with credentials. */
export function allowedCorsOrigins(): string[] {
  const fromEnv = parseOriginList(process.env.CORS_ORIGINS);
  const app = originFromUrl(process.env.APP_URL);
  const defaults = process.env.NODE_ENV === 'production'
    ? ['https://one2pdf.com', 'https://www.one2pdf.com']
    : [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5180',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:5180'
    ];

  return [...new Set([...fromEnv, ...(app ? [app] : []), ...defaults])];
}

export function corsOriginCallback(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean | string) => void
) {
  const allowlist = allowedCorsOrigins();
  // Same-origin / non-browser tools (curl, server-to-server) send no Origin.
  if (!origin) {
    callback(null, true);
    return;
  }
  if (allowlist.includes(origin)) {
    callback(null, origin);
    return;
  }
  callback(null, false);
}

export function isOriginAllowed(req: IncomingMessage): boolean {
  const origin = req.headers.origin;
  if (!origin) return true;
  return allowedCorsOrigins().includes(origin);
}
