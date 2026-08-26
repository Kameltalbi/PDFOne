import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, '../../../temp');

export async function mergePDFs(filePaths: string[]): Promise<string> {
  try {
    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Process each PDF file
    for (const filePath of filePaths) {
      // Read the PDF file
      const pdfBytes = await fs.readFile(filePath);
      
      // Load the PDF document
      const pdf = await PDFDocument.load(pdfBytes);
      
      // Copy all pages from the PDF
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      
      // Add the copied pages to the merged PDF
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    
    // Write to temporary file
    const outputPath = path.join(tempDir, `merged-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.pdf`);
    await fs.writeFile(outputPath, mergedPdfBytes);
    
    return outputPath;
  } catch (error) {
    console.error('Error merging PDFs:', error);
    throw new Error('Failed to merge PDF files');
  }
}
