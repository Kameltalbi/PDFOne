import { mapPdfError } from '../utils/pdf.js';
import { runHeavyJob } from '../utils/workerPool.js';

export type CompressQuality = 'low' | 'medium' | 'high';

export async function compressPdf(
  filePath: string,
  quality: CompressQuality = 'medium',
  signal?: AbortSignal
): Promise<{
  filepath: string;
  filename: string;
  downloadUrl: string;
  originalSize: number;
  compressedSize: number;
}> {
  try {
    return await runHeavyJob({ type: 'compress', filePath, quality }, signal);
  } catch (error) {
    const code = (error as Error & { code?: string }).code;
    if (code === 'SERVER_BUSY' || code === 'QUEUE_WAIT_TIMEOUT' || code === 'JOB_TIMEOUT' || code === 'REQUEST_ABORTED') {
      throw error;
    }
    throw new Error(mapPdfError(error, 'Impossible de compresser ce PDF.'));
  }
}
