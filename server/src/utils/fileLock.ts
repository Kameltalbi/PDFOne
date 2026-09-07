import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../data');

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Cross-process exclusive lock via lockfile (`wx`).
 * Complements the in-process promise queue in entitlements/users.
 */
export async function withFileLock<T>(
  name: string,
  fn: () => Promise<T>,
  options: { timeoutMs?: number; staleMs?: number } = {}
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 15_000;
  const staleMs = options.staleMs ?? 30_000;
  await fs.mkdir(dataDir, { recursive: true });
  const lockPath = path.join(dataDir, `${name}.lock`);
  const started = Date.now();

  while (true) {
    try {
      const handle = await fs.open(lockPath, 'wx');
      try {
        await handle.writeFile(String(process.pid), 'utf8');
        return await fn();
      } finally {
        await handle.close().catch(() => undefined);
        await fs.unlink(lockPath).catch(() => undefined);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      if (Date.now() - started > timeoutMs) {
        const err = new Error('Impossible d’obtenir le verrou de données. Réessayez.');
        (err as Error & { code?: string }).code = 'DATA_LOCK_TIMEOUT';
        throw err;
      }
      try {
        const stat = await fs.stat(lockPath);
        if (Date.now() - stat.mtimeMs > staleMs) {
          await fs.unlink(lockPath).catch(() => undefined);
          continue;
        }
      } catch {
        // raced unlink
      }
      await sleep(25);
    }
  }
}
