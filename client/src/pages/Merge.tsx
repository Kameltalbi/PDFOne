import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { postForm } from '../lib/api';
import { useBilling } from '../lib/billing';
import { maxFileBytes, maxFileLabel } from '../lib/limits';
import { inspectPdfFile } from '../lib/pdfPreview';
import { useUpgrade } from '../lib/upgrade';
import { useI18n } from '../i18n';
import { faqPageJsonLd, pageUrl, useJsonLd } from '../lib/jsonLd';
import { usePageSeo } from '../lib/usePageSeo';
import { RelatedTools } from '../components/RelatedTools';
import { StudioProcessing, StudioResult } from '../components/PdfStudio';
import { trackFileUpload } from '../lib/analytics';
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

function thumbIndexAt(clientX: number, clientY: number, skipId?: string | null) {
  const nodes = document.querySelectorAll<HTMLElement>('[data-merge-index]');
  for (const node of nodes) {
    if (skipId && node.dataset.mergeId === skipId) continue;
    const rect = node.getBoundingClientRect();
    if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
      return Number(node.dataset.mergeIndex);
    }
  }
  return null;
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
  const faqJsonLd = useMemo(
    () => (m.merge.faq?.length ? faqPageJsonLd(m.merge.faq, pageUrl('/merge')) : null),
    [m.merge.faq]
  );
  useJsonLd('one2pdf-faq-merge', faqJsonLd);
  const { status } = useBilling();
  const { allowFiles } = useUpgrade();
  const maxBytes = maxFileBytes(status.paid);
  const sizeLabel = maxFileLabel(status.paid);
  const pickerId = useId();
  const addPickerId = useId();
  const [items, setItems] = useState<MergeItem[]>([]);
  const [pageNumbers, setPageNumbers] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [heldId, setHeldId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const pointerRef = useRef<{ itemId: string; from: number; x: number; y: number; dragging: boolean; pointerId: number } | null>(null);
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

    const accepted = allowFiles(incoming);
    if (accepted.length === 0) return;

    setIsLoading(true);
    setError(null);
    const prepared: MergeItem[] = [];
    try {
      for (const file of accepted) {
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
      if (prepared.length > 0) trackFileUpload(prepared[0].file);
    } finally {
      setIsLoading(false);
    }
  }, [allowFiles, m, maxBytes, sizeLabel, t]);

  const moveItem = (from: number, to: number) => {
    setItems((current) => {
      if (from === to || from < 0 || to < 0 || from >= current.length || to >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const heldIdRef = useRef<string | null>(null);

  const clearHold = () => {
    pointerRef.current = null;
    heldIdRef.current = null;
    setHeldId(null);
    setDropIndex(null);
  };

  const placeHeldAt = (to: number) => {
    const id = heldIdRef.current;
    if (!id) return;
    setItems((current) => {
      const from = current.findIndex((item) => item.id === id);
      if (from === to || from < 0 || to < 0 || to >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    clearHold();
  };

  const pickItem = (id: string) => {
    heldIdRef.current = id;
    setHeldId(id);
  };

  useEffect(() => {
    if (!heldId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') clearHold();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [heldId]);

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
    clearHold();
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
      <StudioResult
        title={m.merge.mergedTitle}
        text={m.merge.mergedText}
        downloadUrl={downloadUrl}
        downloadName="fusion.pdf"
        resetLabel={m.merge.mergeMore}
        onReset={reset}
        previewSrc={items[0]?.thumb}
        sourceName={items[0]?.name}
      />
    );
  }

  if (isProcessing) {
    return <StudioProcessing label={m.merge.merging} progress={progress} onCancel={reset} />;
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
        {m.merge.howSteps && m.merge.howSteps.length > 0 && (
          <section className="studio-how" aria-labelledby="merge-how-title">
            <h2 id="merge-how-title">{m.merge.howTitle}</h2>
            <ol>
              {m.merge.howSteps.map((step, index) => (
                <li key={step}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        )}
        <section className="merge-seo">
          <h2>{m.merge.seoH2}</h2>
          <p>{m.merge.seoP1}</p>
          <p>{m.merge.seoP2}</p>
          <p>{m.merge.seoP3}</p>
        </section>
        {m.merge.faq && m.merge.faq.length > 0 && (
          <section className="studio-faq" aria-labelledby="merge-faq-title">
            <h2 id="merge-faq-title">{m.merge.faqTitle}</h2>
            {m.merge.faq.map((item) => (
              <article key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </section>
        )}
        <RelatedTools />
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
          className={`merge-canvas ${isDraggingFiles ? 'dropping' : ''}${heldId ? ' holding' : ''}`}
          onDragOver={(event) => {
            event.preventDefault();
            if (Array.from(event.dataTransfer.types).includes('Files')) setIsDraggingFiles(true);
          }}
          onDragLeave={() => setIsDraggingFiles(false)}
          onDrop={onDropFiles}
          onPointerDown={(event) => {
            if (heldId && event.target === event.currentTarget) clearHold();
          }}
        >
          <div className="merge-canvas-tools">
            <button type="button" className="merge-sort" onClick={() => { clearHold(); setItems((current) => [...current].sort((a, b) => a.name.localeCompare(b.name, locale))); }} title={m.merge.sort}>
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
                data-merge-index={index}
                data-merge-id={item.id}
                className={`merge-thumb${heldId === item.id ? ' held' : ''}${heldId && dropIndex === index && heldId !== item.id ? ' drop-ready' : ''}`}
                onPointerDown={(event) => {
                  if ((event.target as HTMLElement).closest('button')) return;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  pointerRef.current = { itemId: item.id, from: index, x: event.clientX, y: event.clientY, dragging: false, pointerId: event.pointerId };
                }}
                onPointerMove={(event) => {
                  const start = pointerRef.current;
                  if (!start || start.itemId !== item.id) return;
                  const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y);
                  if (!start.dragging && moved > 14) {
                    start.dragging = true;
                    pickItem(item.id);
                  }
                  if (start.dragging) {
                    setDropIndex(thumbIndexAt(event.clientX, event.clientY, item.id));
                  }
                }}
                onPointerUp={(event) => {
                  const start = pointerRef.current;
                  pointerRef.current = null;
                  setDropIndex(null);
                  if (!start || start.itemId !== item.id) return;
                  if (start.dragging) {
                    const target = thumbIndexAt(event.clientX, event.clientY, start.itemId);
                    if (target !== null) {
                      moveItem(start.from, target);
                    }
                    clearHold();
                    return;
                  }
                  if (heldIdRef.current === item.id) {
                    clearHold();
                    return;
                  }
                  if (heldIdRef.current) {
                    placeHeldAt(index);
                    return;
                  }
                  pickItem(item.id);
                }}
                onPointerCancel={clearHold}
              >
                <div className="merge-thumb-sheet">
                  <span className="merge-order">{index + 1}</span>
                  <button
                    type="button"
                    className="merge-remove"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => {
                      setItems((current) => current.filter((entry) => entry.id !== item.id));
                      if (heldIdRef.current === item.id) clearHold();
                    }}
                    aria-label={t(m.merge.remove, { name: item.name })}
                  >
                    ×
                  </button>
                  {item.thumb ? <img src={item.thumb} alt="" draggable={false} /> : <div className="merge-thumb-fallback">PDF</div>}
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
            <p>{heldId ? m.merge.placeHint : m.merge.tip}</p>
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
