import { localizedPath, type UrlLocale } from '../i18n/localePath';
import type { Messages } from '../i18n/types';

type CatalogTool = {
  id: string;
  path: string;
  icon: string;
  color: string;
  keywords?: string;
  /** False only for tools that stay noindex. They remain in the visible catalog. */
  indexable?: boolean;
  label: (m: Messages) => string;
  description: (m: Messages) => string;
};

/**
 * Single catalog for the React tools page, the home list, and the prerender.
 * Paths are final URLs. /png-to-pdf stays an alias route and is not linked here.
 */
export const TOOL_CATALOG: CatalogTool[] = [
  { id: 'edit', path: '/edit-pdf', icon: '📝', color: '#f59e0b', keywords: 'edit text draw éditer', label: (m) => m.tools.edit, description: (m) => m.edit.subtitle },
  { id: 'fillSign', path: '/fill-sign-pdf', icon: '✍', color: '#dc2626', keywords: 'fill sign remplir signer signature formulaire date checkbox', label: (m) => m.tools.fillSign, description: (m) => m.fillSign.subtitle },
  { id: 'compress', path: '/compress', icon: '⇊', color: '#f05b43', label: (m) => m.tools.compress, description: (m) => m.compress.subtitle },
  { id: 'merge', path: '/merge', icon: '📂', color: '#f59e0b', label: (m) => m.tools.merge, description: (m) => m.merge.subtitle },
  { id: 'pdfToWord', path: '/pdf-to-word', icon: 'W', color: '#2684ff', keywords: 'word docx office', label: (m) => m.tools.pdfToWord, description: (m) => m.convert.pdfToWordDesc },
  { id: 'wordToPdf', path: '/word-to-pdf', icon: 'W', color: '#2684ff', keywords: 'word docx office', label: (m) => m.tools.wordToPdf, description: (m) => m.convert.wordToPdfDesc },
  { id: 'pdfToJpg', path: '/to-jpg', icon: 'JPG', color: '#7c5cff', label: (m) => m.tools.pdfToJpg, description: (m) => m.toJpg.subtitle },
  { id: 'jpgToPdf', path: '/jpg-to-pdf', icon: '▧', color: '#7c5cff', label: (m) => m.tools.jpgToPdf, description: (m) => m.jpgToPdf.subtitle },
  { id: 'pdfToExcel', path: '/pdf-to-excel', icon: 'X', color: '#18a957', keywords: 'excel xlsx office', label: (m) => m.tools.pdfToExcel, description: (m) => m.convert.pdfToExcelDesc },
  { id: 'protect', path: '/protect', icon: '✓', color: '#3b82f6', label: (m) => m.tools.protect, description: (m) => m.protect.subtitle },
  { id: 'split', path: '/split', icon: '✂', color: '#252525', label: (m) => m.tools.split, description: (m) => m.split.subtitle },
  { id: 'rotate', path: '/rotate', icon: '↻', color: '#31b524', label: (m) => m.tools.rotate, description: (m) => m.rotatePdf.subtitle },
  { id: 'sign', path: '/sign', icon: '✍', color: '#292929', keywords: 'signature numérique signer sign digital firma assinatura imza توقيع', label: (m) => m.tools.sign, description: (m) => m.signPdf.subtitle },
  { id: 'deletePages', path: '/delete-pages', icon: '🗑', color: '#333333', label: (m) => m.tools.deletePages, description: (m) => m.deletePages.subtitle },
  { id: 'reorderPages', path: '/reorder', icon: '▦', color: '#f59e0b', label: (m) => m.tools.reorderPages, description: (m) => m.reorderPages.subtitle },
  { id: 'ocr', path: '/ocr', icon: 'OCR', color: '#374151', keywords: 'ocr scan texte tesseract', label: (m) => m.tools.ocr, description: (m) => m.ocrPdf.subtitle },
  { id: 'summarize', path: '/summarize', icon: '☷', color: '#54b92f', keywords: 'résumer summary resume', label: (m) => m.tools.summarize, description: (m) => m.summarizePdf.subtitle },
  { id: 'translate', path: '/translate', icon: 'A文', color: '#ef5b45', keywords: 'traduire translate traduction', indexable: false, label: (m) => m.tools.translate, description: (m) => m.translatePdf.subtitle },
  { id: 'pngToPdf', path: '/jpg-to-pdf', icon: 'PNG', color: '#27b51c', keywords: 'png image', label: (m) => m.tools.pngToPdf, description: (m) => m.jpgToPdf.subtitle },
  { id: 'pdfToPng', path: '/to-png', icon: '⇩', color: '#27b51c', keywords: 'png image', label: (m) => m.tools.pdfToPng, description: (m) => m.toPng.subtitle },
  { id: 'unlock', path: '/unlock', icon: '🔓', color: '#333333', keywords: 'password mot de passe déverrouiller', label: (m) => m.tools.unlock, description: (m) => m.unlockPdf.subtitle },
  { id: 'crop', path: '/crop', icon: '⌗', color: '#333333', keywords: 'rogner recadrer crop marges', label: (m) => m.tools.crop, description: (m) => m.cropPdf.subtitle },
  { id: 'watermark', path: '/watermark', icon: 'W', color: '#0ea5e9', label: (m) => m.tools.watermark, description: (m) => m.watermark.subtitle },
  { id: 'pageNumbers', path: '/page-numbers', icon: '#', color: '#6366f1', keywords: 'numéroter pagination page numbers', label: (m) => m.tools.pageNumbers, description: (m) => m.numberPages.subtitle },
  { id: 'excelToPdf', path: '/excel-to-pdf', icon: 'X', color: '#18a957', keywords: 'excel xlsx office', label: (m) => m.tools.excelToPdf, description: (m) => m.convert.excelToPdfDesc },
  { id: 'pdfToPpt', path: '/pdf-to-ppt', icon: 'P', color: '#f05b43', keywords: 'powerpoint pptx office', label: (m) => m.tools.pdfToPpt, description: (m) => m.convert.pdfToPptDesc },
  { id: 'pptToPdf', path: '/ppt-to-pdf', icon: 'P', color: '#f05b43', keywords: 'powerpoint pptx office', label: (m) => m.tools.pptToPdf, description: (m) => m.convert.pptToPdfDesc },
  { id: 'pdfToText', path: '/pdf-to-text', icon: 'TXT', color: '#2684ff', keywords: 'texte txt extract', label: (m) => m.tools.pdfToText, description: (m) => m.toText.subtitle },
  { id: 'imagesToPdf', path: '/jpg-to-pdf', icon: 'IMG', color: '#ef5b45', keywords: 'images photos', label: (m) => m.tools.imagesToPdf, description: (m) => m.jpgToPdf.subtitle },
  { id: 'htmlToPdf', path: '/html-to-pdf', icon: '</>', color: '#7c5cff', keywords: 'html web page', label: (m) => m.tools.htmlToPdf, description: (m) => m.htmlPdf.subtitle },
  { id: 'extractPages', path: '/extract-pages', icon: '▤', color: '#0f766e', keywords: 'extract pages extraire pages', label: (m) => m.tools.extractPages, description: (m) => m.extractPages.subtitle },
  { id: 'extractImages', path: '/extract-images', icon: '🖼', color: '#7c3aed', keywords: 'extract images extraire images', label: (m) => m.tools.extractImages, description: (m) => m.extractImages.subtitle },
  { id: 'flatten', path: '/flatten', icon: '▣', color: '#334155', keywords: 'flatten aplatir formulaire', label: (m) => m.tools.flatten, description: (m) => m.flattenPdf.subtitle },
  { id: 'headerFooter', path: '/header-footer', icon: 'HF', color: '#0369a1', keywords: 'header footer en-tête pied', label: (m) => m.tools.headerFooter, description: (m) => m.headerFooter.subtitle },
  { id: 'fillForm', path: '/fill-form', icon: '☑', color: '#15803d', keywords: 'form formulaire fill cerfa', label: (m) => m.tools.fillForm, description: (m) => m.fillForm.subtitle },
  { id: 'heicToPdf', path: '/heic-to-pdf', icon: 'HEIC', color: '#c2410c', keywords: 'heic heif iphone photo', label: (m) => m.tools.heicToPdf, description: (m) => m.heicToPdf.subtitle }
];

export const INDEXABLE_TOOL_PATHS = [...new Set(
  TOOL_CATALOG.filter((tool) => tool.indexable !== false).map((tool) => tool.path)
)];

export function catalogEntries(m: Messages) {
  return TOOL_CATALOG.map((tool) => ({
    id: tool.id,
    path: tool.path,
    icon: tool.icon,
    color: tool.color,
    keywords: tool.keywords ?? '',
    label: tool.label(m),
    description: tool.description(m)
  }));
}

export function catalogLinks(locale: UrlLocale, m: Messages) {
  return catalogEntries(m).map((tool) => ({
    href: localizedPath(tool.path, locale),
    label: tool.label,
    description: tool.description
  }));
}
