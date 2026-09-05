import fs from 'fs/promises';
import { PDFDocument } from 'pdf-lib';
import { loadPdf, mapPdfError } from '../utils/pdf.js';
import { rasterizePdfPages } from '../utils/rasterize.js';
import { writeTemp } from '../utils/temp.js';
import { pdfQueue } from '../utils/jobQueue.js';

export type CompressQuality = 'low' | 'medium' | 'high';

const QUALITY_PRESETS: Record<CompressQuality, { scale: number; jpeg: number } | null> = {
  high: null,
  medium: { scale: 1.5, jpeg: 70 },
  low: { scale: 1, jpeg: 45 }
};

export async function compressPdf(
  filePath: string,
  quality: CompressQuality = 'medium'
): Promise<{
  filepath: string;
  filename: string;
  downloadUrl: string;
  originalSize: number;
  compressedSize: number;
}> {
  return pdfQueue.run(async () => {
  try {
    const original = await fs.readFile(filePath);
    const preset = Object.prototype.hasOwnProperty.call(QUALITY_PRESETS, quality)
      ? QUALITY_PRESETS[quality]
      : QUALITY_PRESETS.medium;
    let outputBytes: Uint8Array;

    if (!preset) {
      // high: keep vectors/text — rewrite with object streams only
      const source = await loadPdf(original);
      const optimized = await PDFDocument.create();
      const pages = await optimized.copyPages(source, source.getPageIndices());
      pages.forEach((page) => optimized.addPage(page));
      outputBytes = await optimized.save({ useObjectStreams: true });
    } else {
      const source = await loadPdf(original);
      const images = await rasterizePdfPages(original, {
        scale: preset.scale,
        format: 'jpeg',
        quality: preset.jpeg
      });
      const output = await PDFDocument.create();
      for (const [index, image] of images.entries()) {
        const embedded = await output.embedJpg(image);
        const { width, height } = source.getPage(index).getSize();
        const page = output.addPage([width, height]);
        page.drawImage(embedded, { x: 0, y: 0, width, height });
      }
      outputBytes = await output.save({ useObjectStreams: true });
    }

    const result = await writeTemp(outputBytes, 'compressed', 'pdf');
    return {
      ...result,
      originalSize: original.byteLength,
      compressedSize: outputBytes.byteLength
    };
  } catch (error) {
    if ((error as Error & { code?: string }).code === 'SERVER_BUSY') throw error;
    throw new Error(mapPdfError(error, 'Impossible de compresser ce PDF.'));
  }
  });
}
