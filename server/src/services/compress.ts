import fs from 'fs/promises';
import { PDFDocument } from 'pdf-lib';
import { loadPdf, mapPdfError } from '../utils/pdf.js';
import { rasterizePdfPages } from '../utils/rasterize.js';
import { writeTemp } from '../utils/temp.js';

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
  try {
    const original = await fs.readFile(filePath);
    const preset = QUALITY_PRESETS[quality] ?? QUALITY_PRESETS.medium;
    let outputBytes: Uint8Array;

    if (!preset) {
      const source = await loadPdf(original);
      const optimized = await PDFDocument.create();
      const pages = await optimized.copyPages(source, source.getPageIndices());
      pages.forEach((page) => optimized.addPage(page));
      outputBytes = await optimized.save({ useObjectStreams: true });
    } else {
      const images = await rasterizePdfPages(original, {
        scale: preset.scale,
        format: 'jpeg',
        quality: preset.jpeg
      });
      const output = await PDFDocument.create();
      for (const image of images) {
        const embedded = await output.embedJpg(image);
        const page = output.addPage([embedded.width, embedded.height]);
        page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
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
    throw new Error(mapPdfError(error, 'Impossible de compresser ce PDF.'));
  }
}
