import os from 'node:os';
import { assertTempSpace } from './runtimeHealth.js';

function envInt(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function envBytes(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function abortError() {
  const error = new Error('La requête a été annulée.');
  (error as Error & { code?: string }).code = 'REQUEST_ABORTED';
  return error;
}

function busyError(message: string, code: string) {
  const error = new Error(message);
  (error as Error & { code?: string }).code = code;
  return error;
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError());
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Shared admission across pdf / office / ocr queues so concurrent native work
 * cannot stack up to sum(per-queue concurrency) under memory or disk pressure.
 */
export class SharedResourceBudget {
  private active = 0;

  constructor(
    readonly concurrency: number,
    readonly minFreeMemoryBytes: number
  ) {}

  stats() {
    return {
      name: 'global',
      active: this.active,
      concurrency: this.concurrency,
      minFreeMemoryBytes: this.minFreeMemoryBytes
    };
  }

  private assertMemory() {
    if (this.minFreeMemoryBytes <= 0) return;
    const free = os.freemem();
    if (free < this.minFreeMemoryBytes) {
      throw busyError(
        'Mémoire serveur insuffisante. Réessayez dans quelques instants.',
        'SERVER_BUSY'
      );
    }
  }

  /**
   * Wait until a global slot is free and host resources look healthy, then hold it.
   * Caller must always `release()` in a finally block.
   */
  async acquire(signal?: AbortSignal, waitTimeoutMs = 120_000): Promise<void> {
    if (signal?.aborted) throw abortError();
    const started = Date.now();

    while (true) {
      if (signal?.aborted) throw abortError();
      if (Date.now() - started > waitTimeoutMs) {
        throw busyError(
          'Le serveur est trop chargé (délai d’attente dépassé). Réessayez plus tard.',
          'QUEUE_WAIT_TIMEOUT'
        );
      }

      try {
        this.assertMemory();
        await assertTempSpace();
      } catch (error) {
        const code = error instanceof Error ? (error as Error & { code?: string }).code : undefined;
        // Disk full / memory pressure: wait a bit then retry until wait timeout.
        if (code === 'TEMP_DISK_FULL' || code === 'SERVER_BUSY') {
          await sleep(200, signal);
          continue;
        }
        throw error;
      }

      if (this.active < this.concurrency) {
        this.active += 1;
        return;
      }
      await sleep(40, signal);
    }
  }

  release(): void {
    this.active = Math.max(0, this.active - 1);
  }
}

/** Default global slots ≈ max concurrent heavy work on a small VPS (pdf 2 + office/ocr). */
export const sharedJobBudget = new SharedResourceBudget(
  envInt('GLOBAL_JOB_CONCURRENCY', 3),
  envBytes('MIN_FREE_MEMORY_BYTES', 256 * 1024 * 1024)
);
