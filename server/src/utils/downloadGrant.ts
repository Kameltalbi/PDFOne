import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import { readCookie, setCookie } from './cookies.js';
import { tempTtlMs } from './temp.js';

export const DOWNLOAD_OWNER_COOKIE = 'pdfone_dl';

type Grant = {
  owner: string;
  expiresAt: number;
};

const grants = new Map<string, Grant>();

function pruneGrants(now = Date.now()) {
  if (grants.size < 200) return;
  for (const [key, grant] of grants) {
    if (grant.expiresAt <= now) grants.delete(key);
  }
}

/** Stable anonymous download owner bound via HttpOnly cookie. */
export function ensureDownloadOwner(req: Request, res: Response): string {
  const existing = readCookie(req, DOWNLOAD_OWNER_COOKIE)?.trim();
  if (existing && existing.length >= 16 && existing.length <= 128) {
    return existing;
  }
  const owner = crypto.randomBytes(24).toString('base64url');
  setCookie(res, DOWNLOAD_OWNER_COOKIE, owner, 60 * 60 * 36);
  return owner;
}

export function registerDownloadGrant(filename: string, owner: string): void {
  pruneGrants();
  grants.set(filename, {
    owner,
    expiresAt: Date.now() + tempTtlMs()
  });
}

export function revokeDownloadGrant(filename: string): void {
  grants.delete(filename);
}

export function canDownloadFile(filename: string, owner: string | null | undefined): boolean {
  pruneGrants();
  const grant = grants.get(filename);
  if (!grant) return false;
  if (grant.expiresAt <= Date.now()) {
    grants.delete(filename);
    return false;
  }
  if (!owner) return false;
  const a = Buffer.from(grant.owner);
  const b = Buffer.from(owner);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Strip absolute filepath and bind download to the request's download-owner cookie. */
export function publicToolResult<T extends { filename: string; filepath?: string; downloadUrl: string }>(
  req: Request,
  res: Response,
  result: T
): Omit<T, 'filepath'> {
  const owner = ensureDownloadOwner(req, res);
  registerDownloadGrant(result.filename, owner);
  const extra = result as T & { textFilename?: string };
  if (typeof extra.textFilename === 'string' && extra.textFilename) {
    registerDownloadGrant(extra.textFilename, owner);
  }
  const { filepath: _filepath, ...rest } = result;
  return rest;
}
