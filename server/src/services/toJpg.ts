import fs from 'fs/promises';
import JSZip from 'jszip';
import { mapPdfError } from '../utils/pdf.js';
import { rasterizePdfPages } from '../utils/rasterize.js';
import { writeTemp } from '../utils/temp.js';

export async function pdfToRaster(
  filePath: string,
  format: 'jpeg' | 'png' = 'jpeg',
  quality = 85,
  password = ''
): Promise<{ filepath: string; filename: string; downloadUrl: string }> {
  try {
    const pdfBytes = await fs.readFile(filePath);
    const images = await rasterizePdfPages(pdfBytes, { scale: 2, format, quality, password });
    const ext = format === 'png' ? 'png' : 'jpg';
    if (images.length === 1) {
      return writeTemp(images[0], 'page', ext);
    }
    const zip = new JSZip();
    images.forEach((image, index) => {
      zip.file(`page-${String(index + 1).padStart(3, '0')}.${ext}`, image);
    });
    const zipBytes = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    return writeTemp(zipBytes, 'pages', 'zip');
  } catch (error) {
    throw new Error(mapPdfError(error, `Impossible de convertir ce PDF en ${format === 'png' ? 'PNG' : 'JPG'}.`));
  }
}

export async function pdfToJpg(filePath: string, quality = 85) {
  return pdfToRaster(filePath, 'jpeg', quality);
}

export async function pdfToPng(filePath: string) {
  return pdfToRaster(filePath, 'png');
}
