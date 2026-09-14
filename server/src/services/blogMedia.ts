import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const mediaDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../data/blog-media');
const NAME_RE = /^[a-f0-9]{24}\.webp$/;
const MAX_INPUT_BYTES = 4 * 1024 * 1024;

export function blogMediaFile(name: string): string | null {
  if (!NAME_RE.test(name)) return null;
  return path.join(mediaDir, name);
}

export async function saveBlogImage(buffer: Buffer): Promise<{ url: string; name: string }> {
  if (!buffer?.length) throw new Error('INVALID_IMAGE');
  if (buffer.length > MAX_INPUT_BYTES) throw new Error('IMAGE_TOO_LARGE');
  await fs.mkdir(mediaDir, { recursive: true });
  const name = `${crypto.randomBytes(12).toString('hex')}.webp`;
  const dest = path.join(mediaDir, name);
  await sharp(buffer)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(dest);
  return { name, url: `/api/blog/image/${name}` };
}
