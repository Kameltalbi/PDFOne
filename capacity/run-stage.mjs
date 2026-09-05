import fs from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { createHash } from 'node:crypto';
import { cases, mixed, percentile, safety } from './cases.mjs';

const configPath = process.argv[2];
if (!configPath) throw new Error('Usage: node capacity/run-stage.mjs CONFIG [--dry-run]');
const c = JSON.parse(await fs.readFile(configPath, 'utf8'));
const origin = new URL(c.baseUrl);
if (!['https:', 'http:'].includes(origin.protocol) || origin.username || origin.password || origin.search || origin.hash || origin.pathname !== '/') throw new Error('baseUrl must be an origin without credentials or path');
for (const key of ['vus', 'seconds', 'thinkSeconds', 'timeoutSeconds', 'p95Ms']) if (!Number.isFinite(c[key]) || c[key] < (key === 'thinkSeconds' ? 0 : 1)) throw new Error(`Invalid ${key}`);
if (!Number.isInteger(c.vus) || c.vus > 1000 || c.seconds > 3600 || c.timeoutSeconds > 300) throw new Error('Stage exceeds suite bounds');
if (!c.limits || Object.values(c.limits).some(x => !Number.isFinite(x) || x < 0)) throw new Error('Invalid safety limits');
for (const key of ['minDiskFreeBytes', 'maxSwapGrowthBytes', 'maxTempGrowthBytes', 'maxTempGrowthFiles', 'maxLoProcesses', 'maxOcrProcesses', 'maxChildAgeSeconds']) if (!Number.isFinite(c.limits[key])) throw new Error('Missing safety limit');
const root = new URL('./fixtures/', import.meta.url);
const manifest = JSON.parse(await fs.readFile(new URL('manifest.json', root), 'utf8'));
const entry = manifest.files.find(f => f.name === c.fixture);
if (!entry?.pages) throw new Error('Select a PDF from the generated fixture manifest');
const registry = cases(entry.pages);
const names = c.case === 'mixed' ? mixed.map(([name]) => name) : [c.case];
if (names.some(name => !registry[name])) throw new Error('Case outside local-processing allowlist');
const prepared = new Map();
const mime = { pdf: 'application/pdf', jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', csv: 'text/csv', html: 'text/html', odp: 'application/vnd.oasis.opendocument.presentation' };
for (const name of names) {
  const spec = registry[name];
  if (spec.get) continue;
  const file = c.fixtureOverrides?.[name] || spec.fixture || c.fixture;
  const meta = manifest.files.find(f => f.name === file);
  if (!meta || file !== path.basename(file)) throw new Error('Only generated fixtures are allowed');
  const bytes = await fs.readFile(new URL(file, root));
  if (createHash('sha256').update(bytes).digest('hex') !== meta.sha256) throw new Error('Fixture hash mismatch');
  prepared.set(name, { blob: new Blob([bytes], { type: mime[file.split('.').pop()] }), file, bytes: bytes.length, pages: meta.pages ?? null });
}
const plan = { case: c.case, vus: c.vus, seconds: c.seconds, thinkSeconds: c.thinkSeconds, fixtures: [...prepared].map(([tool, f]) => ({ tool, file: f.file, bytes: f.bytes, pages: f.pages })), paths: names.map(name => registry[name].path) };
if (process.argv.includes('--dry-run')) { console.log(JSON.stringify(plan, null, 2)); process.exit(0); }
if (c.approval !== true) throw new Error('Load disabled. Explicit user approval is required before setting approval=true.');
if (origin.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname)) throw new Error('Remote targets require HTTPS');
if (names.some(name => !registry[name].get && !registry[name].inspect) && !c.cookieFile) throw new Error('Processing requires an authorized synthetic test entitlement cookie; never bypass production quotas');
let cookie = '';
if (c.cookieFile) {
  const stat = await fs.stat(c.cookieFile);
  if ((stat.mode & 0o077) !== 0) throw new Error('Cookie file must have mode 0600');
  cookie = (await fs.readFile(c.cookieFile, 'utf8')).trim();
  if (!cookie || /[\r\n]/.test(cookie)) throw new Error('Invalid cookie file');
}
async function sample() {
  const fh = await fs.open(c.monitorFile, 'r');
  try {
    const { size } = await fh.stat();
    const length = Math.min(size, 65536);
    const b = Buffer.alloc(length);
    await fh.read(b, 0, length, size - length);
    // Ignore an incomplete final write; freshness checks still apply.
    const lines = b.toString().split('\n');
    lines.pop();
    return JSON.parse(lines.filter(Boolean).at(-1));
  } finally { await fh.close(); }
}
const baseline = await sample();
const initialReason = safety(baseline, baseline, c.limits);
if (initialReason || baseline.cpuPct > 75 || baseline.ramPct > 80) throw new Error(`Unsafe baseline: ${initialReason || 'insufficient CPU/RAM headroom'}`);
await fs.mkdir(c.resultDir, { recursive: true });
const results = await fs.open(path.join(c.resultDir, 'observations.jsonl'), 'wx', 0o600);
const monitoring = await fs.open(path.join(c.resultDir, 'monitor.jsonl'), 'wx', 0o600);
await fs.writeFile(path.join(c.resultDir, 'plan.json'), JSON.stringify(plan, null, 2), { flag: 'wx', mode: 0o600 });
let stopped = null, cpuSince = null, recent = [], consecutive5xx = 0, consecutiveFailures = 0;
const active = new Set(), all = [], byTool = new Map();
let httpRequests = 0, httpErrors = 0;
const start = performance.now(), deadline = start + c.seconds * 1000;
let lastTick = performance.now(), generatorLagMaxMs = 0, monitoringBusy = false;
function stop(reason) {
  if (stopped) return;
  stopped = reason;
  console.error(`STOP: ${reason}. Server-side work may continue; keep monitoring.`);
  for (const controller of active) controller.abort();
}
process.on('SIGINT', () => stop('operator interrupt'));
process.on('SIGTERM', () => stop('operator termination'));
const timer = setInterval(async () => {
  const now = performance.now();
  generatorLagMaxMs = Math.max(generatorLagMaxMs, now - lastTick - 1000); lastTick = now;
  if (monitoringBusy) return stop('monitor read stalled');
  monitoringBusy = true;
  try {
    const s = await sample();
    await monitoring.write(JSON.stringify(s) + '\n');
    const reason = safety(s, baseline, c.limits);
    if (reason) return stop(reason);
    if (s.cpuPct > 90) cpuSince ??= Date.now(); else cpuSince = null;
    if (cpuSince && Date.now() - cpuSince >= 30000) return stop('CPU >90% for 30s');
    recent = recent.filter(row => Date.now() - row.timestamp <= 30000);
    if (recent.length >= 20 && recent.filter(row => !row.ok).length / recent.length > .05) return stop('rolling error rate >5%');
    for (const name of names) {
      const latencies = recent.filter(row => row.tool === name).map(row => row.jobMs);
      const limit = c.p95ByTool?.[name] ?? c.p95Ms;
      if (latencies.length >= 20 && percentile(latencies, .95) > limit) return stop(`p95 exceeded for ${name}`);
    }
  } catch { stop('monitor missing/unreadable'); }
  finally { monitoringBusy = false; }
}, 1000);
function select(vu, iteration) {
  if (c.case !== 'mixed') return c.case;
  // Deterministic weighted schedule; shares describe operations, not occupied worker time.
  let position = (vu * 37 + iteration * 61) % 100;
  for (const [name, weight] of mixed) { if (position < weight) return name; position -= weight; }
}
async function request(pathname, init, controller) {
  if (!pathname.startsWith('/') || pathname.startsWith('//')) throw new Error('Invalid path');
  httpRequests++;
  try {
    const response = await fetch(new URL(pathname, origin), { ...init, redirect: 'error', signal: controller.signal });
    if (!response.ok) httpErrors++;
    return response;
  } catch (error) { httpErrors++; throw error; }
}
async function consume(response) {
  let size = 0;
  const prefix = [];
  if (response.body) for await (const chunk of response.body) {
    if (prefix.length < 8) prefix.push(...chunk.subarray(0, 8 - prefix.length));
    size += chunk.length;
  }
  return { size, prefix: Buffer.from(prefix) };
}
function binaryValid(result) {
  const p = result.prefix;
  return result.size > 8 && (p.subarray(0, 4).toString() === '%PDF' || p.subarray(0, 2).toString() === 'PK' || p[0] === 0x89 && p[1] === 0x50 || p[0] === 0xff && p[1] === 0xd8);
}
async function job(name) {
  const spec = registry[name], controller = new AbortController();
  active.add(controller);
  const abortTimer = setTimeout(() => controller.abort(), c.timeoutSeconds * 1000);
  const began = performance.now();
  let ok = false, status = 0, apiMs = null, downloadMs = null, bytes = 0;
  try {
    let body;
    if (!spec.get) {
      const fixture = prepared.get(name);
      body = new FormData();
      body.append(spec.multiple ? 'files' : 'file', fixture.blob, fixture.file);
      if (spec.multiple) body.append('files', fixture.blob, fixture.file);
      for (const [key, value] of Object.entries(spec.fields)) body.append(key, value);
    }
    const response = await request(spec.path, { method: spec.get ? 'GET' : 'POST', body, headers: { 'Accept-Language': 'en', ...(cookie ? { Cookie: cookie } : {}) } }, controller);
    status = response.status;
    if (!response.ok) { await consume(response); if ([401, 402, 403, 429].includes(status)) stop('access/quota/rate-limit response'); throw new Error('HTTP failure'); }
    if (spec.direct) { const result = await consume(response); bytes = result.size; ok = result.prefix.subarray(0, 4).toString() === '%PDF'; }
    else if (spec.get && !spec.health) { const result = await consume(response); bytes = result.size; ok = bytes > 0 && /text\/html/.test(response.headers.get('content-type') || ''); }
    else {
      const payload = await response.json();
      apiMs = performance.now() - began;
      if (spec.health) ok = payload.status === 'ok';
      else if (spec.inspect) ok = payload.success === true && Array.isArray(payload.data?.fields);
      else {
        if (payload.success !== true || !/^\/temp\/[A-Za-z0-9_.-]+$/.test(payload.data?.downloadUrl || '')) throw new Error('Invalid result envelope');
        const dlStart = performance.now();
        const output = await request(payload.data.downloadUrl, {}, controller);
        const result = await consume(output); bytes = result.size;
        downloadMs = performance.now() - dlStart;
        // TXT has no binary magic. Other tools must produce a recognized document/image archive.
        ok = output.ok && (name === 'to-text' || name === 'ocr' && /\.txt$/.test(payload.data.downloadUrl) ? bytes > 0 : binaryValid(result));
      }
    }
  } catch { /* No response bodies, URLs, cookie values or service errors in reports. */ }
  finally { clearTimeout(abortTimer); active.delete(controller); }
  const row = { timestamp: Date.now(), tool: name, ok, status, jobMs: performance.now() - began, apiMs, downloadMs, downloadedBytes: bytes };
  all.push(row); recent.push(row);
  if (!byTool.has(name)) byTool.set(name, []);
  byTool.get(name).push(row);
  consecutive5xx = status >= 500 ? consecutive5xx + 1 : 0;
  consecutiveFailures = ok ? 0 : consecutiveFailures + 1;
  if (consecutive5xx >= 3) stop('three consecutive 5xx');
  if (consecutiveFailures >= 3) stop('three consecutive failed jobs');
  await results.write(JSON.stringify(row) + '\n');
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
await Promise.all(Array.from({ length: c.vus }, async (_, vu) => {
  let iteration = 0;
  while (!stopped && performance.now() < deadline) {
    await job(select(vu, iteration++));
    if (!stopped) await sleep(c.thinkSeconds * 1000);
  }
}));
clearInterval(timer);
while (monitoringBusy) await sleep(10);
await results.close(); await monitoring.close();
const elapsedSeconds = (performance.now() - start) / 1000;
const summarize = rows => {
  const times = rows.map(r => r.jobMs), successful = rows.filter(r => r.ok);
  return { attempts: rows.length, success: successful.length, errors: rows.length - successful.length,
    errorRate: rows.length ? 1 - successful.length / rows.length : null,
    completedPerMinute: successful.length / elapsedSeconds * 60,
    meanMs: times.length ? times.reduce((a, b) => a + b, 0) / times.length : null,
    p50Ms: percentile(times, .50), p95Ms: percentile(times, .95), p99Ms: percentile(times, .99),
    successP95Ms: percentile(successful.map(r => r.jobMs), .95),
    apiP95Ms: percentile(rows.filter(r => r.apiMs !== null).map(r => r.apiMs), .95),
    downloadP95Ms: percentile(rows.filter(r => r.downloadMs !== null).map(r => r.downloadMs), .95),
    enoughForStageDecision: rows.length >= 20, enoughForTailEstimate: rows.length >= 1000 };
};
const summary = { stopped, elapsedSeconds, generatorLagMaxMs, generatorRssBytes: process.memoryUsage().rss,
  httpRequests, httpRequestsPerMinute: httpRequests / elapsedSeconds * 60, httpErrorRate: httpRequests ? httpErrors / httpRequests : null,
  successfulPdfJobsPerMinute: all.filter(row => row.ok && !registry[row.tool].get && !registry[row.tool].inspect).length / elapsedSeconds * 60,
  overall: summarize(all), tools: Object.fromEntries([...byTool].map(([name, rows]) => [name, summarize(rows)])),
  note: 'Client wall time includes upload, processing and output download. It is not server CPU time or queue wait. No next stage starts automatically.' };
await fs.writeFile(path.join(c.resultDir, 'summary.json'), JSON.stringify(summary, null, 2), { flag: 'wx', mode: 0o600 });
console.log(JSON.stringify(summary, null, 2));
if (stopped) process.exitCode = 2;
