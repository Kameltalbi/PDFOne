import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { PDFDocument } from '@cantoo/pdf-lib';
import { mapPdfError } from '../utils/pdf.js';
import { forEachRasterPage } from '../utils/rasterize.js';
import { writeTemp } from '../utils/temp.js';

const execFileAsync = promisify(execFile);

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
      const pdf = await PDFDocument.create();
      let pages = 0;
      await forEachRasterPage(
        bytes,
        { scale: 1.6, format: 'jpeg', quality: 88, password },
        async ({ image }) => {
          const embedded = await pdf.embedJpg(image);
          const page = pdf.addPage([embedded.width, embedded.height]);
          page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
          pages += 1;
        }
      );
      if (!pages) throw new Error('empty');
      return writeTemp(await pdf.save(), 'unlocked', 'pdf');
    } catch (error) {
      throw new Error(mapPdfError(error, 'Mot de passe incorrect, ou PDF impossible à déverrouiller.'));
    }
  } finally {
    await fs.rm(outDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
