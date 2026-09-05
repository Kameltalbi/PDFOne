#!/usr/bin/env node
/**
 * Local defensive security probes for One2PDF (P0/P1 regression suite).
 * Writes JSON results only (no secrets, no document body dumps).
 *
 * Expectation: every `ok: true` means the control is correctly enforced.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = process.env.E2E_API_URL || 'http://127.0.0.1:3002';
const fixtures = path.join(root, 'capacity/fixtures');
const outDir = path.join(root, 'security');
const results = [];

function record(id, ok, detail = {}) {
  results.push({ id, ok, ...detail });
  const mark = ok ? 'PASS' : 'FAIL';
  console.log(`${mark} ${id}${detail.note ? ` — ${detail.note}` : ''}`);
}

function cookieJarFrom(res) {
  const raw = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
  return raw.map((c) => c.split(';')[0]).filter(Boolean).join('; ');
}

function mergeCookies(...parts) {
  return parts.filter(Boolean).join('; ');
}

async function postCompress(headers = {}, filePath = path.join(fixtures, 'text-2pages.pdf'), quality = 'high') {
  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(filePath)]), path.basename(filePath));
  form.append('quality', quality);
  const res = await fetch(`${API}/api/compress`, { method: 'POST', headers, body: form });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 200) }; }
  return { res, json, cookies: cookieJarFrom(res) };
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const marker = `ONE2PDF_SECURITY_TEST_${crypto.randomUUID()}`;

  // --- P1-2 Health path hygiene ---
  {
    const res = await fetch(`${API}/health`);
    const body = await res.json();
    const blob = JSON.stringify(body);
    record('p1-2.health_no_absolute_path', !body.tempDisk?.path && !/\/Volumes\/|\/Users\/|\/var\/folders\//.test(blob), {
      note: body.tempDisk?.path ? 'tempDisk.path still present' : 'path omitted'
    });
    record('health.unauthenticated', res.status === 200, { note: 'liveness remains public' });
  }

  // --- P1-4 CORS allowlist ---
  {
    const evil = await fetch(`${API}/api/billing/prices`, {
      headers: { Origin: 'https://evil.example' }
    });
    const acao = evil.headers.get('access-control-allow-origin');
    record('p1-4.cors_rejects_evil_origin', acao !== 'https://evil.example', {
      note: `ACAO=${acao}`
    });

    const local = await fetch(`${API}/api/billing/prices`, {
      headers: { Origin: 'http://127.0.0.1:5180' }
    });
    const localAcao = local.headers.get('access-control-allow-origin');
    const localAcac = local.headers.get('access-control-allow-credentials');
    record('p1-4.cors_allows_dev_origin', localAcao === 'http://127.0.0.1:5180' && localAcac === 'true', {
      note: `ACAO=${localAcao} ACAC=${localAcac}`
    });
  }

  // --- P0-1 SESSION_SECRET: cookies still mint in current env (runtime smoke) ---
  {
    const a = await postCompress({ 'X-Forwarded-For': '198.51.100.1' });
    const setCookie = typeof a.res.headers.getSetCookie === 'function' ? a.res.headers.getSetCookie() : [];
    const hasDl = setCookie.some((c) => c.startsWith('pdfone_dl='));
    record('p0-1.session_secret_runtime_ok', a.res.status === 200 && hasDl, {
      note: hasDl ? 'download owner cookie minted' : 'missing pdfone_dl'
    });
  }

  // --- User A creates result ---
  const userA = { 'X-Forwarded-For': `198.51.100.${10 + Math.floor(Math.random() * 80)}` };
  const a = await postCompress(userA);
  record('idor.user_a_compress', a.res.status === 200 && a.json?.success === true, {
    note: `status=${a.res.status}`
  });
  const downloadUrl = a.json?.data?.downloadUrl;
  const filename = a.json?.data?.filename;
  const filepath = a.json?.data?.filepath;
  record('p1-1.json_no_filepath', filepath === undefined, {
    note: filepath ? 'filepath still returned' : 'filepath stripped'
  });
  record('temp.download_url_shape', typeof downloadUrl === 'string' && /^\/temp\/[a-z0-9._-]+$/i.test(downloadUrl), {
    note: downloadUrl || 'missing'
  });
  record('temp.filename_high_entropy', typeof filename === 'string' && /[a-f0-9]{32}/i.test(filename), {
    note: filename || 'missing'
  });

  // --- P1-3: stranger without owner cookie cannot download ---
  {
    const userB = { 'X-Forwarded-For': `198.51.100.${180 + Math.floor(Math.random() * 20)}` };
    const got = await fetch(`${API}${downloadUrl}`, { headers: userB });
    record('p1-3.temp_requires_owner_cookie', got.status === 404, {
      note: `stranger status=${got.status}`
    });
    const cache = got.headers.get('cache-control') || '';
    record('p1-3.temp_denied_not_public_cache', !/public/i.test(cache), {
      note: `Cache-Control=${cache || 'none'}`
    });
  }

  // --- Owner cookie can download; Cache-Control private/no-store ---
  {
    const got = await fetch(`${API}${downloadUrl}`, {
      headers: { ...userA, Cookie: a.cookies }
    });
    const bytes = Buffer.from(await got.arrayBuffer());
    const cache = got.headers.get('cache-control') || '';
    record('p1-3.owner_can_download', got.status === 200 && bytes.subarray(0, 4).toString() === '%PDF', {
      note: `status=${got.status}`
    });
    record('p1-3.cache_private_no_store', /private/i.test(cache) && /no-store/i.test(cache), {
      note: `Cache-Control=${cache}`
    });
    const again = await fetch(`${API}${downloadUrl}`, {
      headers: { ...userA, Cookie: a.cookies }
    });
    record('temp.unlink_after_download', again.status === 404, { note: `second=${again.status}` });
  }

  // --- Path traversal on /temp ---
  for (const name of ['../package.json', '..%2fpackage.json', '....//....//package.json']) {
    const res = await fetch(`${API}/temp/${name}`);
    record(`temp.traversal.${name.slice(0, 24)}`, res.status === 404 || res.status === 400, {
      note: `status=${res.status}`
    });
  }

  // --- Filename path traversal on upload ---
  {
    const form = new FormData();
    const pdf = fs.readFileSync(path.join(fixtures, 'text-2pages.pdf'));
    form.append('file', new Blob([pdf]), '../../evil.pdf');
    form.append('quality', 'high');
    const res = await fetch(`${API}/api/compress`, {
      method: 'POST',
      headers: { 'X-Forwarded-For': '203.0.113.10' },
      body: form
    });
    const json = await res.json();
    const stored = json?.data?.filename || '';
    const cookies = cookieJarFrom(res);
    record('upload.filename_sanitized', res.status === 200 && !stored.includes('..'), {
      note: `storedName=${stored || 'n/a'}`
    });
    if (json?.data?.downloadUrl) {
      await fetch(`${API}${json.data.downloadUrl}`, { headers: { Cookie: cookies } });
    }
  }

  // --- Malformed files / path leak ---
  {
    const cases = [
      { name: 'empty.pdf', bytes: Buffer.alloc(0) },
      { name: 'truncated.pdf', bytes: Buffer.from('%PDF-1.7\n') },
      { name: 'fake.pdf', bytes: Buffer.from('NOT A PDF') }
    ];
    for (const c of cases) {
      const form = new FormData();
      form.append('file', new Blob([c.bytes]), c.name);
      form.append('quality', 'high');
      const res = await fetch(`${API}/api/compress`, {
        method: 'POST',
        headers: { 'X-Forwarded-For': `203.0.113.${60 + Math.floor(Math.random() * 30)}` },
        body: form
      });
      const text = await res.text();
      const leaksPath = /\/Volumes\/|\/Users\/|\/var\/folders\/|node_modules|SESSION_SECRET|sk_live/i.test(text);
      record(`malformed.${c.name}`, res.status >= 400, { note: `status=${res.status}` });
      record(`malformed.${c.name}.no_path_leak`, !leaksPath);
    }
  }

  // --- Marker lifecycle (owner download cleans file) ---
  {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([400, 200]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    page.drawText(marker, { x: 20, y: 100, size: 12, font });
    const bytes = Buffer.from(await pdf.save());
    const form = new FormData();
    form.append('file', new Blob([bytes]), 'marker.pdf');
    form.append('quality', 'high');
    const res = await fetch(`${API}/api/compress`, {
      method: 'POST',
      headers: { 'X-Forwarded-For': '203.0.113.200' },
      body: form
    });
    const json = await res.json();
    const cookies = cookieJarFrom(res);
    record('lifecycle.result_ok', res.status === 200 && Boolean(json?.data?.downloadUrl), {
      note: json?.data?.filename || 'missing'
    });
    await fetch(`${API}${json.data.downloadUrl}`, { headers: { Cookie: cookies } });
    const tempRoot = path.join(root, 'temp');
    let markerHits = 0;
    if (fs.existsSync(tempRoot)) {
      for (const name of fs.readdirSync(tempRoot)) {
        if (name.startsWith('.')) continue;
        try {
          const buf = fs.readFileSync(path.join(tempRoot, name));
          if (buf.includes(Buffer.from(marker))) markerHits += 1;
        } catch { /* ignore */ }
      }
    }
    record('lifecycle.marker_not_in_temp', markerHits === 0, { note: `hits=${markerHits}` });
  }

  // --- Free size limit ~20MB ---
  {
    const large = path.join(fixtures, 'pdf-25mb.pdf');
    if (fs.existsSync(large)) {
      const form = new FormData();
      form.append('file', new Blob([fs.readFileSync(large)]), 'big.pdf');
      form.append('quality', 'high');
      const res = await fetch(`${API}/api/compress`, {
        method: 'POST',
        headers: { 'X-Forwarded-For': '203.0.113.210' },
        body: form
      });
      record('limits.free_rejects_25mb', res.status === 400, { note: `status=${res.status}` });
    }
  }

  // --- Unlock wrong password path leak ---
  {
    const form = new FormData();
    form.append('file', new Blob([fs.readFileSync(path.join(fixtures, 'protected.pdf'))]), 'protected.pdf');
    form.append('password', 'wrong-password-xyz');
    const res = await fetch(`${API}/api/unlock`, {
      method: 'POST',
      headers: { 'X-Forwarded-For': '203.0.113.211' },
      body: form
    });
    const text = await res.text();
    record('unlock.wrong_password', res.status >= 400, { note: `status=${res.status}` });
    record('unlock.wrong_password.no_path_leak', !/\/Volumes\/|\/var\/folders\//i.test(text));
  }

  // --- P1-6 restore requires auth ---
  {
    const res = await fetch(`${API}/api/billing/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '203.0.113.230' },
      body: JSON.stringify({ email: 'nobody-security-test@example.invalid' })
    });
    record('p1-6.restore_email_alone_rejected', res.status === 401, {
      note: `status=${res.status}`
    });
  }

  // --- P1-5 hardcoded superadmins absent from built admins module source ---
  {
    const adminsSrc = fs.readFileSync(path.join(root, 'server/src/services/admins.ts'), 'utf8');
    record('p1-5.no_builtin_superadmins', !/BUILTIN_SUPERADMINS|kamel|@gmail\.com|@one2pdf\.com/i.test(adminsSrc), {
      note: 'admins.ts is env-only'
    });
  }

  // --- Cookie flags ---
  {
    const res = await fetch(`${API}/api/compress`, {
      method: 'POST',
      headers: { 'X-Forwarded-For': '203.0.113.220' },
      body: (() => {
        const f = new FormData();
        f.append('file', new Blob([fs.readFileSync(path.join(fixtures, 'text-2pages.pdf'))]), 't.pdf');
        f.append('quality', 'high');
        return f;
      })()
    });
    const setCookie = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
    const quota = setCookie.find((c) => c.startsWith('pdfone_quota=')) || '';
    const dl = setCookie.find((c) => c.startsWith('pdfone_dl=')) || '';
    record('cookies.quota_httponly', /HttpOnly/i.test(quota), { note: quota ? 'quota cookie present' : 'no quota cookie' });
    record('cookies.dl_httponly', /HttpOnly/i.test(dl), { note: dl ? 'dl cookie present' : 'no dl cookie' });
    if (res.ok) {
      const j = await res.json();
      if (j?.data?.downloadUrl) {
        await fetch(`${API}${j.data.downloadUrl}`, { headers: { Cookie: mergeCookies(cookieJarFrom(res)) } });
      }
    }
  }

  const summary = {
    at: new Date().toISOString(),
    api: API,
    marker,
    passed: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results
  };
  fs.writeFileSync(path.join(outDir, 'probe-results.json'), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`\nSummary: ${summary.passed} passed, ${summary.failed} failed → security/probe-results.json`);
  if (summary.failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error('probe failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
