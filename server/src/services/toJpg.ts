import { mapPdfError } from '../utils/pdf.js';
import { runHeavyJob } from '../utils/workerPool.js';

export async function pdfToRaster(
  filePath: string,
  format: 'jpeg' | 'png' = 'jpeg',
  quality = 85,
  password = ''
): Promise<{ filepath: string; filename: string; downloadUrl: string }> {
  try {
    return await runHeavyJob({
      type: 'toRaster',
      filePath,
      format,
      quality,
      password
    });
  } catch (error) {
    if ((error as Error & { code?: string }).code === 'SERVER_BUSY') throw error;
    throw new Error(mapPdfError(error, `Impossible de convertir ce PDF en ${format === 'png' ? 'PNG' : 'JPG'}.`));
  }
}

export async function pdfToJpg(filePath: string, quality = 85) {
  return pdfToRaster(filePath, 'jpeg', quality);
}

export async function pdfToPng(filePath: string) {
  return pdfToRaster(filePath, 'png');
}
