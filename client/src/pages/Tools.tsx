import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { usePageSeo } from '../lib/usePageSeo';
import './Tools.css';

type ToolDef = { id: string; name: string; path?: string; icon: string; color: string; badge?: 'new' | 'soon'; keywords?: string };

function ToolCard({ tool, badgeNew, badgeSoon }: { tool: ToolDef; badgeNew: string; badgeSoon: string }) {
  const badge = tool.badge === 'new' ? badgeNew : tool.badge === 'soon' ? badgeSoon : null;
  const content = <>{badge && <span className={`pdf-tool-badge ${tool.badge === 'new' ? 'new' : ''}`}>{badge}</span>}<span className="pdf-tool-icon" style={{ color: tool.color, borderColor: tool.color }} aria-hidden="true">{tool.icon}</span><span className="pdf-tool-name">{tool.name}</span></>;
  return tool.path ? <Link className="pdf-tool-card" to={tool.path}>{content}</Link> : <div className="pdf-tool-card unavailable" aria-disabled="true">{content}</div>;
}

function Tools() {
  const { m, locale } = useI18n();
  usePageSeo(`${m.tools.catalogTitle} | One2PDF`, m.tools.catalogSubtitle);
  const [query, setQuery] = useState('');

  const popularTools: ToolDef[] = [
    { id: 'edit', name: m.tools.edit, path: '/edit-pdf', icon: '📝', color: '#f59e0b', badge: 'new', keywords: 'edit text draw éditer' },
    { id: 'compress', name: m.tools.compress, path: '/compress', icon: '⇊', color: '#f05b43' },
    { id: 'merge', name: m.tools.merge, path: '/merge', icon: '📂', color: '#f59e0b' },
    { id: 'pdfToWord', name: m.tools.pdfToWord, path: '/pdf-to-word', icon: 'W', color: '#2684ff', badge: 'new', keywords: 'word docx office libreoffice' },
    { id: 'wordToPdf', name: m.tools.wordToPdf, path: '/word-to-pdf', icon: 'W', color: '#2684ff', badge: 'new', keywords: 'word docx office libreoffice' },
    { id: 'pdfToJpg', name: m.tools.pdfToJpg, path: '/to-jpg', icon: 'JPG', color: '#7c5cff' },
    { id: 'jpgToPdf', name: m.tools.jpgToPdf, path: '/jpg-to-pdf', icon: '▧', color: '#7c5cff' },
    { id: 'pdfToExcel', name: m.tools.pdfToExcel, path: '/pdf-to-excel', icon: 'X', color: '#18a957', badge: 'new', keywords: 'excel xlsx office libreoffice' },
    { id: 'protect', name: m.tools.protect, path: '/protect', icon: '✓', color: '#3b82f6' },
    { id: 'split', name: m.tools.split, path: '/split', icon: '✂', color: '#252525' },
    { id: 'rotate', name: m.tools.rotate, path: '/rotate', icon: '↻', color: '#31b524' },
    { id: 'sign', name: m.tools.sign, path: '/sign', icon: '✍', color: '#292929', badge: 'new', keywords: 'signature numérique signer sign digital firma assinatura imza توقيع' },
    { id: 'deletePages', name: m.tools.deletePages, path: '/delete-pages', icon: '🗑', color: '#333333' },
    { id: 'reorderPages', name: m.tools.reorderPages, path: '/reorder', icon: '▦', color: '#f59e0b' }
  ];

  const otherTools: ToolDef[] = [
    { id: 'ocr', name: m.tools.ocr, path: '/ocr', icon: 'OCR', color: '#374151', badge: 'new', keywords: 'ocr scan texte tesseract' },
    { id: 'summarize', name: m.tools.summarize, path: '/summarize', icon: '☷', color: '#54b92f', badge: 'new', keywords: 'résumer summary resume' },
    { id: 'translate', name: m.tools.translate, path: '/translate', icon: 'A文', color: '#ef5b45', badge: 'new', keywords: 'traduire translate traduction' },
    { id: 'pngToPdf', name: m.tools.pngToPdf, path: '/png-to-pdf', icon: 'PNG', color: '#27b51c' },
    { id: 'pdfToPng', name: m.tools.pdfToPng, path: '/to-png', icon: '⇩', color: '#27b51c', badge: 'new', keywords: 'png image' },
    { id: 'unlock', name: m.tools.unlock, path: '/unlock', icon: '🔓', color: '#333333', badge: 'new', keywords: 'password mot de passe déverrouiller' },
    { id: 'crop', name: m.tools.crop, path: '/crop', icon: '⌗', color: '#333333', keywords: 'rogner recadrer crop marges' },
    { id: 'watermark', name: m.tools.watermark, path: '/watermark', icon: 'W', color: '#0ea5e9' },
    { id: 'pageNumbers', name: m.tools.pageNumbers, path: '/page-numbers', icon: '#', color: '#6366f1', keywords: 'numéroter pagination page numbers' },
    { id: 'excelToPdf', name: m.tools.excelToPdf, path: '/excel-to-pdf', icon: 'X', color: '#18a957', badge: 'new', keywords: 'excel xlsx office libreoffice' },
    { id: 'pdfToPpt', name: m.tools.pdfToPpt, path: '/pdf-to-ppt', icon: 'P', color: '#f05b43', badge: 'new', keywords: 'powerpoint pptx office libreoffice' },
    { id: 'pptToPdf', name: m.tools.pptToPdf, path: '/ppt-to-pdf', icon: 'P', color: '#f05b43', badge: 'new', keywords: 'powerpoint pptx office libreoffice' },
    { id: 'pdfToText', name: m.tools.pdfToText, path: '/pdf-to-text', icon: 'TXT', color: '#2684ff', badge: 'new', keywords: 'texte txt extract' },
    { id: 'imagesToPdf', name: m.tools.imagesToPdf, path: '/jpg-to-pdf', icon: 'IMG', color: '#ef5b45' },
    { id: 'htmlToPdf', name: m.tools.htmlToPdf, path: '/html-to-pdf', icon: '</>', color: '#7c5cff', badge: 'new', keywords: 'html web page' },
    { id: 'extractPages', name: m.tools.extractPages, path: '/extract-pages', icon: '▤', color: '#0f766e', badge: 'new', keywords: 'extract pages extraire pages' },
    { id: 'extractImages', name: m.tools.extractImages, path: '/extract-images', icon: '🖼', color: '#7c3aed', badge: 'new', keywords: 'extract images extraire images' },
    { id: 'flatten', name: m.tools.flatten, path: '/flatten', icon: '▣', color: '#334155', badge: 'new', keywords: 'flatten aplatir formulaire' },
    { id: 'headerFooter', name: m.tools.headerFooter, path: '/header-footer', icon: 'HF', color: '#0369a1', badge: 'new', keywords: 'header footer en-tête pied' },
    { id: 'fillForm', name: m.tools.fillForm, path: '/fill-form', icon: '☑', color: '#15803d', badge: 'new', keywords: 'form formulaire fill cerfa' },
    { id: 'heicToPdf', name: m.tools.heicToPdf, path: '/heic-to-pdf', icon: 'HEIC', color: '#c2410c', badge: 'new', keywords: 'heic heif iphone photo' }
  ];

  const normalizedQuery = query.trim().toLocaleLowerCase(locale);
  const filterTools = (tools: ToolDef[]) => tools.filter((tool) => `${tool.name} ${tool.keywords || ''}`.toLocaleLowerCase(locale).includes(normalizedQuery));
  const popular = useMemo(() => filterTools(popularTools), [normalizedQuery, locale, m]);
  const others = useMemo(() => filterTools(otherTools), [normalizedQuery, locale, m]);

  return <main className="pdf-tools-page">
    <section className="pdf-tools-intro">
      <p className="pdf-tools-eyebrow">{m.tools.catalogEyebrow}</p>
      <h1>{m.tools.catalogTitle}</h1>
      <p>{m.tools.catalogSubtitle}</p>
      <label className="pdf-tools-search">
        <span aria-hidden="true">⌕</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={m.tools.searchPlaceholder} aria-label={m.tools.searchAria} />
        {query && <button onClick={() => setQuery('')} aria-label={m.tools.clearSearch}>×</button>}
      </label>
    </section>
    <div className="pdf-tools-content">
      {popular.length > 0 && <section className="pdf-tool-section"><h2>{m.tools.popular}</h2><div className="pdf-tools-grid">{popular.map((tool) => <ToolCard key={tool.id} tool={tool} badgeNew={m.tools.badgeNew} badgeSoon={m.tools.badgeSoon} />)}</div></section>}
      {others.length > 0 && <section className="pdf-tool-section"><h2>{m.tools.others}</h2><div className="pdf-tools-grid">{others.map((tool) => <ToolCard key={tool.id} tool={tool} badgeNew={m.tools.badgeNew} badgeSoon={m.tools.badgeSoon} />)}</div></section>}
      {popular.length + others.length === 0 && <div className="pdf-tools-empty"><span>⌕</span><h2>{m.tools.emptyTitle}</h2><p>{m.tools.emptyText}</p></div>}
    </div>
  </main>;
}

export default Tools;
