import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getRuntimeLocale } from '../i18n/runtime';
import { dictionaries } from '../i18n/dictionaries';

export type CheckoutPlan = 'week' | 'month' | 'year';
export type PaidPlan = CheckoutPlan | 'business' | 'life';

export type BillingState =
  | { paid: false }
  | { paid: true; plan: PaidPlan; email: string; expiresAt: string | null; canManage: boolean };

type BillingContextValue = {
  status: BillingState;
  loading: boolean;
  refresh: () => Promise<void>;
  checkout: (plan: CheckoutPlan) => Promise<void>;
  confirm: (sessionId: string) => Promise<BillingState>;
  portal: () => Promise<void>;
  logout: () => Promise<void>;
};

const BillingContext = createContext<BillingContextValue | null>(null);

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
      setStatus(data?.paid ? data : { paid: false });
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
      body: JSON.stringify({ plan })
    });
    if (!data?.url) throw new Error(dictionaries[getRuntimeLocale()].pricing.payFail);
    window.location.href = data.url;
  }, []);

  const confirm = useCallback(async (sessionId: string) => {
    const data = await billingRequest('/api/billing/confirm', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    });
    const next = data?.paid ? data : { paid: false as const };
    setStatus(next);
    return next;
  }, []);

  const portal = useCallback(async () => {
    const data = await billingRequest('/api/billing/portal', { method: 'POST' });
    if (data?.url) window.location.href = data.url;
  }, []);

  const logout = useCallback(async () => {
    await billingRequest('/api/billing/logout', { method: 'POST' });
    setStatus({ paid: false });
  }, []);

  const value = useMemo<BillingContextValue>(() => ({
    status,
    loading,
    refresh,
    checkout,
    confirm,
    portal,
    logout
  }), [status, loading, refresh, checkout, confirm, portal, logout]);

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling(): BillingContextValue {
  const context = useContext(BillingContext);
  if (!context) throw new Error('useBilling must be used inside BillingProvider');
  return context;
}
