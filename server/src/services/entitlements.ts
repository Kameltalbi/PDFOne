import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export type PaidPlan = 'week' | 'year' | 'life';

export type Entitlement = {
  email: string;
  customerId: string;
  plan: PaidPlan;
  status: 'active' | 'canceled';
  expiresAt: string | null;
  subscriptionId?: string;
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

export function isEntitlementActive(entry: Entitlement | null | undefined, now = Date.now()): boolean {
  if (!entry || entry.status !== 'active') return false;
  if (!entry.expiresAt) return true;
  return Date.parse(entry.expiresAt) > now;
}

export async function upsertEntitlement(entry: Entitlement): Promise<Entitlement> {
  return withLock(async () => {
    const data = await readAll();
    data[entry.customerId] = entry;
    await writeAll(data);
    return entry;
  });
}

export async function getEntitlement(customerId: string | null | undefined): Promise<Entitlement | null> {
  if (!customerId) return null;
  const data = await readAll();
  return data[customerId] || null;
}

export async function cancelEntitlement(customerId: string): Promise<void> {
  await withLock(async () => {
    const data = await readAll();
    if (!data[customerId]) return;
    data[customerId] = { ...data[customerId], status: 'canceled' };
    await writeAll(data);
  });
}
