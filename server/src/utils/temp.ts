import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const tempDir = path.join(__dirname, '../../../temp');

export function uniqueName(prefix: string, ext: string): string {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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
  return { filename, filepath, downloadUrl: `/temp/${filename}` };
}

export async function unlinkQuiet(filePath?: string | null): Promise<void> {
  if (!filePath) return;
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

export async function purgeExpiredTemp(ttlMs = tempTtlMs()): Promise<number> {
  const cutoff = Date.now() - ttlMs;
  let removed = 0;
  try {
    const entries = await fs.readdir(tempDir, { withFileTypes: true });
    await Promise.all(entries.map(async (entry) => {
      if (!entry.isFile() || entry.name.startsWith('.')) return;
      const full = path.join(tempDir, entry.name);
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
    return 0;
  }
  return removed;
}

export function startTempCleanup(intervalMs = 5 * 60 * 1000) {
  void purgeExpiredTemp();
  return setInterval(() => {
    void purgeExpiredTemp();
  }, intervalMs);
}
