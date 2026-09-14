import path from 'path';
import { fileURLToPath } from 'url';

import {
  AI_SCHEMA_VERSION,
  calendarMonthKey,
  limitsForPlan,
  PLAN_LIMITS,
  type AiPeriod
} from '@mini-pdf-tools/shared';
import { createJsonStoreLock, readJsonFile, writeJsonAtomic } from '../utils/jsonStore.js';

export type PaidPlan = 'week' | 'month' | 'year';
export type StoredPlan = PaidPlan | 'business' | 'life';

export type Entitlement = {
  email: string;
  customerId: string;
  plan: StoredPlan;
  status: 'active' | 'canceled';
  expiresAt: string | null;
  subscriptionId?: string;
  docsUsed?: number;
  docsByDay?: Record<string, number>;
  aiUsed?: number;
  aiPeriodKey?: string;
  aiSchemaVersion?: number;
  source?: 'stripe' | 'admin';
  note?: string;
};

export type AiBalance = {
  used: number;
  limit: number;
  remaining: number;
  period: AiPeriod;
};

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../data');
const dataFile = path.join(dataDir, 'entitlements.json');
const withLock = createJsonStoreLock('entitlements');

type MemoryAi = { used: number; periodKey: string; schemaVersion: number };
const memoryAi = new Map<string, MemoryAi>();

async function readAll(): Promise<Record<string, Entitlement>> {
  return readJsonFile(dataFile, { empty: {}, corruptCode: 'ENTITLEMENTS_CORRUPT' });
}

async function writeAll(data: Record<string, Entitlement>) {
  await writeJsonAtomic(dataFile, data);
}

export function normalizeEmail(value: string | null | undefined): string {
  return String(value || '').trim().toLowerCase();
}

export function isEntitlementActive(entry: Entitlement | null | undefined, now = Date.now()): boolean {
  if (!entry || entry.status !== 'active') return false;
  if (!entry.expiresAt) return true;
  return Date.parse(entry.expiresAt) > now;
}

export function todayUtc(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function usageSnapshot(entry: Entitlement | null | undefined, now = Date.now()) {
  const byDay = entry?.docsByDay || {};
  const usedToday = byDay[todayUtc(new Date(now))] || 0;
  return {
    docsUsed: entry?.docsUsed || 0,
    usedToday
  };
}

function remainingMs(entry: Entitlement, now = Date.now()): number | null {
  if (!entry.expiresAt) return null;
  return Math.max(0, Date.parse(entry.expiresAt) - now);
}

export function pickBestEntitlement(entries: Entitlement[], now = Date.now()): Entitlement | null {
  const active = entries.filter((entry) => isEntitlementActive(entry, now));
  if (active.length === 0) return null;
  active.sort((a, b) => {
    const aMs = remainingMs(a, now);
    const bMs = remainingMs(b, now);
    if (aMs === null) return -1;
    if (bMs === null) return 1;
    return bMs - aMs;
  });
  return active[0];
}

function periodKeyFor(entry: Pick<Entitlement, 'plan' | 'expiresAt'>, now = Date.now()): string {
  if (entry.plan === 'week') return entry.expiresAt || 'pass';
  return calendarMonthKey(new Date(now));
}

/** Fresh 100 credits for every still-valid Pass that has not been migrated yet. */
export function normalizeAiFields(entry: Entitlement, now = Date.now()): Entitlement {
  const key = periodKeyFor(entry, now);
  if (entry.plan === 'week') {
    if ((entry.aiSchemaVersion || 0) < AI_SCHEMA_VERSION) {
      return {
        ...entry,
        aiUsed: 0,
        aiPeriodKey: key,
        aiSchemaVersion: AI_SCHEMA_VERSION
      };
    }
    return {
      ...entry,
      aiPeriodKey: entry.aiPeriodKey || key,
      aiSchemaVersion: AI_SCHEMA_VERSION
    };
  }
  if (entry.aiPeriodKey !== key) {
    return {
      ...entry,
      aiUsed: 0,
      aiPeriodKey: key,
      aiSchemaVersion: AI_SCHEMA_VERSION
    };
  }
  return { ...entry, aiSchemaVersion: AI_SCHEMA_VERSION };
}

export function aiSnapshot(entry: Entitlement | null | undefined, now = Date.now()): AiBalance {
  if (!entry || !isEntitlementActive(entry, now)) {
    const free = PLAN_LIMITS.free;
    return { used: 0, limit: free.aiCredits, remaining: free.aiCredits, period: free.aiPeriod };
  }
  const normalized = normalizeAiFields(entry, now);
  const limits = limitsForPlan(normalized.plan);
  const used = normalized.aiUsed || 0;
  return {
    used,
    limit: limits.aiCredits,
    remaining: Math.max(0, limits.aiCredits - used),
    period: limits.aiPeriod
  };
}

export async function upsertEntitlement(entry: Entitlement): Promise<Entitlement> {
  return withLock(async () => {
    const data = await readAll();
    const previous = data[entry.customerId];
    const samePass = previous?.plan === entry.plan && previous?.expiresAt === entry.expiresAt;
    const merged: Entitlement = {
      ...previous,
      ...entry,
      docsUsed: previous?.docsUsed || 0,
      docsByDay: previous?.docsByDay || {},
      aiUsed: samePass ? (previous?.aiUsed || 0) : 0,
      aiPeriodKey: samePass ? previous?.aiPeriodKey : undefined,
      aiSchemaVersion: samePass ? previous?.aiSchemaVersion : undefined
    };
    const next = normalizeAiFields(merged);
    data[entry.customerId] = next;
    await writeAll(data);
    return next;
  });
}

export async function getEntitlement(customerId: string | null | undefined): Promise<Entitlement | null> {
  if (!customerId) return null;
  const data = await readAll();
  return data[customerId] || null;
}

export async function getActiveEntitlementByEmail(email: string | null | undefined): Promise<Entitlement | null> {
  const needle = normalizeEmail(email);
  if (!needle) return null;
  const data = await readAll();
  return pickBestEntitlement(
    Object.values(data).filter((entry) => normalizeEmail(entry.email) === needle)
  );
}

export async function listAllEntitlements(): Promise<Entitlement[]> {
  const data = await readAll();
  return Object.values(data);
}

export async function listEntitlementsByEmail(email: string | null | undefined): Promise<Entitlement[]> {
  const needle = normalizeEmail(email);
  if (!needle) return [];
  const data = await readAll();
  return Object.values(data)
    .filter((entry) => normalizeEmail(entry.email) === needle)
    .sort((a, b) => {
      const aTime = a.expiresAt ? Date.parse(a.expiresAt) : 0;
      const bTime = b.expiresAt ? Date.parse(b.expiresAt) : 0;
      return bTime - aTime;
    });
}

export function adminCustomerId(email: string): string {
  return `admin:${normalizeEmail(email)}`;
}

export async function grantComplimentary(email: string, days: number, note?: string): Promise<Entitlement> {
  const normalized = normalizeEmail(email);
  const safeDays = Math.min(730, Math.max(1, Math.floor(days)));
  const plan: StoredPlan = safeDays <= 7 ? 'week' : safeDays <= 31 ? 'month' : 'year';
  const expiresAt = new Date(Date.now() + safeDays * 24 * 60 * 60 * 1000).toISOString();
  return upsertEntitlement({
    email: normalized,
    customerId: adminCustomerId(normalized),
    plan,
    status: 'active',
    expiresAt,
    source: 'admin',
    note: (note || '').trim().slice(0, 200) || `Offert ${safeDays} jour(s)`
  });
}

export async function resetEntitlementUsage(customerId: string): Promise<Entitlement | null> {
  return withLock(async () => {
    const data = await readAll();
    const entry = data[customerId];
    if (!entry) return null;
    const day = todayUtc();
    const docsByDay = { ...(entry.docsByDay || {}) };
    delete docsByDay[day];
    const next = normalizeAiFields({ ...entry, docsByDay, aiUsed: 0 });
    data[customerId] = next;
    await writeAll(data);
    return next;
  });
}

export async function incrementUsage(customerId: string | null | undefined): Promise<void> {
  if (!customerId) return;
  await withLock(async () => {
    const data = await readAll();
    const entry = data[customerId];
    if (!entry || !isEntitlementActive(entry)) return;
    const day = todayUtc();
    const docsByDay = { ...(entry.docsByDay || {}) };
    docsByDay[day] = (docsByDay[day] || 0) + 1;
    data[customerId] = {
      ...entry,
      docsUsed: (entry.docsUsed || 0) + 1,
      docsByDay
    };
    await writeAll(data);
  });
}

function applyDelta(state: MemoryAi, plan: StoredPlan, delta: number, now = Date.now()): MemoryAi | null {
  const fake: Entitlement = {
    email: '',
    customerId: '',
    plan,
    status: 'active',
    expiresAt: plan === 'week' ? state.periodKey : null,
    aiUsed: state.used,
    aiPeriodKey: state.periodKey,
    aiSchemaVersion: state.schemaVersion
  };
  const normalized = normalizeAiFields(fake, now);
  const used = Math.max(0, (normalized.aiUsed || 0) + delta);
  const limit = limitsForPlan(plan).aiCredits;
  if (delta > 0 && used > limit) return null;
  return {
    used,
    periodKey: normalized.aiPeriodKey || periodKeyFor(fake, now),
    schemaVersion: AI_SCHEMA_VERSION
  };
}

export async function reserveAiCredits(
  customerId: string,
  plan: StoredPlan,
  amount: number
): Promise<AiBalance & { ok: boolean }> {
  const safeAmount = Math.max(0, Math.floor(amount));
  const limits = limitsForPlan(plan);
  if (safeAmount === 0) {
    return { ok: true, used: 0, limit: limits.aiCredits, remaining: limits.aiCredits, period: limits.aiPeriod };
  }
  return withLock(async () => {
    const data = await readAll();
    const stored = data[customerId];
    if (!stored || !isEntitlementActive(stored)) {
      const current = memoryAi.get(customerId) || { used: 0, periodKey: periodKeyFor({ plan, expiresAt: null }), schemaVersion: AI_SCHEMA_VERSION };
      const next = applyDelta(current, plan, safeAmount);
      if (!next) {
        const snap = applyDelta(current, plan, 0)!;
        return { ok: false, used: snap.used, limit: limits.aiCredits, remaining: Math.max(0, limits.aiCredits - snap.used), period: limits.aiPeriod };
      }
      memoryAi.set(customerId, next);
      return { ok: true, used: next.used, limit: limits.aiCredits, remaining: Math.max(0, limits.aiCredits - next.used), period: limits.aiPeriod };
    }
    const normalized = normalizeAiFields(stored);
    const used = (normalized.aiUsed || 0) + safeAmount;
    if (used > limits.aiCredits) {
      const current = normalized.aiUsed || 0;
      return {
        ok: false,
        used: current,
        limit: limits.aiCredits,
        remaining: Math.max(0, limits.aiCredits - current),
        period: limits.aiPeriod
      };
    }
    const next = { ...normalized, aiUsed: used };
    data[customerId] = next;
    await writeAll(data);
    return {
      ok: true,
      used,
      limit: limits.aiCredits,
      remaining: Math.max(0, limits.aiCredits - used),
      period: limits.aiPeriod
    };
  });
}

export async function releaseAiCredits(customerId: string, plan: StoredPlan, amount: number): Promise<void> {
  const safeAmount = Math.max(0, Math.floor(amount));
  if (!safeAmount) return;
  await withLock(async () => {
    const data = await readAll();
    const stored = data[customerId];
    if (!stored || !isEntitlementActive(stored)) {
      const current = memoryAi.get(customerId);
      if (!current) return;
      const next = applyDelta(current, plan, -safeAmount);
      if (next) memoryAi.set(customerId, next);
      return;
    }
    const normalized = normalizeAiFields(stored);
    data[customerId] = { ...normalized, aiUsed: Math.max(0, (normalized.aiUsed || 0) - safeAmount) };
    await writeAll(data);
  });
}

export async function cancelEntitlement(customerId: string): Promise<void> {
  await withLock(async () => {
    const data = await readAll();
    if (!data[customerId]) return;
    data[customerId] = { ...data[customerId], status: 'canceled' };
    await writeAll(data);
  });
}
