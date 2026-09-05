import { parentPort, isMainThread } from 'node:worker_threads';
import fs from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { loadPdf, mapPdfError } from './pdf.js';
import { forEachRasterPage } from './rasterize.js';
import { writeTemp } from './temp.js';

type CompressQuality = 'low' | 'medium' | 'high';

const QUALITY_PRESETS: Record<CompressQuality, { scale: number; jpeg: number } | null> = {
  high: null,
  medium: { scale: 1.5, jpeg: 70 },
  low: { scale: 1, jpeg: 45 }
};

export type HeavyJobPayload =
  | { type: 'compress'; filePath: string; quality: CompressQuality }
  | { type: 'toRaster'; filePath: string; format: 'jpeg' | 'png'; quality: number; password?: string };

async function compressJob(filePath: string, quality: CompressQuality) {
  const original = await fs.readFile(filePath);
  const preset = Object.prototype.hasOwnProperty.call(QUALITY_PRESETS, quality)
    ? QUALITY_PRESETS[quality]
    : QUALITY_PRESETS.medium;
  let outputBytes: Uint8Array;

  if (!preset) {
    const source = await loadPdf(original);
    const optimized = await PDFDocument.create();
    const pages = await optimized.copyPages(source, source.getPageIndices());
    pages.forEach((page) => optimized.addPage(page));
    outputBytes = await optimized.save({ useObjectStreams: true });
  } else {
    const source = await loadPdf(original);
    const output = await PDFDocument.create();
    await forEachRasterPage(
      original,
      { scale: preset.scale, format: 'jpeg', quality: preset.jpeg },
      async ({ index, image }) => {
        const embedded = await output.embedJpg(image);
        const { width, height } = source.getPage(index).getSize();
        const page = output.addPage([width, height]);
        page.drawImage(embedded, { x: 0, y: 0, width, height });
      }
    );
    outputBytes = await output.save({ useObjectStreams: true });
  }

  const result = await writeTemp(outputBytes, 'compressed', 'pdf');
  return {
    ...result,
    originalSize: original.byteLength,
    compressedSize: outputBytes.byteLength
  };
}

async function toRasterJob(
  filePath: string,
  format: 'jpeg' | 'png',
  quality: number,
  password = ''
) {
  const pdfBytes = await fs.readFile(filePath);
  const ext = format === 'png' ? 'png' : 'jpg';
  let single: Buffer | null = null;
  const zip = new JSZip();
  let count = 0;

  await forEachRasterPage(
    pdfBytes,
    { scale: 2, format, quality, password },
    async ({ index, total, image }) => {
      count = total;
      if (total === 1) {
        single = image;
        return;
      }
      zip.file(`page-${String(index + 1).padStart(3, '0')}.${ext}`, image);
    }
  );

  if (count === 1 && single) {
    return writeTemp(single, 'page', ext);
  }
  const zipBytes = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  return writeTemp(zipBytes, 'pages', 'zip');
}

export async function executeHeavyJob(job: HeavyJobPayload) {
  if (job.type === 'compress') {
    return compressJob(job.filePath, job.quality);
  }
  return toRasterJob(job.filePath, job.format, job.quality, job.password || '');
}

if (!isMainThread && parentPort) {
  parentPort.on('message', async (message: { id: number; job: HeavyJobPayload }) => {
    try {
      const result = await executeHeavyJob(message.job);
      parentPort!.postMessage({ ok: true, id: message.id, result });
    } catch (error) {
      parentPort!.postMessage({
        ok: false,
        id: message.id,
        error: mapPdfError(error, error instanceof Error ? error.message : 'Heavy job failed.'),
        code: (error as Error & { code?: string }).code
      });
    }
  });
}
