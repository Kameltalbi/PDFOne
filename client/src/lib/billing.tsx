import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getRuntimeLocale } from '../i18n/runtime';
import { dictionaries } from '../i18n/dictionaries';

export type CheckoutPlan = 'week' | 'month' | 'year';
export type PaidPlan = CheckoutPlan | 'business' | 'life';
export type UserSession = { name: string; email: string };

export type PlanAmounts = {
  week: number;
  month: number;
  year: number;
};

export const DEFAULT_AMOUNTS: PlanAmounts = {
  week: 199,
  month: 399,
  year: 3490
};

function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    return '';
  }
}

export type BillingState =
  | { paid: false; user: UserSession | null; usedToday?: number; dailyLimit?: number; remainingToday?: number }
  | {
    paid: true;
    user: UserSession | null;
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
  prices: PlanAmounts;
  refresh: () => Promise<void>;
  checkout: (plan: CheckoutPlan) => Promise<void>;
  confirm: (sessionId: string) => Promise<BillingState>;
  login: (email: string) => Promise<BillingState>;
  loginWithPassword: (email: string, password: string) => Promise<BillingState>;
  signup: (name: string, email: string, password: string) => Promise<BillingState>;
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
  if (data?.paid) return { ...data, user: data.user ?? null };
  return {
    paid: false,
    user: data && 'user' in data ? data.user : null,
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
      'X-Timezone': browserTimeZone(),
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
  const [status, setStatus] = useState<BillingState>({ paid: false, user: null });
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<PlanAmounts>(DEFAULT_AMOUNTS);

  const refresh = useCallback(async () => {
    try {
      const [data, nextPrices] = await Promise.all([
        billingRequest('/api/billing/me'),
        billingRequest('/api/billing/prices').catch(() => null)
      ]);
      if (nextPrices && typeof nextPrices.week === 'number' && typeof nextPrices.month === 'number' && typeof nextPrices.year === 'number') {
        setPrices({ week: nextPrices.week, month: nextPrices.month, year: nextPrices.year });
      }
      if (data?.user || data?.paid) {
        if (data.email) rememberEmail(data.email);
        else if (data.user?.email) rememberEmail(data.user.email);
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
      setStatus({ paid: false, user: null });
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

  const loginWithPassword = useCallback(async (email: string, password: string) => {
    const data = await billingRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const next = asState(data);
    rememberEmail(next.user?.email || (next.paid ? next.email : email));
    setStatus(next);
    return next;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const data = await billingRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    const next = asState(data);
    rememberEmail(next.user?.email || email);
    setStatus(next);
    return next;
  }, []);

  const portal = useCallback(async () => {
    const data = await billingRequest('/api/billing/portal', { method: 'POST' });
    if (data?.url) window.location.href = data.url;
  }, []);

  const logout = useCallback(async () => {
    forgetEmail();
    await billingRequest('/api/auth/logout', { method: 'POST' });
    setStatus({ paid: false, user: null });
  }, []);

  const value = useMemo<BillingContextValue>(() => ({
    status,
    loading,
    prices,
    refresh,
    checkout,
    confirm,
    login,
    loginWithPassword,
    signup,
    portal,
    logout
  }), [status, loading, prices, refresh, checkout, confirm, login, loginWithPassword, signup, portal, logout]);

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling(): BillingContextValue {
  const context = useContext(BillingContext);
  if (!context) throw new Error('useBilling must be used inside BillingProvider');
  return context;
}
