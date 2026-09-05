#!/usr/bin/env node
/**
 * Offline regression: production must refuse missing/placeholder SESSION_SECRET.
 * Does not start the HTTP server.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cookiesPath = path.join(root, 'server/src/utils/cookies.ts');

function runAssert(env) {
  const code = `
    process.env.NODE_ENV = ${JSON.stringify(env.NODE_ENV || '')};
    if (${JSON.stringify(env.SESSION_SECRET)} === null) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = ${JSON.stringify(env.SESSION_SECRET)};
    delete process.env.SESSION_SECRET_DEV;
    const { pathToFileURL } = await import('node:url');
    const mod = await import(pathToFileURL(${JSON.stringify(cookiesPath)}).href);
    try {
      mod.assertSessionSecretConfigured();
      console.log('OK');
    } catch (e) {
      console.error(String(e && e.message || e));
      process.exit(2);
    }
  `;
  return spawnSync(process.execPath, ['--input-type=module', '-e', code], {
    encoding: 'utf8',
    env: { ...process.env, ...env, NODE_OPTIONS: '' }
  });
}

// Production missing secret → fail
{
  const r = runAssert({ NODE_ENV: 'production', SESSION_SECRET: null });
  assert.equal(r.status, 2, `expected fail, got ${r.status}: ${r.stdout}${r.stderr}`);
  assert.match(r.stderr + r.stdout, /SESSION_SECRET is required/i);
  console.log('PASS p0-1.production_missing_secret');
}

// Production placeholder → fail
{
  const r = runAssert({ NODE_ENV: 'production', SESSION_SECRET: 'pdfone-dev-secret-change-me' });
  assert.equal(r.status, 2);
  assert.match(r.stderr + r.stdout, /placeholder|SESSION_SECRET/i);
  console.log('PASS p0-1.production_rejects_placeholder');
}

// Production short secret → fail
{
  const r = runAssert({ NODE_ENV: 'production', SESSION_SECRET: 'too-short' });
  assert.equal(r.status, 2);
  assert.match(r.stderr + r.stdout, /at least 32/i);
  console.log('PASS p0-1.production_rejects_short_secret');
}

// Production strong secret → ok
{
  const r = runAssert({
    NODE_ENV: 'production',
    SESSION_SECRET: 'a'.repeat(32) + '-one2pdf-prod-test-secret'
  });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /OK/);
  console.log('PASS p0-1.production_accepts_strong_secret');
}

console.log('All SESSION_SECRET offline checks passed.');
