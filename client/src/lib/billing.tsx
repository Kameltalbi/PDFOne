import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getRuntimeLocale } from '../i18n/runtime';
import { dictionaries } from '../i18n/dictionaries';

export type CheckoutPlan = 'week' | 'month' | 'year';
export type PaidPlan = CheckoutPlan | 'business' | 'life';

export type BillingState =
  | { paid: false; usedToday?: number; dailyLimit?: number; remainingToday?: number }
  | {
    paid: true;
    plan: PaidPlan;
    email: string;
    expiresAt: string | null;
    canManage: boolean;
    docsUsed: number;
    usedToday: number;
    remainingMs: number | null;
  };

type BillingContextValue = {
  status: BillingState;
  loading: boolean;
  refresh: () => Promise<void>;
  checkout: (plan: CheckoutPlan) => Promise<void>;
  confirm: (sessionId: string) => Promise<BillingState>;
  login: (email: string) => Promise<BillingState>;
  portal: () => Promise<void>;
  logout: () => Promise<void>;
};

const BillingContext = createContext<BillingContextValue | null>(null);
const EMAIL_KEY = 'one2pdf_email';
const SKIP_RESTORE_KEY = 'one2pdf_restore_skip';

export function rememberedEmail(): string {
  try {
    return localStorage.getItem(EMAIL_KEY) || '';
  } catch {
    return '';
  }
}

function rememberEmail(email: string | undefined) {
  if (!email) return;
  try {
    localStorage.setItem(EMAIL_KEY, email);
    sessionStorage.removeItem(SKIP_RESTORE_KEY);
  } catch {
    /* ignore */
  }
}

function skipAutoRestore() {
  try {
    sessionStorage.setItem(SKIP_RESTORE_KEY, '1');
  } catch {
    /* ignore */
  }
}

function shouldAutoRestore() {
  try {
    return sessionStorage.getItem(SKIP_RESTORE_KEY) !== '1';
  } catch {
    return true;
  }
}

function forgetEmail() {
  try {
    localStorage.removeItem(EMAIL_KEY);
  } catch {
    /* ignore */
  }
}

function asState(data: BillingState | undefined): BillingState {
  if (data?.paid) return data;
  return {
    paid: false,
    usedToday: data && 'usedToday' in data ? data.usedToday : 0,
    dailyLimit: data && 'dailyLimit' in data ? data.dailyLimit : 3,
    remainingToday: data && 'remainingToday' in data ? data.remainingToday : 3
  };
}

async function billingRequest(path: string, init?: RequestInit) {
  const locale = getRuntimeLocale();
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': locale,
      ...(init?.headers || {})
    },
    ...init
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || dictionaries[locale].common.processingFailed);
  }
  return payload.data;
}

export function BillingProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<BillingState>({ paid: false });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await billingRequest('/api/billing/me');
      if (data?.paid) {
        rememberEmail(data.email);
        setStatus(asState(data));
        return;
      }
      const email = rememberedEmail();
      if (email && shouldAutoRestore()) {
        try {
          const restored = await billingRequest('/api/billing/restore', {
            method: 'POST',
            body: JSON.stringify({ email })
          });
          if (restored?.paid) {
            rememberEmail(restored.email);
            setStatus(asState(restored));
            return;
          }
          skipAutoRestore();
        } catch {
          skipAutoRestore();
        }
      }
      setStatus(asState(data));
    } catch {
      setStatus({ paid: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const checkout = useCallback(async (plan: CheckoutPlan) => {
    const data = await billingRequest('/api/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan, email: rememberedEmail() })
    });
    if (!data?.url) throw new Error(dictionaries[getRuntimeLocale()].pricing.payFail);
    window.location.href = data.url;
  }, []);

  const confirm = useCallback(async (sessionId: string) => {
    const data = await billingRequest('/api/billing/confirm', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    });
    const next = asState(data);
    if (next.paid) rememberEmail(next.email);
    setStatus(next);
    return next;
  }, []);

  const login = useCallback(async (email: string) => {
    const data = await billingRequest('/api/billing/restore', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    const next = asState(data);
    if (next.paid) rememberEmail(next.email);
    setStatus(next);
    return next;
  }, []);

  const portal = useCallback(async () => {
    const data = await billingRequest('/api/billing/portal', { method: 'POST' });
    if (data?.url) window.location.href = data.url;
  }, []);

  const logout = useCallback(async () => {
    forgetEmail();
    await billingRequest('/api/billing/logout', { method: 'POST' });
    setStatus({ paid: false });
  }, []);

  const value = useMemo<BillingContextValue>(() => ({
    status,
    loading,
    refresh,
    checkout,
    confirm,
    login,
    portal,
    logout
  }), [status, loading, refresh, checkout, confirm, login, portal, logout]);

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling(): BillingContextValue {
  const context = useContext(BillingContext);
  if (!context) throw new Error('useBilling must be used inside BillingProvider');
  return context;
}
