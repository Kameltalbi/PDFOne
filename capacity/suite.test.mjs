import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { cases, mixed, percentile, safety } from './cases.mjs';
const exec = promisify(execFile);
const limits = { minDiskFreeBytes: 5e9, maxSwapGrowthBytes: 64e6, maxTempGrowthBytes: 1e9, maxTempGrowthFiles: 1000, maxLoProcesses: 2, maxOcrProcesses: 1, maxChildAgeSeconds: 240 };
const sample = () => ({ timestamp: Date.now(), ok: true, online: true, cpuPct: 10, ramPct: 30, swapBytes: 0, swapOutBytes: 0, diskFreeBytes: 20e9, diskFreePct: 50, tempBytes: 0, tempFiles: 0, oomKills: 0, restarts: 0, loCount: 0, ocrCount: 0, zombies: 0, nodeRssBytes: 100e6, oldestChildSeconds: 0 });
test('resource guards fail closed on every required hazard', () => {
  const base = sample();
  assert.equal(safety(base, base, limits), null);
  for (const delta of [{ ramPct: 91 }, { diskFreeBytes: 1 }, { diskFreePct: 14 }, { swapBytes: 65e6 }, { swapOutBytes: 65e6 }, { tempBytes: 2e9 }, { tempFiles: 1001 }, { oomKills: 1 }, { restarts: 1 }, { loCount: 3 }, { ocrCount: 2 }, { zombies: 1 }, { oldestChildSeconds: 241 }, { online: false }, { ok: false }, { cpuPct: null }, { timestamp: Date.now() - 16000 }]) assert.ok(safety({ ...base, ...delta }, base, limits));
});
test('case allowlist and payloads exclude external/billing traffic', () => {
  const registry = cases(20);
  for (const spec of Object.values(registry)) assert.doesNotMatch(spec.path, /billing|auth|admin|translate|summarize|https?:/);
  assert.equal(mixed.reduce((sum, [, weight]) => sum + weight, 0), 100);
  assert.equal(JSON.parse(registry.rotate.fields.rotations).length, 20);
  assert.equal(JSON.parse(registry.reorder.fields.order)[0], 20);
  assert.equal(percentile([1, 2, 3, 100], .95), 100);
});
test('runner approval, stale monitor, success/download and repeated failure with mocked fetch only', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'one2pdf-suite-test-'));
  try {
    const config = JSON.parse(await fs.readFile(new URL('./stage.example.json', import.meta.url), 'utf8'));
    Object.assign(config, { baseUrl: 'http://127.0.0.1:1', seconds: 1, thinkSeconds: .1, timeoutSeconds: 2,
      monitorFile: path.join(dir, 'monitor.jsonl'), resultDir: path.join(dir, 'success'), cookieFile: path.join(dir, 'test.cookie') });
    await fs.writeFile(config.cookieFile, 'synthetic_cookie=not-a-real-credential', { mode: 0o600 });
    const cfg = path.join(dir, 'config.json');
    const save = async () => fs.writeFile(cfg, JSON.stringify(config));
    await save();
    await assert.rejects(exec(process.execPath, ['capacity/run-stage.mjs', cfg]), /Load disabled/);
    config.approval = true; await save();
    await fs.writeFile(config.monitorFile, JSON.stringify({ ...sample(), timestamp: Date.now() - 20000 }) + '\n');
    await assert.rejects(exec(process.execPath, ['capacity/run-stage.mjs', cfg]), /stale monitoring/);
    const mock = path.join(dir, 'mock.mjs');
    await fs.writeFile(mock, `globalThis.fetch = async (url) => {
      const p = new URL(url).pathname;
      if (p === '/health') return Response.json({status:'ok'});
      if (p === '/api/compress') return Response.json({success:true,data:{downloadUrl:'/temp/synthetic.pdf'}});
      if (p === '/temp/synthetic.pdf') return new Response('%PDF-1.7 synthetic mock only');
      throw new Error('Unexpected request');
    };`);
    config.case = 'compress'; config.p95Ms = 10000; await save();
    await fs.writeFile(config.monitorFile, JSON.stringify(sample()) + '\n');
    await exec(process.execPath, ['--import', mock, 'capacity/run-stage.mjs', cfg]);
    const summary = JSON.parse(await fs.readFile(path.join(config.resultDir, 'summary.json'), 'utf8'));
    assert.equal(summary.stopped, null);
    assert.ok(summary.overall.success > 0);
    assert.equal(summary.httpRequests, summary.overall.success * 2);
    assert.doesNotMatch(JSON.stringify(summary), /synthetic_cookie/);
    await fs.writeFile(mock, `globalThis.fetch = async () => new Response('', {status:503});`);
    config.resultDir = path.join(dir, 'failure'); await save();
    await fs.writeFile(config.monitorFile, JSON.stringify(sample()) + '\n');
    await assert.rejects(exec(process.execPath, ['--import', mock, 'capacity/run-stage.mjs', cfg]));
    const failure = JSON.parse(await fs.readFile(path.join(config.resultDir, 'summary.json'), 'utf8'));
    assert.equal(failure.stopped, 'three consecutive 5xx');
    assert.equal(failure.overall.attempts, 3);
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});
