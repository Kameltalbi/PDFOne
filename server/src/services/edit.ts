import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, '../../../temp');

type TextAnnotation = {
  type: 'text';
  page: number;
  x: number;
  y: number;
  text: string;
  size: number;
  color: string;
  decoration?: 'underline' | 'strike';
};

type DrawingAnnotation = {
  type: 'drawing';
  page: number;
  color: string;
  width: number;
  points: Array<{ x: number; y: number }>;
};

type ShapeAnnotation = {
  type: 'shape'; page: number; shape: 'rectangle' | 'line' | 'arrow'; color: string; width: number;
  start: { x: number; y: number }; end: { x: number; y: number };
};

type ImageAnnotation = {
  type: 'image'; page: number; x: number; y: number; width: number; height: number; dataUrl: string;
};

export type PdfAnnotation = TextAnnotation | DrawingAnnotation | ShapeAnnotation | ImageAnnotation;

function hexToRgb(hex: string) {
  const value = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#111827';
  return {
    r: parseInt(value.slice(1, 3), 16) / 255,
    g: parseInt(value.slice(3, 5), 16) / 255,
    b: parseInt(value.slice(5, 7), 16) / 255
  };
}

export async function editPdf(filePath: string, annotations: PdfAnnotation[]): Promise<string> {
  const source = await fs.readFile(filePath);
  const document = await PDFDocument.load(source);
  const font = await document.embedFont(StandardFonts.Helvetica);
  const pages = document.getPages();

  for (const annotation of annotations) {
    const page = pages[annotation.page];
    if (!page) continue;

    const { width, height } = page.getSize();
    if (annotation.type === 'image') {
      const match = annotation.dataUrl.match(/^data:image\/(png|jpeg);base64,(.+)$/);
      if (!match) continue;
      const bytes = Buffer.from(match[2], 'base64');
      const image = match[1] === 'png' ? await document.embedPng(bytes) : await document.embedJpg(bytes);
      page.drawImage(image, {
        x: annotation.x * width, y: height - annotation.y * height - annotation.height * height,
        width: annotation.width * width, height: annotation.height * height
      });
      continue;
    }

    const color = hexToRgb(annotation.color);
    const pdfColor = rgb(color.r, color.g, color.b);

    if (annotation.type === 'text') {
      const size = Math.min(96, Math.max(6, annotation.size));
      page.drawText(annotation.text.slice(0, 500), {
        x: Math.max(0, Math.min(1, annotation.x)) * width,
        y: height - Math.max(0, Math.min(1, annotation.y)) * height - size,
        size,
        font,
        color: pdfColor
      });
      if (annotation.decoration) {
        const textWidth = font.widthOfTextAtSize(annotation.text.slice(0, 500), size);
        const baseY = height - annotation.y * height - size;
        const lineY = annotation.decoration === 'underline' ? baseY - 2 : baseY + size * .45;
        page.drawLine({ start: { x: annotation.x * width, y: lineY }, end: { x: annotation.x * width + textWidth, y: lineY }, thickness: Math.max(1, size / 12), color: pdfColor });
      }
      continue;
    }

    if (annotation.type === 'shape') {
      const start = { x: annotation.start.x * width, y: height - annotation.start.y * height };
      const end = { x: annotation.end.x * width, y: height - annotation.end.y * height };
      if (annotation.shape === 'rectangle') {
        page.drawRectangle({ x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), width: Math.abs(end.x - start.x), height: Math.abs(end.y - start.y), borderWidth: annotation.width, borderColor: pdfColor });
      } else {
        page.drawLine({ start, end, thickness: annotation.width, color: pdfColor });
        if (annotation.shape === 'arrow') {
          const angle = Math.atan2(end.y - start.y, end.x - start.x); const head = 12;
          for (const offset of [-.45, .45]) page.drawLine({ start: end, end: { x: end.x - head * Math.cos(angle + offset), y: end.y - head * Math.sin(angle + offset) }, thickness: annotation.width, color: pdfColor });
        }
      }
      continue;
    }

    for (let index = 1; index < annotation.points.length; index += 1) {
      const start = annotation.points[index - 1];
      const end = annotation.points[index];
      page.drawLine({
        start: { x: start.x * width, y: height - start.y * height },
        end: { x: end.x * width, y: height - end.y * height },
        thickness: Math.min(20, Math.max(0.5, annotation.width)),
        color: pdfColor
      });
    }
  }

  const outputPath = path.join(tempDir, `modified-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.pdf`);
  await fs.writeFile(outputPath, await document.save());
  return outputPath;
}
