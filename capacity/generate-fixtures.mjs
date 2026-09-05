// Offline only. Existing workspace dependencies; never imports application services.
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { PDFDocument, StandardFonts, PDFName, rgb } from 'pdf-lib';
import { PDFDocument as EncryptedPDF } from '@cantoo/pdf-lib';
import sharp from 'sharp';
import JSZip from 'jszip';

const root = new URL('./fixtures/', import.meta.url);
await fs.mkdir(root, { recursive: true });
const manifest = { units: 'MB = 1,000,000 bytes; target sizes within 1%', files: [] };
const date = new Date('2026-01-01T00:00:00Z');
function metadata(pdf) {
  pdf.setTitle('One2PDF synthetic capacity fixture');
  pdf.setAuthor('Synthetic benchmark');
  pdf.setCreationDate(date); pdf.setModificationDate(date);
}
async function save(name, bytes, extra = {}) {
  await fs.writeFile(new URL(name, root), bytes);
  manifest.files.push({ name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), ...extra });
}

// Actual displayed image streams, not trailing padding or embedded attachments.
// Each page has a unique 400x414 RGB chart (~0.5 MB) plus selectable text.
for (const mb of [1, 5, 10, 25, 50]) {
  const pdf = await PDFDocument.create(); metadata(pdf);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < mb * 2; i++) {
    const width = 400, height = 414;
    const pixels = Buffer.alloc(width * height * 3);
    let seed = (i + 1) * 1234567;
    for (let p = 0; p < pixels.length; p += 3) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const x = (p / 3) % width, y = Math.floor(p / 3 / width);
      pixels[p] = (x + i * 7) % 256;
      pixels[p + 1] = (y + (seed >>> 28)) % 256;
      pixels[p + 2] = (x ^ y ^ i) % 256;
    }
    const stream = pdf.context.stream(pixels, {
      Type: 'XObject', Subtype: 'Image', Width: width, Height: height,
      ColorSpace: 'DeviceRGB', BitsPerComponent: 8,
    });
    const ref = pdf.context.register(stream);
    const page = pdf.addPage([595, 842]);
    page.node.setXObject(PDFName.of('Chart'), ref);
    page.node.addContentStream(pdf.context.register(pdf.context.flateStream('q 495 0 0 600 50 70 cm /Chart Do Q')));
    page.drawText(`SYNTHETIC ONLY - chart ${i + 1} - ${mb} MB class`, { x: 45, y: 790, font, size: 14 });
    page.drawText('Item A 100 | Item B 200 | Total 300', { x: 45, y: 760, font, size: 12 });
  }
  const bytes = await pdf.save({ useObjectStreams: false });
  if (Math.abs(bytes.length / (mb * 1e6) - 1) > .01) throw new Error('Fixture size outside tolerance');
  await save(`pdf-${mb}mb.pdf`, bytes, { pages: mb * 2, targetMB: mb, family: 'text-and-uncompressed-charts' });
}
for (const count of [2, 20, 100]) {
  const pdf = await PDFDocument.create(); metadata(pdf);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < count; i++) {
    const page = pdf.addPage([595, 842]);
    for (let row = 0; row < 35; row++) page.drawText(`Synthetic page ${i + 1} row ${row + 1}: item ${row} value ${row * 10}`, { x: 40, y: 790 - row * 20, size: 11, font });
  }
  await save(`text-${count}pages.pdf`, await pdf.save(), { pages: count, family: 'text' });
}
const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1190" height="1684"><rect width="100%" height="100%" fill="white"/><text x="100" y="180" font-size="48">SYNTHETIC OCR DOCUMENT</text>${Array.from({ length: 18 }, (_, i) => `<text x="100" y="${280 + i * 65}" font-size="28">Test row ${i + 1}: Invoice item ${i + 1} total 300.</text>`).join('')}</svg>`);
const png = await sharp(svg).png().toBuffer();
await save('image.png', png, { family: 'synthetic-scan', width: 1190, height: 1684 });
await save('image.jpg', await sharp(png).jpeg({ quality: 85 }).toBuffer(), { family: 'synthetic-scan' });
await save('image.webp', await sharp(png).webp().toBuffer(), { family: 'synthetic-scan' });
for (const count of [2, 10]) {
  const pdf = await PDFDocument.create(); metadata(pdf);
  const image = await pdf.embedPng(png);
  for (let i = 0; i < count; i++) pdf.addPage([595, 842]).drawImage(image, { x: 0, y: 0, width: 595, height: 842 });
  await save(`scan-${count}pages.pdf`, await pdf.save(), { pages: count, family: 'scanned-text-no-text-layer' });
}
const formPdf = await PDFDocument.create(); metadata(formPdf);
const formPage = formPdf.addPage([595, 842]);
formPage.drawText('Synthetic form', { x: 50, y: 780, color: rgb(0, 0, 0) });
formPdf.getForm().createTextField('test_value').addToPage(formPage, { x: 50, y: 700, width: 200, height: 30 });
await save('form.pdf', await formPdf.save(), { pages: 1, family: 'acroform' });
const encrypted = await EncryptedPDF.load(await fs.readFile(new URL('pdf-1mb.pdf', root)));
encrypted.encrypt({ userPassword: 'synthetic-test-only', ownerPassword: 'synthetic-test-only' });
await save('protected.pdf', await encrypted.save(), { pages: 2, family: 'encrypted', password: 'synthetic-test-only' });
await save('document.html', Buffer.from('<!doctype html><html><meta charset="utf-8"><body><h1>Synthetic document</h1><p>Local assets only. Total: 300.</p></body></html>'), { family: 'html-no-external-resources' });
await save('sheet.csv', Buffer.from('Item,Quantity,Price\nSynthetic A,10,20\nSynthetic B,5,30\n'), { family: 'spreadsheet' });
const zip = new JSZip();
const parts = {
  '[Content_Types].xml': '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
  '_rels/.rels': '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
  'word/document.xml': '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + Array.from({ length: 50 }, (_, i) => `<w:p><w:r><w:t>Synthetic paragraph ${i + 1}. Item A 100. Item B 200. Total 300.</w:t></w:r></w:p>`).join('') + '<w:sectPr/></w:body></w:document>',
};
for (const [name, xml] of Object.entries(parts)) zip.file(name, xml, { date });
await save('document.docx', await zip.generateAsync({ type: 'nodebuffer' }), { family: 'word' });
// A minimal standards-based OpenDocument presentation accepted by the audited route.
const odp = new JSZip();
odp.file('mimetype', 'application/vnd.oasis.opendocument.presentation', { date, compression: 'STORE' });
odp.file('META-INF/manifest.xml', '<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2"><manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.presentation"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>', { date });
odp.file('content.xml', '<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" office:version="1.2"><office:body><office:presentation><draw:page draw:name="Synthetic"><draw:frame svg:x="2cm" svg:y="2cm" svg:width="20cm" svg:height="10cm"><draw:text-box><text:p>Synthetic presentation. Total 300.</text:p></draw:text-box></draw:frame></draw:page></office:presentation></office:body></office:document-content>', { date });
await save('slides.odp', await odp.generateAsync({ type: 'nodebuffer' }), { family: 'presentation' });
await fs.writeFile(new URL('manifest.json', root), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
