import { mapPdfError } from '../utils/pdf.js';
import { runHeavyJob } from '../utils/workerPool.js';
import { pdfQueue } from '../utils/jobQueue.js';
import {
  convertPdfToJpegV2,
  pdfToImageV2Enabled
} from './pdfToImage.js';

function imageRunTimeoutMs(): number {
  const value = Number.parseInt(process.env.PDF_TO_IMAGE_RUN_TIMEOUT_MS || '', 10);
  return Number.isFinite(value) && value > 0 ? value : 300_000;
}

export async function pdfToRaster(
  filePath: string,
  format: 'jpeg' | 'png' = 'jpeg',
  quality = 85,
  password = '',
  signal?: AbortSignal
): Promise<{ filepath: string; filename: string; downloadUrl: string }> {
  try {
    return await runHeavyJob({
      type: 'toRaster',
      filePath,
      format,
      quality,
      password
    }, signal);
  } catch (error) {
    if ((error as Error & { code?: string }).code === 'SERVER_BUSY') throw error;
    throw new Error(mapPdfError(error, `Impossible de convertir ce PDF en ${format === 'png' ? 'PNG' : 'JPG'}.`));
  }
}

export async function pdfToJpg(
  filePath: string,
  quality = 85,
  signal?: AbortSignal
) {
  if (pdfToImageV2Enabled()) {
    return pdfQueue.run(
      (jobSignal) => convertPdfToJpegV2(filePath, quality, jobSignal),
      {
        signal,
        runTimeoutMs: imageRunTimeoutMs()
      }
    );
  }
  return pdfToRaster(filePath, 'jpeg', quality, '', signal);
}

export async function pdfToPng(filePath: string, signal?: AbortSignal) {
  return pdfToRaster(filePath, 'png', 90, '', signal);
}
