import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withFileLock } from './fileLock.js';

export const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../data');

/**
 * In-process queue + cross-process lockfile for a named JSON store.
 */
export function createJsonStoreLock(name: string) {
  let queue = Promise.resolve();
  return function withStoreLock<T>(fn: () => Promise<T>): Promise<T> {
    const run = queue.then(
      () => withFileLock(name, fn),
      () => withFileLock(name, fn)
    );
    queue = run.then(() => undefined, () => undefined);
    return run;
  };
}

/**
 * Read JSON object/array. Missing file → `empty`. Corrupt JSON → throw with `corruptCode`.
 */
export async function readJsonFile<T>(
  filePath: string,
  options: { empty: T; corruptCode: string }
): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new Error(options.corruptCode);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return options.empty;
    if (error instanceof Error && error.message === options.corruptCode) throw error;
    throw error;
  }
}

/** Atomic write: temp file + fsync + rename over the destination. */
export async function writeJsonAtomic(filePath: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const payload = JSON.stringify(data, null, 2);
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  const handle = await fs.open(tmp, 'w');
  try {
    await handle.writeFile(payload, 'utf8');
    await handle.sync();
  } finally {
    await handle.close().catch(() => undefined);
  }
  await fs.rename(tmp, filePath);
}
