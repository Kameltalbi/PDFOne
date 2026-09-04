import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import './Studio.css';

const RELATED: Record<string, string[]> = {
  '/compress': ['/merge', '/split', '/pdf-to-word', '/protect'],
  '/merge': ['/split', '/compress', '/pdf-to-word', '/page-numbers'],
  '/split': ['/merge', '/delete-pages', '/compress'],
  '/pdf-to-word': ['/word-to-pdf', '/compress', '/merge', '/pdf-to-excel'],
  '/word-to-pdf': ['/pdf-to-word', '/compress', '/merge'],
  '/pdf-to-excel': ['/excel-to-pdf', '/pdf-to-word', '/compress'],
  '/excel-to-pdf': ['/pdf-to-excel', '/word-to-pdf', '/compress'],
  '/pdf-to-ppt': ['/ppt-to-pdf', '/pdf-to-word', '/compress'],
  '/ppt-to-pdf': ['/pdf-to-ppt', '/word-to-pdf', '/compress'],
  '/to-jpg': ['/jpg-to-pdf', '/compress', '/to-png'],
  '/jpg-to-pdf': ['/to-jpg', '/merge', '/compress'],
  '/to-png': ['/to-jpg', '/png-to-pdf', '/compress'],
  '/png-to-pdf': ['/jpg-to-pdf', '/merge', '/compress'],
  '/protect': ['/unlock', '/compress', '/watermark'],
  '/unlock': ['/protect', '/compress', '/ocr'],
  '/edit-pdf': ['/fill-sign-pdf', '/sign', '/watermark'],
  '/sign': ['/fill-sign-pdf', '/edit-pdf', '/protect'],
  '/watermark': ['/page-numbers', '/protect', '/compress'],
  '/page-numbers': ['/merge', '/watermark', '/rotate'],
  '/rotate': ['/crop', '/delete-pages', '/compress'],
  '/crop': ['/rotate', '/compress', '/to-jpg'],
  '/delete-pages': ['/split', '/reorder', '/compress'],
  '/reorder': ['/delete-pages', '/merge', '/rotate'],
  '/ocr': ['/pdf-to-word', '/pdf-to-text', '/compress'],
  '/pdf-to-text': ['/ocr', '/pdf-to-word', '/summarize'],
  '/html-to-pdf': ['/word-to-pdf', '/heic-to-pdf', '/compress', '/merge'],
  '/summarize': ['/pdf-to-text', '/translate', '/pdf-to-word'],
  '/translate': ['/summarize', '/pdf-to-word', '/ocr'],
  '/extract-pages': ['/split', '/delete-pages', '/extract-images'],
  '/extract-images': ['/to-jpg', '/extract-pages', '/compress'],
  '/flatten': ['/fill-form', '/protect', '/compress'],
  '/header-footer': ['/page-numbers', '/watermark', '/compress'],
  '/fill-form': ['/fill-sign-pdf', '/flatten', '/sign'],
  '/fill-sign-pdf': ['/fill-form', '/sign', '/edit-pdf'],
  '/heic-to-pdf': ['/jpg-to-pdf', '/compress', '/merge']
};

const ALIAS: Record<string, string> = {
  '/pdf-to-pptx': '/pdf-to-ppt',
  '/pptx-to-pdf': '/ppt-to-pdf',
  '/png-to-pdf': '/jpg-to-pdf',
  '/edit-pdf/result': '/edit-pdf'
};

export function RelatedTools() {
  const { pathname } = useLocation();
  const { m } = useI18n();
  const path = ALIAS[pathname] ?? pathname;
  const links = RELATED[path];
  if (!links?.length) return null;

  const labels: Record<string, string> = {
    '/compress': m.tools.compress,
    '/merge': m.tools.merge,
    '/split': m.tools.split,
    '/pdf-to-word': m.tools.pdfToWord,
    '/word-to-pdf': m.tools.wordToPdf,
    '/pdf-to-excel': m.tools.pdfToExcel,
    '/excel-to-pdf': m.tools.excelToPdf,
    '/pdf-to-ppt': m.tools.pdfToPpt,
    '/ppt-to-pdf': m.tools.pptToPdf,
    '/to-jpg': m.tools.pdfToJpg,
    '/jpg-to-pdf': m.tools.jpgToPdf,
    '/to-png': m.tools.pdfToPng,
    '/png-to-pdf': m.tools.pngToPdf,
    '/protect': m.tools.protect,
    '/unlock': m.tools.unlock,
    '/edit-pdf': m.tools.edit,
    '/sign': m.tools.sign,
    '/watermark': m.tools.watermark,
    '/page-numbers': m.tools.pageNumbers,
    '/rotate': m.tools.rotate,
    '/crop': m.tools.crop,
    '/delete-pages': m.tools.deletePages,
    '/reorder': m.tools.reorderPages,
    '/ocr': m.tools.ocr,
    '/pdf-to-text': m.tools.pdfToText,
    '/html-to-pdf': m.tools.htmlToPdf,
    '/summarize': m.tools.summarize,
    '/translate': m.tools.translate,
    '/extract-pages': m.tools.extractPages,
    '/extract-images': m.tools.extractImages,
    '/flatten': m.tools.flatten,
    '/header-footer': m.tools.headerFooter,
    '/fill-form': m.tools.fillForm,
    '/fill-sign-pdf': m.tools.fillSign,
    '/heic-to-pdf': m.tools.heicToPdf
  };

  return (
    <nav className="studio-related" aria-label={m.common.relatedTools}>
      <h2>{m.common.relatedTools}</h2>
      <ul>
        {links.map((to) => (
          <li key={to}>
            <Link to={to}>{labels[to] ?? to}</Link>
          </li>
        ))}
        <li>
          <Link to="/tools">{m.nav.allTools}</Link>
        </li>
      </ul>
    </nav>
  );
}
