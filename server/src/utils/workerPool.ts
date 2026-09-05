import fs from 'node:fs';
import { Worker } from 'node:worker_threads';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pdfQueue } from './jobQueue.js';
import type { HeavyJobPayload } from './heavyJobs.js';

export type HeavyJob = HeavyJobPayload;

type WorkerResponse =
  | { ok: true; id: number; result: unknown }
  | { ok: false; id: number; error: string; code?: string };

type Pending = {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
};

function envInt(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function resolveWorkerEntry(): { script: string; execArgv?: string[] } | null {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const js = path.join(here, 'heavyJobs.js');
  const ts = path.join(here, 'heavyJobs.ts');
  if (fs.existsSync(js)) return { script: js };
  if (fs.existsSync(ts)) return { script: ts, execArgv: ['--import', 'tsx'] };
  return null;
}

class HeavyWorkerPool {
  private workers: Worker[] = [];
  private idle: Worker[] = [];
  private pending = new Map<number, Pending>();
  private queue: Array<{ job: HeavyJob; id: number }> = [];
  private nextId = 1;
  private started = false;
  private readonly size: number;
  private readonly entry: { script: string; execArgv?: string[] };

  constructor(size: number, entry: { script: string; execArgv?: string[] }) {
    this.size = Math.max(1, size);
    this.entry = entry;
  }

  private spawn() {
    const worker = new Worker(this.entry.script, {
      execArgv: this.entry.execArgv
    });
    worker.on('message', (message: WorkerResponse) => {
      const entry = this.pending.get(message.id);
      if (!entry) return;
      this.pending.delete(message.id);
      this.idle.push(worker);
      if (message.ok) entry.resolve(message.result);
      else {
        const error = new Error(message.error);
        if (message.code) (error as Error & { code?: string }).code = message.code;
        entry.reject(error);
      }
      this.drain();
    });
    worker.on('error', (error) => {
      console.error('Heavy worker error:', error);
    });
    worker.on('exit', (code) => {
      this.workers = this.workers.filter((item) => item !== worker);
      this.idle = this.idle.filter((item) => item !== worker);
      if (code !== 0) console.error(`Heavy worker stopped with code ${code}`);
      if (this.started && this.workers.length < this.size) {
        const replacement = this.spawn();
        this.workers.push(replacement);
        this.idle.push(replacement);
        this.drain();
      }
    });
    return worker;
  }

  private ensureStarted() {
    if (this.started) return;
    this.started = true;
    for (let i = 0; i < this.size; i++) {
      const worker = this.spawn();
      this.workers.push(worker);
      this.idle.push(worker);
    }
  }

  private drain() {
    while (this.idle.length && this.queue.length) {
      const worker = this.idle.pop()!;
      const next = this.queue.shift()!;
      worker.postMessage({ id: next.id, job: next.job });
    }
  }

  run<T>(job: HeavyJob): Promise<T> {
    this.ensureStarted();
    const id = this.nextId++;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, {
        resolve: (value) => resolve(value as T),
        reject
      });
      this.queue.push({ id, job });
      this.drain();
    });
  }
}

const workerEntry = resolveWorkerEntry();
const pool = workerEntry ? new HeavyWorkerPool(envInt('HEAVY_WORKERS', 1), workerEntry) : null;

/** Run a heavy PDF job off the API event loop when workers are available. */
export async function runHeavyJob<T>(job: HeavyJob): Promise<T> {
  return pdfQueue.run(async () => {
    if (pool) return pool.run<T>(job);
    const { executeHeavyJob } = await import('./heavyJobs.js');
    return executeHeavyJob(job) as Promise<T>;
  });
}
