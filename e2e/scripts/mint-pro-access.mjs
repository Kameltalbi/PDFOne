#!/usr/bin/env node
/**
 * Mints a local Pro access cookie + matching entitlement for E2E.
 * Writes e2e/.env.local (mode 0600). Never prints the cookie value.
 *
 * Usage: node e2e/scripts/mint-pro-access.mjs
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const serverEnvPath = path.join(root, 'server/.env');
const outPath = path.join(root, 'e2e/.env.local');
const entitlementsPath = path.join(root, 'data/entitlements.json');

const E2E_EMAIL = 'e2e-pro@one2pdf.local';
const E2E_CUSTOMER_ID = 'cus_e2e_pro_local';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function signValue(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

const serverEnv = loadEnvFile(serverEnvPath);
const secret = serverEnv.SESSION_SECRET || process.env.SESSION_SECRET || 'pdfone-dev-secret-change-me';
if (!serverEnv.SESSION_SECRET) {
  console.warn('Warning: SESSION_SECRET missing in server/.env — using default (dev only).');
}

const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
const access = {
  email: E2E_EMAIL,
  customerId: E2E_CUSTOMER_ID,
  plan: 'month',
  expiresAt
};
const cookie = signValue(access, secret);

fs.mkdirSync(path.dirname(entitlementsPath), { recursive: true });
let entitlements = {};
if (fs.existsSync(entitlementsPath)) {
  try {
    entitlements = JSON.parse(fs.readFileSync(entitlementsPath, 'utf8'));
  } catch {
    throw new Error(`Corrupt entitlements file: ${entitlementsPath}`);
  }
}
entitlements[E2E_CUSTOMER_ID] = {
  email: E2E_EMAIL,
  customerId: E2E_CUSTOMER_ID,
  plan: 'month',
  status: 'active',
  expiresAt,
  source: 'admin',
  note: 'Local E2E only — do not deploy'
};
const tmpEnt = `${entitlementsPath}.${process.pid}.tmp`;
fs.writeFileSync(tmpEnt, `${JSON.stringify(entitlements, null, 2)}\n`);
fs.renameSync(tmpEnt, entitlementsPath);

const existing = loadEnvFile(outPath);
const lines = Object.entries({
  ...existing,
  E2E_ACCESS_COOKIE: cookie
})
  .filter(([key]) => /^[A-Z0-9_]+$/.test(key))
  .map(([key, value]) => `${key}=${value}`);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${lines.join('\n')}\n`, { mode: 0o600 });
try {
  fs.chmodSync(outPath, 0o600);
} catch {
  /* ignore on platforms without chmod */
}

console.log('Pro E2E access ready.');
console.log(`- entitlement: ${E2E_EMAIL} (${E2E_CUSTOMER_ID})`);
console.log(`- wrote: e2e/.env.local (mode 0600, cookie not printed)`);
console.log('Run: npm run test:e2e -- --project=chromium-desktop e2e/specs/pro-large-file.spec.ts');
