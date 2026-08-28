import { useCallback, useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { postForm } from '../lib/api';
import { useBilling } from '../lib/billing';
import { maxFileBytes, maxFileLabel } from '../lib/limits';
import { inspectPdfFile } from '../lib/pdfPreview';
import { useI18n } from '../i18n';
import { usePageSeo } from '../lib/usePageSeo';
import './Merge.css';

type MergeItem = {
  id: string;
  file: File;
  name: string;
  pages: number;
  thumb: string | null;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function FeatureGlyph({ index }: { index: number }) {
  const icons = [
    <svg key="merge" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M7 8h11M7 8l3-3M18 8l-3 3M17 16H6M17 16l-3-3M6 16l3 3" /></svg>,
    <svg key="shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>,
    <svg key="up" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M7 11v8h4v-8M11 11V8a2 2 0 0 1 4 0v3h2a2 2 0 0 1 0 4h-2" /><path d="M7 11H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2" /></svg>,
    <svg key="trophy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" /><path d="M8 6H5a2 2 0 0 0 2 4M16 6h3a2 2 0 0 1-2 4M12 13v3M9 20h6" /></svg>,
    <svg key="clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></svg>,
    <svg key="tools" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m14 7 3 3M8 17l-3 3M14.5 3.5 20 9M4 20l5.5-5.5M15 9l-6 6" /></svg>
  ];
  return icons[index] ?? icons[0];
}

function Merge() {
  const { m, t, locale } = useI18n();
  usePageSeo(m.merge.seoTitle, m.merge.seoDescription);
  const { status } = useBilling();
  const maxBytes = maxFileBytes(status.paid);
  const sizeLabel = maxFileLabel(status.paid);
  const pickerId = useId();
  const addPickerId = useId();
  const [items, setItems] = useState<MergeItem[]>([]);
  const [pageNumbers, setPageNumbers] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const studioOpen = items.length > 0 && !downloadUrl;

  useEffect(() => {
    document.body.classList.toggle('merge-studio', studioOpen);
    return () => document.body.classList.remove('merge-studio');
  }, [studioOpen]);

  const addFiles = useCallback(async (list: FileList | File[]) => {
    const incoming = Array.from(list).filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
    if (incoming.length === 0) {
      setError(m.merge.pdfOnly);
      return;
    }

    setIsLoading(true);
    setError(null);
    const prepared: MergeItem[] = [];
    try {
      for (const file of incoming) {
        if (file.size > maxBytes) {
          setError(t(m.common.fileTooLarge, { name: file.name, size: sizeLabel }));
          continue;
        }
        try {
          const info = await inspectPdfFile(file);
          prepared.push({ id: uid(), file, name: file.name, pages: info.pages, thumb: info.thumb });
        } catch {
          prepared.push({ id: uid(), file, name: file.name, pages: 0, thumb: null });
        }
      }
      setItems((current) => [...current, ...prepared].slice(0, 10));
    } finally {
      setIsLoading(false);
    }
  }, [m, maxBytes, sizeLabel, t]);

  const moveItem = (from: number, to: number) => {
    setItems((current) => {
      if (from === to || from < 0 || to < 0 || from >= current.length || to >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const handleMerge = async () => {
    if (items.length < 2) {
      setError(m.merge.needTwo);
      return;
    }
    setIsProcessing(true);
    setError(null);
    setProgress(25);
    try {
      const formData = new FormData();
      items.forEach((item) => formData.append('files', item.file));
      formData.append('order', JSON.stringify(items.map((_, index) => index)));
      formData.append('pageNumbers', String(pageNumbers));
      setProgress(65);
      const result = await postForm('/api/merge', formData);
      setProgress(100);
      setDownloadUrl(result.downloadUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : m.merge.cannotMerge);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setItems([]);
    setDownloadUrl(null);
    setError(null);
    setProgress(0);
    setPageNumbers(false);
  };

  const onDropFiles = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDraggingFiles(false);
    if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
  };

  if (downloadUrl) {
    return (
      <div className="merge-landing">
        <div className="merge-result">
          <div className="merge-result-icon">✓</div>
          <h1>{m.merge.mergedTitle}</h1>
          <p>{m.merge.mergedText}</p>
          <a className="merge-download" href={downloadUrl} download="fusion.pdf">{m.common.downloadPdf}</a>
          <button className="merge-reset" onClick={reset} type="button">{m.merge.mergeMore}</button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className={`merge-landing ${isDraggingFiles ? 'dropping' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setIsDraggingFiles(true); }}
        onDragLeave={() => setIsDraggingFiles(false)}
        onDrop={onDropFiles}
      >
        <h1>
          {m.merge.title}
          <span className="merge-star" aria-hidden="true">☆</span>
        </h1>
        <p className="merge-subtitle">{m.merge.subtitle}</p>
        <label htmlFor={pickerId} className="merge-select">
          <b>+</b>
          <span>{m.merge.selectFiles}</span>
          <i />
        </label>
        <input id={pickerId} type="file" accept="application/pdf,.pdf" multiple className="merge-file-input" onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.target.value = ''; }} />
        <p className="merge-or">{isLoading ? m.merge.preparing : m.merge.orDrop}</p>
        {error && <p className="merge-error">{error}</p>}

        <section className="merge-features">
          {m.merge.features.map((feature, index) => (
            <article key={feature.title}>
              <span className={`merge-feature-icon ${feature.tone}`}><FeatureGlyph index={index} /></span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </section>
        <section className="merge-seo">
          <h2>{m.merge.seoH2}</h2>
          <p>{m.merge.seoP1}</p>
          <p>{m.merge.seoP2}</p>
          <p>{m.merge.seoP3}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="merge-shell">
      <div className="merge-shell-bar">
        <button type="button" className="merge-shell-back" onClick={reset} aria-label={m.merge.back}>←</button>
        <Link to="/" className="merge-shell-logo">
          <img src="/one2pdf-logo.png?v=2" alt={m.brand} />
        </Link>
      </div>

      <div className="merge-workspace">
        <section
          className={`merge-canvas ${isDraggingFiles ? 'dropping' : ''}`}
          onDragOver={(event) => { event.preventDefault(); setIsDraggingFiles(true); }}
          onDragLeave={() => setIsDraggingFiles(false)}
          onDrop={onDropFiles}
        >
          <div className="merge-canvas-tools">
            <button type="button" className="merge-sort" onClick={() => setItems((current) => [...current].sort((a, b) => a.name.localeCompare(b.name, locale)))} title={m.merge.sort}>
              A<span>↕</span>
            </button>
            <div className="merge-zoom">
              <button type="button" onClick={() => setZoom((value) => Math.min(1.35, value + 0.12))} title={m.merge.zoomIn}>+</button>
              <input
                type="range"
                min="0.7"
                max="1.35"
                step="0.05"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                aria-label={m.merge.zoomIn}
              />
              <button type="button" onClick={() => setZoom((value) => Math.max(0.7, value - 0.12))} title={m.merge.zoomOut}>−</button>
            </div>
          </div>

          <div className="merge-thumbs" style={{ ['--thumb-scale' as string]: String(zoom) }}>
            {items.map((item, index) => (
              <article
                key={item.id}
                className={`merge-thumb ${dragIndex === index ? 'dragging' : ''}`}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (dragIndex !== null) moveItem(dragIndex, index);
                  setDragIndex(null);
                }}
                onDragEnd={() => setDragIndex(null)}
              >
                <div className="merge-thumb-sheet">
                  <span className="merge-order">{index + 1}</span>
                  <button type="button" className="merge-remove" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} aria-label={t(m.merge.remove, { name: item.name })}>×</button>
                  {item.thumb ? <img src={item.thumb} alt="" /> : <div className="merge-thumb-fallback">PDF</div>}
                </div>
                <b>{item.name}</b>
                <small>{item.pages} {item.pages > 1 ? m.common.pages : m.common.page}</small>
              </article>
            ))}
          </div>

          <div className="merge-fabs">
            <label htmlFor={addPickerId} className="merge-fab" title={m.merge.addFiles}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M8 3h6l5 5v13H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                <path d="M14 3v6h6" />
                <path d="M12 12v6M9 15h6" />
              </svg>
              <em>{items.length}</em>
            </label>
          </div>
          <input id={addPickerId} type="file" accept="application/pdf,.pdf" multiple className="merge-file-input" onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.target.value = ''; }} />
        </section>

        <aside className="merge-sidebar">
          <h2>{m.merge.title}</h2>
          <div className="merge-tip">
            <span className="merge-tip-i" aria-hidden="true">i</span>
            <p>{m.merge.tip}</p>
          </div>
          <label className="merge-option">
            <input type="checkbox" checked={pageNumbers} onChange={(event) => setPageNumbers(event.target.checked)} />
            {m.merge.pageNumbers}
          </label>
          {error && <p className="merge-error">{error}</p>}
          {isProcessing && (
            <div className="merge-progress">
              <div style={{ width: `${progress}%` }} />
              <span>{progress}%</span>
            </div>
          )}
          <button type="button" className="merge-run" onClick={handleMerge} disabled={isProcessing || items.length < 2}>
            {isProcessing ? m.merge.merging : t(m.merge.mergeCount, { count: items.length })}
          </button>
        </aside>
      </div>
    </div>
  );
}

export default Merge;
