import type { Messages } from '../i18n/types';

export function remainingLabel(
  expiresAt: string | null,
  t: (template: string, vars?: Record<string, string | number>) => string,
  m: Messages
) {
  if (!expiresAt) return m.account.unlimitedTime;
  const ms = Date.parse(expiresAt) - Date.now();
  if (ms <= 0) return m.account.expired;
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.max(1, Math.ceil((ms % 86_400_000) / 3_600_000));
  if (days >= 1) return t(m.account.daysLeft, { count: days });
  return t(m.account.hoursLeft, { count: hours });
}
