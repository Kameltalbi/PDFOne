import fs from 'fs/promises';
import JSZip from 'jszip';
import {
  PDFDict,
  PDFDocument,
  PDFName,
  PDFRawStream,
  decodePDFRawStream
} from 'pdf-lib';
import sharp from 'sharp';
import { mapPdfError } from '../utils/pdf.js';
import { writeTemp } from '../utils/temp.js';

function nameOf(value: unknown): string {
  if (value instanceof PDFName) return value.decodeText();
  return String(value ?? '');
}

function isJpegFilter(filter: unknown): boolean {
  if (filter instanceof PDFName) return nameOf(filter) === 'DCTDecode';
  if (Array.isArray(filter)) return filter.some((item) => nameOf(item) === 'DCTDecode');
  const maybeArray = filter as { asArray?: () => unknown[] } | null;
  if (maybeArray?.asArray) return maybeArray.asArray().some((item) => nameOf(item) === 'DCTDecode');
  return false;
}

async function addImageFromStream(stream: PDFRawStream, zip: JSZip, index: { n: number }) {
  const subtype = stream.dict.get(PDFName.of('Subtype'));
  if (nameOf(subtype) !== 'Image') return;

  const width = Number((stream.dict.lookup(PDFName.of('Width')) as { asNumber?: () => number })?.asNumber?.() || 0);
  const height = Number((stream.dict.lookup(PDFName.of('Height')) as { asNumber?: () => number })?.asNumber?.() || 0);
  if (!width || !height) return;

  const decoded = Buffer.from(decodePDFRawStream(stream).decode());
  index.n += 1;
  const stem = `image-${String(index.n).padStart(3, '0')}`;

  if (isJpegFilter(stream.dict.lookup(PDFName.of('Filter')))) {
    zip.file(`${stem}.jpg`, decoded);
    return;
  }

  const colorSpace = stream.dict.lookup(PDFName.of('ColorSpace'));
  const channels = nameOf(colorSpace) === 'DeviceGray' ? 1 : nameOf(colorSpace) === 'DeviceCMYK' ? 4 : 3;
  const png = await sharp(decoded, { raw: { width, height, channels } }).png().toBuffer();
  zip.file(`${stem}.png`, png);
}

async function walkXObjects(xObject: PDFDict | undefined, seen: Set<PDFDict>, zip: JSZip, index: { n: number }) {
  if (!xObject) return;
  for (const ref of xObject.values()) {
    const node = xObject.context.lookup(ref);
    if (node instanceof PDFRawStream) {
      if (seen.has(node.dict)) continue;
      seen.add(node.dict);
      const subtype = nameOf(node.dict.get(PDFName.of('Subtype')));
      if (subtype === 'Form') {
        const resources = node.dict.lookup(PDFName.of('Resources'));
        const nested = resources instanceof PDFDict ? resources.lookup(PDFName.of('XObject')) : undefined;
        await walkXObjects(nested instanceof PDFDict ? nested : undefined, seen, zip, index);
        continue;
      }
      try {
        await addImageFromStream(node, zip, index);
      } catch {
        index.n = Math.max(0, index.n - 1);
      }
    }
  }
}

export async function extractPdfImages(filePath: string): Promise<{
  filepath: string;
  filename: string;
  downloadUrl: string;
}> {
  try {
    const pdf = await PDFDocument.load(await fs.readFile(filePath), { ignoreEncryption: true });
    const zip = new JSZip();
    const index = { n: 0 };
    const seen = new Set<PDFDict>();

    for (const page of pdf.getPages()) {
      const resources = page.node.Resources();
      const xObject = resources?.lookup(PDFName.of('XObject'));
      await walkXObjects(xObject instanceof PDFDict ? xObject : undefined, seen, zip, index);
    }

    if (index.n === 0) {
      throw new Error('Aucune image n’a été trouvée dans ce PDF.');
    }

    const files = Object.values(zip.files).filter((file) => !file.dir);
    if (files.length === 1) {
      const bytes = await files[0].async('nodebuffer');
      const ext = files[0].name.endsWith('.jpg') ? 'jpg' : 'png';
      return writeTemp(bytes, 'image', ext);
    }

    const zipBytes = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    return writeTemp(zipBytes, 'images', 'zip');
  } catch (error) {
    throw new Error(mapPdfError(error, 'Impossible d’extraire les images de ce PDF.'));
  }
}
