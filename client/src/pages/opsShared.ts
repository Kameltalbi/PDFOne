export type OpsSection = 'dashboard' | 'users' | 'subscriptions' | 'blog' | 'seo' | 'system';

export type OpsSession = {
  configured: boolean;
  authenticated: boolean;
  secretLogin?: boolean;
  email?: string | null;
  name?: string | null;
};

export type EntitlementRow = {
  email?: string;
  customerId: string;
  plan: string;
  status: string;
  expiresAt: string | null;
  active: boolean;
  source: 'admin' | 'stripe';
  note: string;
  docsUsed: number;
  usedToday: number;
  aiUsed: number;
  canManageStripe: boolean;
};

export const OPS_SECTIONS: Array<{ id: OpsSection; label: string }> = [
  { id: 'dashboard', label: 'Tableau de bord' },
  { id: 'users', label: 'Utilisateurs' },
  { id: 'subscriptions', label: 'Abonnements' },
  { id: 'blog', label: 'Blog / Articles' },
  { id: 'seo', label: 'SEO' },
  { id: 'system', label: 'Système' }
];

export function parseOpsSection(hash: string): OpsSection {
  const value = hash.replace(/^#/, '').split('?')[0];
  if (value === 'users' || value === 'subscriptions' || value === 'blog' || value === 'seo' || value === 'system') {
    return value;
  }
  return 'dashboard';
}

export function formatDate(value: string | null | undefined, withTime = false) {
  if (!value) return '—';
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('fr-CA', withTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' });
}

export function formatMoney(cents: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0
    }).format(Math.max(0, cents) / 100);
  } catch {
    return `$${(Math.max(0, cents) / 100).toFixed(0)}`;
  }
}

export function formatBytes(bytes: number | null | undefined) {
  if (bytes == null || !Number.isFinite(bytes)) return '—';
  const units = ['o', 'Ko', 'Mo', 'Go', 'To'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function initials(value: string | null | undefined) {
  const parts = String(value || '').trim().split(/[\s@._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
  return letters.toUpperCase() || 'AD';
}

export function planLabel(plan: string, bucket?: string) {
  if (bucket === 'free' || plan === 'free') return 'Gratuit';
  if (bucket === 'week' || plan === 'week') return 'Pass 7j';
  if (plan === 'month') return 'Pro';
  if (plan === 'year') return 'Pro annuel';
  if (plan === 'business') return 'Business';
  if (plan === 'life') return 'À vie';
  return plan || 'Gratuit';
}

export function planTone(plan: string, bucket?: string): 'free' | 'pro' | 'week' | 'off' {
  if (bucket === 'inactive') return 'off';
  if (bucket === 'week' || plan === 'week') return 'week';
  if (bucket === 'pro' || (plan && plan !== 'free')) return 'pro';
  return 'free';
}
