import { normalizeEmail } from './entitlements.js';

/** Superadmin emails come only from SUPERADMIN_EMAILS (comma-separated). Never hardcode identities. */
export function superadminEmails(): string[] {
  return (process.env.SUPERADMIN_EMAILS || '')
    .split(',')
    .map((value) => normalizeEmail(value))
    .filter(Boolean);
}

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  const needle = normalizeEmail(email);
  return Boolean(needle) && superadminEmails().includes(needle);
}
