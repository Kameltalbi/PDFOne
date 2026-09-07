import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { rasterizeFirstPage } from './rasterize.js';

const PREVIEW_MAX_BYTES = 80 * 1024 * 1024;
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function isPdfMagic(bytes: Uint8Array) {
  return bytes.length >= 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}

function isJpeg(bytes: Uint8Array) {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isPng(bytes: Uint8Array) {
  return bytes.length >= 8
    && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
}

function isWebp(bytes: Uint8Array) {
  return bytes.length >= 12
    && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
    && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
}

function isImageBytes(bytes: Uint8Array) {
  return isJpeg(bytes) || isPng(bytes) || isWebp(bytes);
}

/** JPEG of the processed file (first PDF page or resized image). Does not consume the download. */
export async function buildResultPreview(filepath: string): Promise<Buffer | null> {
  const stat = await fs.stat(filepath).catch(() => null);
  if (!stat?.isFile() || stat.size < 16 || stat.size > PREVIEW_MAX_BYTES) return null;

  const ext = path.extname(filepath).toLowerCase();
  const bytes = await fs.readFile(filepath);

  if (IMAGE_EXT.has(ext) || isImageBytes(bytes)) {
    return sharp(bytes)
      .rotate()
      .resize(720, 900, { fit: 'inside', withoutEnlargement: true })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer();
  }

  if (ext === '.pdf' || isPdfMagic(bytes)) {
    try {
      return await rasterizeFirstPage(new Uint8Array(bytes), {
        scale: 1.15,
        format: 'jpeg',
        quality: 78,
        maxPixels: 2_000_000
      });
    } catch {
      return null;
    }
  }

  return null;
}
