import { mapPdfError } from '../utils/pdf.js';
import { runHeavyJob } from '../utils/workerPool.js';

export type CompressQuality = 'low' | 'medium' | 'high';

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
    return await runHeavyJob({ type: 'compress', filePath, quality });
  } catch (error) {
    if ((error as Error & { code?: string }).code === 'SERVER_BUSY') throw error;
    throw new Error(mapPdfError(error, 'Impossible de compresser ce PDF.'));
  }
}
