import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { writeTemp } from '../utils/temp.js';

async function embedImage(pdf: PDFDocument, filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  const bytes = await fs.readFile(filePath);

  if (ext === '.png') {
    return pdf.embedPng(bytes);
  }

  if (ext === '.jpg' || ext === '.jpeg') {
    return pdf.embedJpg(bytes);
  }

  const jpeg = await sharp(bytes).jpeg({ quality: 90 }).toBuffer();
  return pdf.embedJpg(jpeg);
}

export async function imagesToPdf(filePaths: string[]): Promise<{
  filepath: string;
  filename: string;
  downloadUrl: string;
}> {
  try {
    const pdf = await PDFDocument.create();

    for (const filePath of filePaths) {
      const image = await embedImage(pdf, filePath);
      const page = pdf.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }

    return writeTemp(await pdf.save(), 'images', 'pdf');
  } catch {
    throw new Error('Impossible de convertir ces images en PDF.');
  }
}
