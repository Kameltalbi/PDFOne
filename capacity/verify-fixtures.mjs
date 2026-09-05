import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { PDFDocument } from 'pdf-lib';
import { PDFDocument as EncryptedPDF } from '@cantoo/pdf-lib';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import JSZip from 'jszip';
import heicConvert from 'heic-convert';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const standardFontDataUrl = path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'standard_fonts') + '/';
const root = new URL('./fixtures/', import.meta.url);
const manifest = JSON.parse(await fs.readFile(new URL('manifest.json', root), 'utf8'));
for (const item of manifest.files) {
  const bytes = await fs.readFile(new URL(item.name, root));
  assert.equal(bytes.length, item.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256);
  if (item.pages) {
    const pdf = item.family === 'encrypted' ? await EncryptedPDF.load(bytes, { password: item.password }) : await PDFDocument.load(bytes);
    assert.equal(pdf.getPageCount(), item.pages);
  }
  if (item.targetMB) assert.ok(Math.abs(bytes.length / (item.targetMB * 1e6) - 1) < .01);
  if (/\.(docx|odp)$/.test(item.name)) assert.ok(Object.keys((await JSZip.loadAsync(bytes)).files).length >= 3);
  if (item.name.endsWith('.heic')) assert.ok((await heicConvert({ buffer: bytes, format: 'JPEG', quality: .8 })).byteLength > 100);
}
// Independently parse/render one page from each PDF family; no application imports or network.
for (const name of ['pdf-1mb.pdf', 'text-2pages.pdf', 'scan-2pages.pdf', 'form.pdf']) {
  const loading = getDocument({ data: new Uint8Array(await fs.readFile(new URL(name, root))), isEvalSupported: false, standardFontDataUrl });
  const pdf = await loading.promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: .5 });
  const surface = pdf.canvasFactory.create(viewport.width, viewport.height);
  await page.render({ canvasContext: surface.context, canvas: surface.canvas, viewport }).promise;
  assert.ok(surface.canvas.toBuffer('image/png').length > 100);
  if (name.startsWith('scan')) assert.equal((await page.getTextContent()).items.length, 0);
  pdf.canvasFactory.destroy(surface);
  await loading.destroy();
}
console.log(`Verified ${manifest.files.length} synthetic fixtures; four PDF families rendered offline.`);
