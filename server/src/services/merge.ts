import fs from 'fs/promises';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { loadPdf, mapPdfError } from '../utils/pdf.js';
import { writeTemp } from '../utils/temp.js';

export async function mergePDFs(
  filePaths: string[],
  options: { pageNumbers?: boolean } = {}
): Promise<{ filepath: string; filename: string; downloadUrl: string }> {
  try {
    const mergedPdf = await PDFDocument.create();

    for (const filePath of filePaths) {
      const pdfBytes = await fs.readFile(filePath);
      const pdf = await loadPdf(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    if (options.pageNumbers) {
      const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
      const pages = mergedPdf.getPages();
      pages.forEach((page, index) => {
        const { width } = page.getSize();
        const label = `${index + 1} / ${pages.length}`;
        const size = 10;
        const textWidth = font.widthOfTextAtSize(label, size);
        page.drawText(label, {
          x: (width - textWidth) / 2,
          y: 14,
          size,
          font,
          color: rgb(0.35, 0.37, 0.42)
        });
      });
    }

    const mergedPdfBytes = await mergedPdf.save();
    return writeTemp(mergedPdfBytes, 'merged', 'pdf');
  } catch (error) {
    throw new Error(mapPdfError(error, 'Impossible de fusionner ces PDF.'));
  }
}
