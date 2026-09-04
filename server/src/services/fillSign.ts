import fs from 'fs/promises';
import {
  LineCapStyle,
  PDFCheckBox,
  PDFDropdown,
  PDFDocument,
  PDFOptionList,
  PDFRadioGroup,
  PDFTextField,
  StandardFonts,
  rgb
} from 'pdf-lib';
import { loadPdf, mapPdfError } from '../utils/pdf.js';
import { writeTemp } from '../utils/temp.js';

export type FillSignPoint = { x: number; y: number };

export type FillSignAnnotation =
  | {
      type: 'text';
      page: number;
      x: number;
      y: number;
      text: string;
      size: number;
      color: string;
      bold?: boolean;
    }
  | {
      type: 'drawing';
      page: number;
      color: string;
      width: number;
      points: FillSignPoint[];
    }
  | {
      type: 'mark';
      page: number;
      kind: 'check' | 'cross' | 'checkbox' | 'circle';
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
    }
  | {
      type: 'image';
      page: number;
      x: number;
      y: number;
      width: number;
      height: number;
      dataUrl: string;
    };

function hexToRgb(hex: string) {
  const value = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#111827';
  return {
    r: parseInt(value.slice(1, 3), 16) / 255,
    g: parseInt(value.slice(3, 5), 16) / 255,
    b: parseInt(value.slice(5, 7), 16) / 255
  };
}

function box(x: number, y: number, width: number, height: number) {
  const x2 = x + width;
  const y2 = y + height;
  return {
    x: Math.min(x, x2),
    y: Math.min(y, y2),
    width: Math.abs(width),
    height: Math.abs(height)
  };
}

async function embedImage(document: PDFDocument, dataUrl: string) {
  const match = dataUrl.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/i);
  if (!match) return null;
  const bytes = Buffer.from(match[2], 'base64');
  if (match[1].toLowerCase() === 'png') return document.embedPng(bytes);
  return document.embedJpg(bytes);
}

async function applyFormValues(pdf: PDFDocument, rawValues: unknown) {
  const values = rawValues && typeof rawValues === 'object' ? rawValues as Record<string, unknown> : {};
  const names = Object.keys(values);
  if (names.length === 0) return false;

  const form = pdf.getForm();
  const fields = form.getFields();
  if (fields.length === 0) return false;

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  let filled = false;

  for (const field of fields) {
    const name = field.getName();
    if (!(name in values)) continue;
    const value = values[name];
    try {
      if (field instanceof PDFTextField) {
        field.setText(String(value ?? '').slice(0, 2000));
        filled = true;
      } else if (field instanceof PDFCheckBox) {
        const on = value === true || value === 'true' || value === '1' || value === 'on';
        if (on) field.check();
        else field.uncheck();
        filled = true;
      } else if (field instanceof PDFDropdown || field instanceof PDFOptionList || field instanceof PDFRadioGroup) {
        const selected = String(value ?? '');
        if (selected) {
          field.select(selected);
          filled = true;
        }
      }
    } catch {
      /* skip a field that cannot take this value */
    }
  }

  if (filled) {
    form.updateFieldAppearances(font);
    form.flatten();
  }
  return filled;
}

async function applyAnnotations(pdf: PDFDocument, annotations: FillSignAnnotation[]) {
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = pdf.getPages();

  for (const annotation of annotations) {
    const page = pages[annotation.page];
    if (!page) continue;
    const { width, height } = page.getSize();

    if (annotation.type === 'image') {
      const image = await embedImage(pdf, annotation.dataUrl);
      if (!image) continue;
      const drawn = box(annotation.x, annotation.y, annotation.width, annotation.height);
      page.drawImage(image, drawn);
      continue;
    }

    const color = hexToRgb(annotation.color);
    const pdfColor = rgb(color.r, color.g, color.b);

    if (annotation.type === 'text') {
      const size = Math.min(96, Math.max(6, annotation.size));
      const font = annotation.bold ? bold : regular;
      const text = annotation.text.slice(0, 500);
      page.drawText(text, {
        x: Math.max(0, Math.min(width, annotation.x)),
        y: Math.max(0, Math.min(height - size, annotation.y)),
        size,
        font,
        color: pdfColor
      });
      continue;
    }

    if (annotation.type === 'drawing') {
      for (let index = 1; index < annotation.points.length; index += 1) {
        const start = annotation.points[index - 1];
        const end = annotation.points[index];
        page.drawLine({
          start,
          end,
          thickness: Math.min(20, Math.max(0.5, annotation.width)),
          color: pdfColor,
          lineCap: LineCapStyle.Round
        });
      }
      continue;
    }

    const drawn = box(annotation.x, annotation.y, annotation.width, annotation.height);
    const stroke = Math.max(1.2, Math.min(drawn.width, drawn.height) * 0.12);

    if (annotation.kind === 'checkbox') {
      page.drawRectangle({
        ...drawn,
        borderWidth: stroke,
        borderColor: pdfColor
      });
      page.drawLine({
        start: { x: drawn.x + drawn.width * 0.18, y: drawn.y + drawn.height * 0.48 },
        end: { x: drawn.x + drawn.width * 0.42, y: drawn.y + drawn.height * 0.22 },
        thickness: stroke,
        color: pdfColor,
        lineCap: LineCapStyle.Round
      });
      page.drawLine({
        start: { x: drawn.x + drawn.width * 0.42, y: drawn.y + drawn.height * 0.22 },
        end: { x: drawn.x + drawn.width * 0.82, y: drawn.y + drawn.height * 0.78 },
        thickness: stroke,
        color: pdfColor,
        lineCap: LineCapStyle.Round
      });
    } else if (annotation.kind === 'check') {
      page.drawLine({
        start: { x: drawn.x + drawn.width * 0.12, y: drawn.y + drawn.height * 0.48 },
        end: { x: drawn.x + drawn.width * 0.4, y: drawn.y + drawn.height * 0.18 },
        thickness: stroke * 1.2,
        color: pdfColor,
        lineCap: LineCapStyle.Round
      });
      page.drawLine({
        start: { x: drawn.x + drawn.width * 0.4, y: drawn.y + drawn.height * 0.18 },
        end: { x: drawn.x + drawn.width * 0.9, y: drawn.y + drawn.height * 0.82 },
        thickness: stroke * 1.2,
        color: pdfColor,
        lineCap: LineCapStyle.Round
      });
    } else if (annotation.kind === 'cross') {
      page.drawLine({
        start: { x: drawn.x + drawn.width * 0.15, y: drawn.y + drawn.height * 0.15 },
        end: { x: drawn.x + drawn.width * 0.85, y: drawn.y + drawn.height * 0.85 },
        thickness: stroke * 1.1,
        color: pdfColor,
        lineCap: LineCapStyle.Round
      });
      page.drawLine({
        start: { x: drawn.x + drawn.width * 0.85, y: drawn.y + drawn.height * 0.15 },
        end: { x: drawn.x + drawn.width * 0.15, y: drawn.y + drawn.height * 0.85 },
        thickness: stroke * 1.1,
        color: pdfColor,
        lineCap: LineCapStyle.Round
      });
    } else {
      page.drawEllipse({
        x: drawn.x + drawn.width / 2,
        y: drawn.y + drawn.height / 2,
        xScale: drawn.width / 2,
        yScale: drawn.height / 2,
        borderWidth: stroke,
        borderColor: pdfColor
      });
    }
  }
}

export async function fillAndSignPdf(
  filePath: string,
  annotations: FillSignAnnotation[],
  formValues: unknown
) {
  try {
    const pdf = await loadPdf(await fs.readFile(filePath));
    await applyFormValues(pdf, formValues);
    if (Array.isArray(annotations) && annotations.length > 0) {
      await applyAnnotations(pdf, annotations.slice(0, 1000));
    }
    return writeTemp(await pdf.save(), 'fill-sign', 'pdf');
  } catch (error) {
    throw new Error(mapPdfError(error, 'Impossible de remplir ou de signer ce PDF.'));
  }
}
