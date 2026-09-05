import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const tempDir = path.join(__dirname, '../../../temp');

/** Paths currently retained (upload in flight or result awaiting download). */
const retained = new Map<string, number>();

export function retainTemp(filePath?: string | null): void {
  if (!filePath) return;
  const full = path.resolve(filePath);
  retained.set(full, (retained.get(full) || 0) + 1);
}

export function releaseTemp(filePath?: string | null): void {
  if (!filePath) return;
  const full = path.resolve(filePath);
  const count = retained.get(full) || 0;
  if (count <= 1) retained.delete(full);
  else retained.set(full, count - 1);
}

export function isTempRetained(filePath: string): boolean {
  return retained.has(path.resolve(filePath));
}

export function uniqueName(prefix: string, ext: string): string {
  const id = crypto.randomBytes(16).toString('hex');
  return `${prefix}-${id}.${ext.replace(/^\./, '')}`;
}

export async function writeTemp(
  buffer: Buffer | Uint8Array,
  prefix: string,
  ext: string
): Promise<{ filename: string; filepath: string; downloadUrl: string }> {
  await fs.mkdir(tempDir, { recursive: true });
  const filename = uniqueName(prefix, ext);
  const filepath = path.join(tempDir, filename);
  await fs.writeFile(filepath, buffer);
  retainTemp(filepath);
  return { filename, filepath, downloadUrl: `/temp/${filename}` };
}

export async function unlinkQuiet(filePath?: string | null): Promise<void> {
  if (!filePath) return;
  releaseTemp(filePath);
  await fs.unlink(filePath).catch(() => undefined);
}

export async function cleanupUploads(
  files?: Express.Multer.File | Express.Multer.File[] | Array<{ path: string }>
): Promise<void> {
  if (!files) return;
  const list = Array.isArray(files) ? files : [files];
  await Promise.all(list.map((file) => unlinkQuiet(file.path)));
}

export function tempTtlMs(): number {
  return Math.max(60_000, Number(process.env.TEMP_FILE_TTL || 15 * 60 * 1000));
}

const NATIVE_PREFIXES = ['pdfone-ocr-', 'pdfone-ocr-layout-', 'pdfone-lo-out-', 'pdfone-lo-profile-', 'pdfone-unlock-'];

export async function purgeAbandonedNativeTemp(maxAgeMs = 60 * 60 * 1000): Promise<number> {
  const root = os.tmpdir();
  const cutoff = Date.now() - maxAgeMs;
  let removed = 0;
  let entries: string[] = [];
  try {
    entries = await fs.readdir(root);
  } catch {
    return 0;
  }

  await Promise.all(entries.map(async (name) => {
    if (!NATIVE_PREFIXES.some((prefix) => name.startsWith(prefix))) return;
    const full = path.join(root, name);
    try {
      const stat = await fs.stat(full);
      if (!stat.isDirectory() || stat.mtimeMs > cutoff) return;
      await fs.rm(full, { recursive: true, force: true });
      removed += 1;
    } catch {
      /* ignore */
    }
  }));
  return removed;
}

export async function purgeExpiredTemp(ttlMs = tempTtlMs()): Promise<number> {
  const cutoff = Date.now() - ttlMs;
  let removed = 0;
  try {
    const entries = await fs.readdir(tempDir, { withFileTypes: true });
    await Promise.all(entries.map(async (entry) => {
      if (!entry.isFile() || entry.name.startsWith('.')) return;
      const full = path.join(tempDir, entry.name);
      if (isTempRetained(full)) return;
      try {
        const stat = await fs.stat(full);
        if (stat.mtimeMs <= cutoff) {
          await fs.unlink(full);
          removed += 1;
        }
      } catch {
        // ignore races
      }
    }));
  } catch {
    /* keep removed count */
  }
  return removed + await purgeAbandonedNativeTemp(Math.max(ttlMs, 60 * 60 * 1000));
}

export function startTempCleanup(intervalMs = 5 * 60 * 1000) {
  void purgeExpiredTemp();
  return setInterval(() => {
    void purgeExpiredTemp();
  }, intervalMs);
}
