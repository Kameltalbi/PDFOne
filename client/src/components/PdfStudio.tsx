import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import type { FeatureCopy } from '../i18n/types';
import { AdBanner } from './AdBanner';
import { RelatedTools } from './RelatedTools';
import './Studio.css';

type LandingProps = {
  title: string;
  subtitle: string;
  pickerId: string;
  isDragging: boolean;
  isLoading: boolean;
  error: string | null;
  features: FeatureCopy[];
  multiple?: boolean;
  accept?: string;
  selectLabel?: string;
  children?: ReactNode;
  seo?: {
    h2: string;
    paragraphs: string[];
    faqTitle?: string;
    faq?: { question: string; answer: string }[];
  };
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent) => void;
  onFiles: (files: FileList) => void;
};

export function StudioLanding({
  title,
  subtitle,
  pickerId,
  isDragging,
  isLoading,
  error,
  features,
  multiple = false,
  accept = 'application/pdf,.pdf',
  selectLabel,
  children,
  seo,
  onDragOver,
  onDragLeave,
  onDrop,
  onFiles
}: LandingProps) {
  const { m } = useI18n();
  return (
    <div
      className={`studio-landing ${isDragging ? 'dropping' : ''}`}
      onDragOver={(event) => { event.preventDefault(); onDragOver(); }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <h1>
        {title}
        <span className="studio-star" aria-hidden="true">☆</span>
      </h1>
      <p className="studio-subtitle">{subtitle}</p>
      <label htmlFor={pickerId} className="studio-select">
        <b>+</b>
        <span>{selectLabel ?? m.merge.selectFiles}</span>
        <i />
      </label>
      <input
        id={pickerId}
        type="file"
        accept={accept}
        multiple={multiple}
        className="studio-file-input"
        onChange={(event) => {
          if (event.target.files) onFiles(event.target.files);
          event.target.value = '';
        }}
      />
      <p className="studio-or">{isLoading ? m.merge.preparing : m.merge.orDrop}</p>
      {children}
      {error && <p className="studio-error">{error}</p>}
      <AdBanner />
      <section className="studio-features">
        {features.map((feature) => (
          <article key={feature.title}>
            <span className={`studio-feature-icon ${feature.tone}`}>{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>
      {seo && (
        <section className="studio-seo">
          <h2>{seo.h2}</h2>
          {seo.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </section>
      )}
      {seo?.faq && seo.faq.length > 0 && (
        <section className="studio-faq" aria-labelledby="studio-faq-title">
          <h2 id="studio-faq-title">{seo.faqTitle}</h2>
          {seo.faq.map((item) => (
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

export function StudioResult({
  title,
  text,
  downloadUrl,
  downloadName,
  downloadLabel,
  resetLabel,
  onReset
}: {
  title: string;
  text: string;
  downloadUrl: string;
  downloadName: string;
  downloadLabel?: string;
  resetLabel: string;
  onReset: () => void;
}) {
  const { m } = useI18n();
  return (
    <div className="studio-landing">
      <div className="studio-result">
        <div className="studio-result-icon">✓</div>
        <h1>{title}</h1>
        <p>{text}</p>
        <a className="studio-download" href={downloadUrl} download={downloadName}>{downloadLabel ?? m.common.downloadPdf}</a>
        <button className="studio-reset" onClick={onReset} type="button">{resetLabel}</button>
        <AdBanner />
      </div>
    </div>
  );
}

export function StudioWorkspace({
  canvas,
  sidebar,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop
}: {
  canvas: ReactNode;
  sidebar: ReactNode;
  isDragging?: boolean;
  onDragOver?: () => void;
  onDragLeave?: () => void;
  onDrop?: (event: React.DragEvent) => void;
}) {
  return (
    <div className="studio-workspace">
      <section
        className={`studio-canvas ${isDragging ? 'dropping' : ''}`}
        onDragOver={onDragOver ? (event) => { event.preventDefault(); onDragOver(); } : undefined}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {canvas}
      </section>
      <aside className="studio-sidebar">{sidebar}</aside>
    </div>
  );
}

export function StudioSidebarFrame({
  title,
  tip,
  error,
  progress,
  isProcessing,
  actionLabel,
  onAction,
  disabled,
  onChangeFile,
  children
}: {
  title: string;
  tip: string;
  error: string | null;
  progress: number;
  isProcessing: boolean;
  actionLabel: string;
  onAction: () => void;
  disabled: boolean;
  onChangeFile: () => void;
  children?: ReactNode;
}) {
  const { m } = useI18n();
  return (
    <>
      <Link to="/tools" className="studio-back">{m.merge.backTools}</Link>
      <h2>{title}</h2>
      <div className="studio-tip">{tip}</div>
      {children}
      {error && <p className="studio-error">{error}</p>}
      {isProcessing && (
        <div className="studio-progress">
          <div style={{ width: `${progress}%` }} />
          <span>{progress}%</span>
        </div>
      )}
      <button type="button" className="studio-run" onClick={onAction} disabled={disabled || isProcessing}>
        {actionLabel}
      </button>
      <button type="button" className="studio-change" onClick={onChangeFile}>{m.edit.changeFile}</button>
    </>
  );
}

export function StudioZoom({ setZoom }: { setZoom: (value: number | ((current: number) => number)) => void }) {
  const { m } = useI18n();
  return (
    <div className="studio-canvas-tools">
      <button type="button" onClick={() => setZoom((value) => Math.max(0.7, value - 0.15))} title={m.merge.zoomOut}>−</button>
      <button type="button" onClick={() => setZoom((value) => Math.min(1.35, value + 0.15))} title={m.merge.zoomIn}>+</button>
    </div>
  );
}

export function StudioDocumentCanvas({
  thumbs,
  isLoading = false,
  zoom,
  setZoom,
  fileName,
  pageCount: reportedPages,
  rotations,
  toolbar,
  overlay,
  activePage,
  onActivePageChange
}: {
  thumbs: string[];
  isLoading?: boolean;
  zoom: number;
  setZoom: (value: number | ((current: number) => number)) => void;
  fileName?: string;
  pageCount?: number;
  rotations?: number[];
  toolbar?: ReactNode;
  overlay?: ReactNode;
  activePage?: number;
  onActivePageChange?: (index: number) => void;
}) {
  const { m, t } = useI18n();
  const [internalActive, setInternalActive] = useState(0);
  const previewCount = thumbs.length;
  const pageCount = reportedPages || previewCount;

  useEffect(() => {
    setInternalActive((index) => (previewCount ? Math.min(index, previewCount - 1) : 0));
  }, [previewCount]);

  const setActive = (index: number) => {
    const next = previewCount ? Math.min(Math.max(0, index), previewCount - 1) : 0;
    setInternalActive(next);
    onActivePageChange?.(next);
  };

  const active = activePage ?? internalActive;
  const deg = rotations?.[active] || 0;
  const src = thumbs[active];
  const page = active + 1;
  const pageLabel = pageCount > 0
    ? `${pageCount} ${pageCount > 1 ? m.common.pages : m.common.page}`
    : null;

  return (
    <>
      <StudioZoom setZoom={setZoom} />
      {isLoading && previewCount === 0 ? (
        <p className="studio-or">{m.merge.preparing}</p>
      ) : (
        <>
          <div className="studio-preview" style={{ ['--preview-scale' as string]: String(zoom) }}>
            {toolbar}
            {src ? (
              <div className={`studio-preview-frame deg-${deg}`}>
                {deg !== 0 && <span className="studio-angle">{deg}°</span>}
                <div className="studio-preview-sheet">
                  <img src={src} alt={t(m.split.pageAlt, { page })} style={deg ? { transform: `rotate(${deg}deg)` } : undefined} />
                  {overlay}
                </div>
              </div>
            ) : (
              <div className="studio-thumb-fallback studio-preview-fallback">{fileName || 'PDF'}</div>
            )}
            {previewCount > 1 && (
              <div className="studio-pager">
                <button type="button" disabled={active <= 0} onClick={() => setActive(active - 1)}>‹</button>
                <span>{t(m.rotatePdf.pageOf, { page, count: previewCount })}</span>
                <button type="button" disabled={active >= previewCount - 1} onClick={() => setActive(active + 1)}>›</button>
              </div>
            )}
            {fileName && <p className="studio-preview-name">{fileName}</p>}
            {pageLabel && <p className="studio-preview-meta">{pageLabel}</p>}
          </div>
          {previewCount > 1 && (
            <div className="studio-thumbs" style={{ ['--thumb-scale' as string]: String(zoom) }}>
              {thumbs.map((thumb, index) => {
                const thumbPage = index + 1;
                const thumbDeg = rotations?.[index] || 0;
                return (
                  <article
                    key={thumbPage}
                    className={`studio-thumb clickable${index === active ? ' selected' : ''}`}
                    onClick={() => setActive(index)}
                  >
                    <span className="studio-order">{thumbPage}</span>
                    {thumbDeg !== 0 && <span className="studio-angle">{thumbDeg}°</span>}
                    <img
                      className={thumbDeg ? 'rotated' : undefined}
                      src={thumb}
                      alt={t(m.split.pageAlt, { page: thumbPage })}
                      style={thumbDeg ? { transform: `rotate(${thumbDeg}deg)` } : undefined}
                    />
                    <small>{t(m.split.pageAlt, { page: thumbPage })}</small>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
}
