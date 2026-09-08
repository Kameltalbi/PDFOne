export type QueueStats = {
  name: string;
  active: number;
  waiting: number;
  concurrency: number;
  maxWaiting: number;
  waitTimeoutMs: number;
  runTimeoutMs: number;
};

export type RunOptions = {
  signal?: AbortSignal;
  waitTimeoutMs?: number;
  runTimeoutMs?: number;
};

function envInt(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function abortError() {
  const error = new Error('La requête a été annulée.');
  (error as Error & { code?: string }).code = 'REQUEST_ABORTED';
  return error;
}

function timeoutError(kind: 'wait' | 'run') {
  const error = new Error(
    kind === 'wait'
      ? 'Le serveur est trop chargé (délai d’attente dépassé). Réessayez plus tard.'
      : 'Le traitement a pris trop de temps et a été interrompu.'
  );
  (error as Error & { code?: string }).code = kind === 'wait' ? 'QUEUE_WAIT_TIMEOUT' : 'JOB_TIMEOUT';
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

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  signal?: AbortSignal
): Promise<T> {
  if (signal?.aborted) throw abortError();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let onAbort: (() => void) | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(() => reject(timeoutError('run')), ms);
        onAbort = () => reject(abortError());
        signal?.addEventListener('abort', onAbort, { once: true });
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
    if (onAbort) signal?.removeEventListener('abort', onAbort);
  }
}

export class BoundedQueue {
  private active = 0;
  private waiting = 0;

  constructor(
    readonly name: string,
    readonly concurrency: number,
    readonly maxWaiting: number,
    readonly waitTimeoutMs: number,
    readonly runTimeoutMs: number
  ) {}

  stats(): QueueStats {
    return {
      name: this.name,
      active: this.active,
      waiting: this.waiting,
      concurrency: this.concurrency,
      maxWaiting: this.maxWaiting,
      waitTimeoutMs: this.waitTimeoutMs,
      runTimeoutMs: this.runTimeoutMs
    };
  }

  async run<T>(fn: () => Promise<T>, options: RunOptions = {}): Promise<T> {
    const signal = options.signal;
    if (signal?.aborted) throw abortError();

    if (this.active + this.waiting >= this.concurrency + this.maxWaiting) {
      const error = new Error(
        'Le serveur est momentanément saturé. Réessayez dans quelques instants.'
      );
      (error as Error & { code?: string }).code = 'SERVER_BUSY';
      throw error;
    }

    const waitLimit = options.waitTimeoutMs ?? this.waitTimeoutMs;
    const runLimit = options.runTimeoutMs ?? this.runTimeoutMs;
    const waitStarted = Date.now();

    this.waiting += 1;
    try {
      while (this.active >= this.concurrency) {
        if (signal?.aborted) throw abortError();
        if (Date.now() - waitStarted > waitLimit) throw timeoutError('wait');
        await sleep(40, signal);
      }
    } catch (error) {
      this.waiting -= 1;
      throw error;
    }
    this.waiting -= 1;

    if (signal?.aborted) throw abortError();

    this.active += 1;
    try {
      return await withTimeout(Promise.resolve().then(fn), runLimit, signal);
    } finally {
      this.active -= 1;
    }
  }
}

export const pdfQueue = new BoundedQueue(
  'pdf',
  envInt('PDF_CONCURRENCY', 2),
  envInt('PDF_MAX_WAITING', 20),
  envInt('QUEUE_WAIT_TIMEOUT_MS', 120_000),
  envInt('PDF_RUN_TIMEOUT_MS', 300_000)
);

export const officeQueue = new BoundedQueue(
  'office',
  envInt('OFFICE_CONCURRENCY', 1),
  envInt('OFFICE_MAX_WAITING', 10),
  envInt('QUEUE_WAIT_TIMEOUT_MS', 120_000),
  envInt('OFFICE_RUN_TIMEOUT_MS', 600_000)
);

export const ocrQueue = new BoundedQueue(
  'ocr',
  envInt('OCR_CONCURRENCY', 1),
  envInt('OCR_MAX_WAITING', 10),
  envInt('QUEUE_WAIT_TIMEOUT_MS', 120_000),
  envInt('OCR_RUN_TIMEOUT_MS', 600_000)
);

export function allQueueStats(): QueueStats[] {
  return [pdfQueue.stats(), officeQueue.stats(), ocrQueue.stats()];
}

/** AbortSignal tied to the HTTP request lifecycle (client disconnect). */
export function requestSignal(req: { on: (event: string, cb: () => void) => void; aborted?: boolean }): AbortSignal {
  const controller = new AbortController();
  const abort = () => {
    if (!controller.signal.aborted) controller.abort();
  };
  if (req.aborted) abort();
  req.on('aborted', abort);
  req.on('close', () => {
    if (req.aborted) abort();
  });
  return controller.signal;
}
