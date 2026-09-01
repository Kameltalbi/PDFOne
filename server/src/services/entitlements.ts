import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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
};

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../data');
const dataFile = path.join(dataDir, 'entitlements.json');

let queue = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(() => undefined, () => undefined);
  return run;
}

async function readAll(): Promise<Record<string, Entitlement>> {
  try {
    const raw = await fs.readFile(dataFile, 'utf8');
    return JSON.parse(raw) as Record<string, Entitlement>;
  } catch {
    return {};
  }
}

async function writeAll(data: Record<string, Entitlement>) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
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

export async function upsertEntitlement(entry: Entitlement): Promise<Entitlement> {
  return withLock(async () => {
    const data = await readAll();
    const previous = data[entry.customerId];
    const next: Entitlement = {
      ...previous,
      ...entry,
      docsUsed: previous?.docsUsed || 0,
      docsByDay: previous?.docsByDay || {}
    };
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

export async function cancelEntitlement(customerId: string): Promise<void> {
  await withLock(async () => {
    const data = await readAll();
    if (!data[customerId]) return;
    data[customerId] = { ...data[customerId], status: 'canceled' };
    await writeAll(data);
  });
}
