import { normalizeEmail } from './entitlements.js';

const BUILTIN_SUPERADMINS = [
  'kameltalbi.tn@gmail.com',
  'talbio.omar@gmail.com'
];

export function superadminEmails(): string[] {
  const extra = (process.env.SUPERADMIN_EMAILS || '')
    .split(',')
    .map((value) => normalizeEmail(value))
    .filter(Boolean);
  return [...new Set([...BUILTIN_SUPERADMINS.map(normalizeEmail), ...extra])];
}

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  const needle = normalizeEmail(email);
  return Boolean(needle) && superadminEmails().includes(needle);
}
