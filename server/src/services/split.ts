import fs from 'fs/promises';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import { loadPdf, mapPdfError, parsePageSelection } from '../utils/pdf.js';
import { writeTemp } from '../utils/temp.js';

export type SplitMode = 'extract' | 'separate';

export async function splitPdf(
  filePath: string,
  rawPages: unknown,
  mode: SplitMode
): Promise<{ filepath: string; filename: string; downloadUrl: string }> {
  try {
    const sourceBytes = await fs.readFile(filePath);
    const source = await loadPdf(sourceBytes);
    const pages = parsePageSelection(rawPages, source.getPageCount());

    if (mode === 'separate') {
      const zip = new JSZip();
      for (const pageNumber of pages) {
        const output = await PDFDocument.create();
        const [copied] = await output.copyPages(source, [pageNumber - 1]);
        output.addPage(copied);
        zip.file(`page-${String(pageNumber).padStart(3, '0')}.pdf`, await output.save());
      }
      const zipBytes = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      return writeTemp(zipBytes, 'split', 'zip');
    }

    const output = await PDFDocument.create();
    const copiedPages = await output.copyPages(source, pages.map((page) => page - 1));
    copiedPages.forEach((page) => output.addPage(page));
    return writeTemp(await output.save(), 'split', 'pdf');
  } catch (error) {
    throw new Error(mapPdfError(error, 'Impossible de diviser ce PDF.'));
  }
}
