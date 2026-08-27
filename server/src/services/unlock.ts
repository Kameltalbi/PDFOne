import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { PDFDocument } from '@cantoo/pdf-lib';
import { mapPdfError } from '../utils/pdf.js';
import { rasterizePdfPages } from '../utils/rasterize.js';
import { writeTemp } from '../utils/temp.js';

const execFileAsync = promisify(execFile);

async function imagesToUnlockedPdf(images: Buffer[]) {
  const pdf = await PDFDocument.create();
  for (const bytes of images) {
    const image = await pdf.embedJpg(bytes);
    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  return Buffer.from(await pdf.save());
}

async function copyWithoutEncryption(src: PDFDocument) {
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, src.getPageIndices());
  copied.forEach((page) => out.addPage(page));
  return Buffer.from(await out.save());
}

export async function unlockPdf(filePath: string, password: string) {
  const bytes = await fs.readFile(filePath);
  try {
    const pdf = await PDFDocument.load(bytes, password ? { password } : undefined);
    return writeTemp(await copyWithoutEncryption(pdf), 'unlocked', 'pdf');
  } catch (error) {
    if (!password) {
      const message = error instanceof Error ? error.message : String(error);
      if (/encrypt|password/i.test(message)) {
        throw new Error('Ce PDF est protégé. Indiquez le mot de passe pour le déverrouiller.');
      }
      throw new Error(mapPdfError(error, 'Impossible de lire ce PDF.'));
    }
  }

  const outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdfone-unlock-'));
  const outPath = path.join(outDir, 'unlocked.pdf');
  try {
    await execFileAsync('qpdf', [`--password=${password}`, '--decrypt', filePath, outPath], { timeout: 60000 });
    const unlocked = await fs.readFile(outPath);
    return writeTemp(unlocked, 'unlocked', 'pdf');
  } catch {
    try {
      const images = await rasterizePdfPages(bytes, { scale: 1.6, format: 'jpeg', quality: 88, password });
      if (!images.length) throw new Error('empty');
      return writeTemp(await imagesToUnlockedPdf(images), 'unlocked', 'pdf');
    } catch (error) {
      throw new Error(mapPdfError(error, 'Mot de passe incorrect, ou PDF impossible à déverrouiller.'));
    }
  } finally {
    await fs.rm(outDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
