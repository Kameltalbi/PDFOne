import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';
import { expect } from '@playwright/test';

const here = path.dirname(fileURLToPath(import.meta.url));

/** Load KEY=VALUE files into process.env without logging values. */
export function loadEnvFiles(files: string[]) {
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      if (process.env[key] !== undefined) continue;
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"'))
        || (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

export function loadE2eEnv() {
  const root = path.resolve(here, '../..');
  loadEnvFiles([
    path.join(root, 'e2e/.env.local'),
    path.join(root, 'e2e/.env')
  ]);
}

export function assertMagic(bytes: Buffer, magic: number[], label: string) {
  expect(bytes.byteLength, `${label} too small`).toBeGreaterThan(32);
  for (let i = 0; i < magic.length; i++) {
    expect(bytes[i], `${label} magic byte ${i}`).toBe(magic[i]);
  }
}

export function assertZipContainer(bytes: Buffer, label = 'zip') {
  assertMagic(bytes, [0x50, 0x4b], label);
}

export function assertJpeg(bytes: Buffer) {
  assertMagic(bytes, [0xff, 0xd8, 0xff], 'jpeg');
}

export function assertDocx(bytes: Buffer) {
  assertZipContainer(bytes, 'docx');
  const asString = bytes.toString('latin1');
  expect(asString).toContain('word/');
}

export function assertXlsx(bytes: Buffer) {
  assertZipContainer(bytes, 'xlsx');
  const asString = bytes.toString('latin1');
  expect(asString).toMatch(/xl\/|worksheets/);
}

export async function assertPdf(
  bytes: Buffer,
  opts: { minPages?: number; maxPages?: number } = {}
) {
  expect(bytes.subarray(0, 5).toString('utf8')).toBe('%PDF-');
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPageCount();
  if (opts.minPages != null) expect(pages).toBeGreaterThanOrEqual(opts.minPages);
  if (opts.maxPages != null) expect(pages).toBeLessThanOrEqual(opts.maxPages);
  return doc;
}

export async function assertEncryptedPdf(bytes: Buffer) {
  expect(bytes.subarray(0, 5).toString('utf8')).toBe('%PDF-');
  let threw = false;
  try {
    await PDFDocument.load(bytes, { ignoreEncryption: false });
  } catch {
    threw = true;
  }
  expect(threw, 'expected encrypted PDF to reject load without password').toBe(true);
}

export async function assertZipWithEntries(bytes: Buffer, opts: { minFiles?: number; ext?: string } = {}) {
  assertZipContainer(bytes);
  // Local file headers: "PK\x03\x04" — count roughly via magic
  let count = 0;
  for (let i = 0; i < bytes.length - 4; i++) {
    if (bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 0x03 && bytes[i + 3] === 0x04) {
      count += 1;
    }
  }
  expect(count).toBeGreaterThanOrEqual(opts.minFiles ?? 1);
  if (opts.ext) {
    expect(bytes.toString('latin1').toLowerCase()).toContain(opts.ext.toLowerCase());
  }
  return count;
}

/** Search raw PDF bytes and FlateDecode streams for a literal (form flatten / drawText). */
export function pdfContainsText(bytes: Buffer, needle: string): boolean {
  if (bytes.includes(Buffer.from(needle, 'utf8'))) return true;
  const latin = bytes.toString('latin1');
  if (latin.includes(needle)) return true;
  const hexNeedle = Buffer.from(needle, 'utf8').toString('hex').toUpperCase();
  if (latin.toUpperCase().includes(hexNeedle)) return true;
  const re = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(latin))) {
    const raw = Buffer.from(match[1], 'latin1');
    for (const decoder of [zlib.inflateSync, zlib.inflateRawSync] as const) {
      try {
        const inflated = decoder(raw);
        const asLatin = inflated.toString('latin1');
        if (
          inflated.includes(Buffer.from(needle, 'utf8'))
          || asLatin.includes(needle)
          || asLatin.toUpperCase().includes(hexNeedle)
        ) {
          return true;
        }
      } catch {
        /* not this encoding */
      }
    }
  }
  return false;
}

export function assertJpegOrZipOfJpegs(bytes: Buffer) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    assertJpeg(bytes);
    return 'jpeg' as const;
  }
  assertZipContainer(bytes, 'jpg-zip');
  return 'zip' as const;
}
