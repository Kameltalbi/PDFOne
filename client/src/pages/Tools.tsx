import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { usePageSeo } from '../lib/usePageSeo';
import './Tools.css';

type ToolDef = { id: string; name: string; path?: string; icon: string; color: string; keywords?: string };

function ToolCard({ tool }: { tool: ToolDef }) {
  const content = (
    <>
      <span className="pdf-tool-icon" style={{ color: tool.color, borderColor: tool.color }} aria-hidden="true">{tool.icon}</span>
      <span className="pdf-tool-name">{tool.name}</span>
    </>
  );
  return tool.path
    ? <Link className="pdf-tool-card" to={tool.path}>{content}</Link>
    : <div className="pdf-tool-card unavailable" aria-disabled="true">{content}</div>;
}

function Tools() {
  const { m, locale } = useI18n();
  usePageSeo(`${m.tools.catalogTitle} | One2PDF`, m.tools.catalogSubtitle);
  const [query, setQuery] = useState('');

  const allTools: ToolDef[] = useMemo(() => [
    { id: 'edit', name: m.tools.edit, path: '/edit-pdf', icon: '📝', color: '#f59e0b', keywords: 'edit text draw éditer' },
    { id: 'fillSign', name: m.tools.fillSign, path: '/fill-sign-pdf', icon: '✍', color: '#dc2626', keywords: 'fill sign remplir signer signature formulaire date checkbox' },
    { id: 'compress', name: m.tools.compress, path: '/compress', icon: '⇊', color: '#f05b43' },
    { id: 'merge', name: m.tools.merge, path: '/merge', icon: '📂', color: '#f59e0b' },
    { id: 'pdfToWord', name: m.tools.pdfToWord, path: '/pdf-to-word', icon: 'W', color: '#2684ff', keywords: 'word docx office' },
    { id: 'wordToPdf', name: m.tools.wordToPdf, path: '/word-to-pdf', icon: 'W', color: '#2684ff', keywords: 'word docx office' },
    { id: 'pdfToJpg', name: m.tools.pdfToJpg, path: '/to-jpg', icon: 'JPG', color: '#7c5cff' },
    { id: 'jpgToPdf', name: m.tools.jpgToPdf, path: '/jpg-to-pdf', icon: '▧', color: '#7c5cff' },
    { id: 'pdfToExcel', name: m.tools.pdfToExcel, path: '/pdf-to-excel', icon: 'X', color: '#18a957', keywords: 'excel xlsx office' },
    { id: 'protect', name: m.tools.protect, path: '/protect', icon: '✓', color: '#3b82f6' },
    { id: 'split', name: m.tools.split, path: '/split', icon: '✂', color: '#252525' },
    { id: 'rotate', name: m.tools.rotate, path: '/rotate', icon: '↻', color: '#31b524' },
    { id: 'sign', name: m.tools.sign, path: '/sign', icon: '✍', color: '#292929', keywords: 'signature numérique signer sign digital firma assinatura imza توقيع' },
    { id: 'deletePages', name: m.tools.deletePages, path: '/delete-pages', icon: '🗑', color: '#333333' },
    { id: 'reorderPages', name: m.tools.reorderPages, path: '/reorder', icon: '▦', color: '#f59e0b' },
    { id: 'ocr', name: m.tools.ocr, path: '/ocr', icon: 'OCR', color: '#374151', keywords: 'ocr scan texte tesseract' },
    { id: 'summarize', name: m.tools.summarize, path: '/summarize', icon: '☷', color: '#54b92f', keywords: 'résumer summary resume' },
    { id: 'translate', name: m.tools.translate, path: '/translate', icon: 'A文', color: '#ef5b45', keywords: 'traduire translate traduction' },
    { id: 'pngToPdf', name: m.tools.pngToPdf, path: '/png-to-pdf', icon: 'PNG', color: '#27b51c' },
    { id: 'pdfToPng', name: m.tools.pdfToPng, path: '/to-png', icon: '⇩', color: '#27b51c', keywords: 'png image' },
    { id: 'unlock', name: m.tools.unlock, path: '/unlock', icon: '🔓', color: '#333333', keywords: 'password mot de passe déverrouiller' },
    { id: 'crop', name: m.tools.crop, path: '/crop', icon: '⌗', color: '#333333', keywords: 'rogner recadrer crop marges' },
    { id: 'watermark', name: m.tools.watermark, path: '/watermark', icon: 'W', color: '#0ea5e9' },
    { id: 'pageNumbers', name: m.tools.pageNumbers, path: '/page-numbers', icon: '#', color: '#6366f1', keywords: 'numéroter pagination page numbers' },
    { id: 'excelToPdf', name: m.tools.excelToPdf, path: '/excel-to-pdf', icon: 'X', color: '#18a957', keywords: 'excel xlsx office' },
    { id: 'pdfToPpt', name: m.tools.pdfToPpt, path: '/pdf-to-ppt', icon: 'P', color: '#f05b43', keywords: 'powerpoint pptx office' },
    { id: 'pptToPdf', name: m.tools.pptToPdf, path: '/ppt-to-pdf', icon: 'P', color: '#f05b43', keywords: 'powerpoint pptx office' },
    { id: 'pdfToText', name: m.tools.pdfToText, path: '/pdf-to-text', icon: 'TXT', color: '#2684ff', keywords: 'texte txt extract' },
    { id: 'imagesToPdf', name: m.tools.imagesToPdf, path: '/jpg-to-pdf', icon: 'IMG', color: '#ef5b45' },
    { id: 'htmlToPdf', name: m.tools.htmlToPdf, path: '/html-to-pdf', icon: '</>', color: '#7c5cff', keywords: 'html web page' },
    { id: 'extractPages', name: m.tools.extractPages, path: '/extract-pages', icon: '▤', color: '#0f766e', keywords: 'extract pages extraire pages' },
    { id: 'extractImages', name: m.tools.extractImages, path: '/extract-images', icon: '🖼', color: '#7c3aed', keywords: 'extract images extraire images' },
    { id: 'flatten', name: m.tools.flatten, path: '/flatten', icon: '▣', color: '#334155', keywords: 'flatten aplatir formulaire' },
    { id: 'headerFooter', name: m.tools.headerFooter, path: '/header-footer', icon: 'HF', color: '#0369a1', keywords: 'header footer en-tête pied' },
    { id: 'fillForm', name: m.tools.fillForm, path: '/fill-form', icon: '☑', color: '#15803d', keywords: 'form formulaire fill cerfa' },
    { id: 'heicToPdf', name: m.tools.heicToPdf, path: '/heic-to-pdf', icon: 'HEIC', color: '#c2410c', keywords: 'heic heif iphone photo' }
  ], [m]);

  const normalizedQuery = query.trim().toLocaleLowerCase(locale);
  const tools = useMemo(
    () => allTools.filter((tool) => `${tool.name} ${tool.keywords || ''}`.toLocaleLowerCase(locale).includes(normalizedQuery)),
    [allTools, normalizedQuery, locale]
  );

  return (
    <main className="pdf-tools-page">
      <section className="pdf-tools-intro">
        <p className="pdf-tools-eyebrow">{m.tools.catalogEyebrow}</p>
        <h1>{m.tools.catalogTitle}</h1>
        <p>{m.tools.catalogSubtitle}</p>
        <label className="pdf-tools-search">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={m.tools.searchPlaceholder}
            aria-label={m.tools.searchAria}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label={m.tools.clearSearch}>×</button>
          )}
        </label>
      </section>
      <div className="pdf-tools-content">
        {tools.length > 0 ? (
          <section className="pdf-tool-section">
            <div className="pdf-tools-grid">
              {tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
            </div>
          </section>
        ) : (
          <div className="pdf-tools-empty">
            <span>⌕</span>
            <h2>{m.tools.emptyTitle}</h2>
            <p>{m.tools.emptyText}</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default Tools;
