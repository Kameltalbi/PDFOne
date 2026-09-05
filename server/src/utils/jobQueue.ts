export type QueueStats = {
  name: string;
  active: number;
  waiting: number;
  concurrency: number;
  maxWaiting: number;
};

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export class BoundedQueue {
  private active = 0;
  private waiting = 0;

  constructor(
    readonly name: string,
    readonly concurrency: number,
    readonly maxWaiting: number
  ) {}

  stats(): QueueStats {
    return {
      name: this.name,
      active: this.active,
      waiting: this.waiting,
      concurrency: this.concurrency,
      maxWaiting: this.maxWaiting
    };
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active + this.waiting >= this.concurrency + this.maxWaiting) {
      const error = new Error(
        'Le serveur est momentanément saturé. Réessayez dans quelques instants.'
      );
      (error as Error & { code?: string }).code = 'SERVER_BUSY';
      throw error;
    }

    this.waiting += 1;
    try {
      while (this.active >= this.concurrency) {
        await sleep(40);
      }
    } catch (error) {
      this.waiting -= 1;
      throw error;
    }
    this.waiting -= 1;
    this.active += 1;
    try {
      return await fn();
    } finally {
      this.active -= 1;
    }
  }
}

function envInt(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export const pdfQueue = new BoundedQueue(
  'pdf',
  envInt('PDF_CONCURRENCY', 2),
  envInt('PDF_MAX_WAITING', 20)
);

export const officeQueue = new BoundedQueue(
  'office',
  envInt('OFFICE_CONCURRENCY', 1),
  envInt('OFFICE_MAX_WAITING', 10)
);

export const ocrQueue = new BoundedQueue(
  'ocr',
  envInt('OCR_CONCURRENCY', 1),
  envInt('OCR_MAX_WAITING', 10)
);

export function allQueueStats(): QueueStats[] {
  return [pdfQueue.stats(), officeQueue.stats(), ocrQueue.stats()];
}
