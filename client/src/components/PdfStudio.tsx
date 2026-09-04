import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import type { FeatureCopy } from '../i18n/types';
import { useBilling } from '../lib/billing';
import { trackFileDownload } from '../lib/analytics';
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
  dropLabel?: string;
  children?: ReactNode;
  seo?: {
    h2: string;
    paragraphs: string[];
    howTitle?: string;
    howSteps?: string[];
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
  dropLabel,
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
      <p className="studio-or">{isLoading ? m.merge.preparing : (dropLabel ?? m.merge.orDrop)}</p>
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
      {seo?.howSteps && seo.howSteps.length > 0 && (
        <section className="studio-how" aria-labelledby="studio-how-title">
          <h2 id="studio-how-title">{seo.howTitle}</h2>
          <ol>
            {seo.howSteps.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {step}
              </li>
            ))}
          </ol>
        </section>
      )}
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

export function StudioProcessing({
  label,
  progress,
  onCancel,
  badge = 'PDF'
}: {
  label: string;
  progress: number;
  onCancel: () => void;
  badge?: string;
}) {
  const { m } = useI18n();
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="studio-processing">
      <div className="studio-processing-ring">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle className="studio-processing-track" cx="60" cy="60" r={radius} />
          <circle
            className="studio-processing-value"
            cx="60"
            cy="60"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className={`studio-processing-doc${badge.length > 1 ? ' is-long' : ''}`} aria-hidden="true">{badge}</span>
      </div>
      <p>
        {label}
        <strong>{clamped} %</strong>
        <button type="button" className="studio-processing-cancel" onClick={onCancel} aria-label={m.common.closeMenu}>×</button>
      </p>
    </div>
  );
}

function resultFileName(sourceName: string | undefined, fallback: string) {
  if (!sourceName) return fallback;
  const base = sourceName.replace(/\.[^.]+$/, '').trim();
  if (!base) return fallback;
  const ext = fallback.includes('.') ? fallback.slice(fallback.lastIndexOf('.')) : '';
  return `${base}${ext}`;
}

export function StudioResult({
  title,
  text,
  downloadUrl,
  downloadName,
  downloadLabel,
  extraDownloadUrl,
  extraDownloadName,
  extraDownloadLabel,
  resetLabel,
  onReset,
  previewSrc,
  sourceName
}: {
  title: string;
  text: string;
  downloadUrl: string;
  downloadName: string;
  downloadLabel?: string;
  extraDownloadUrl?: string;
  extraDownloadName?: string;
  extraDownloadLabel?: string;
  resetLabel: string;
  onReset: () => void;
  previewSrc?: string | null;
  sourceName?: string;
}) {
  const { m } = useI18n();
  const { status } = useBilling();
  const paid = status.paid;
  const [copied, setCopied] = useState(false);
  const trackedDownload = useRef(false);
  const fileName = resultFileName(sourceName, downloadName);
  const ext = (fileName.split('.').pop() || 'FILE').toUpperCase();
  const showSource = Boolean(sourceName && sourceName !== fileName);

  const onDownload = () => {
    if (trackedDownload.current) return;
    trackedDownload.current = true;
    trackFileDownload();
  };

  const copyLink = async () => {
    const absolute = new URL(downloadUrl, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(absolute);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="studio-done" aria-label={title}>
      <div className="studio-done-grid">
        <div className="studio-done-preview">
          <a className="studio-done-sheet" href={downloadUrl} download={fileName} onClick={onDownload}>
            {previewSrc ? (
              <img src={previewSrc} alt={fileName} />
            ) : (
              <div className="studio-done-placeholder" aria-hidden="true">
                <span className="studio-done-fold" />
                <b>{ext}</b>
                <i /><i /><i />
              </div>
            )}
            <span className="studio-done-ext">{ext}</span>
          </a>
          <div className="studio-done-file">
            <span>{ext}</span>
            <div>
              <strong title={fileName}>{fileName}</strong>
              {showSource && <small title={sourceName}>{sourceName}</small>}
            </div>
          </div>
        </div>

        <div className="studio-done-actions">
          <h1 className="studio-done-kicker">
            <span className="studio-done-check">✓</span>
            {m.common.doneShort}
          </h1>
          <p className="studio-done-text">{text}</p>

          <div className="studio-done-row">
            <a className="studio-done-download" href={downloadUrl} download={fileName} onClick={onDownload}>
              <span aria-hidden="true">⇩</span>
              {downloadLabel ?? m.common.download}
            </a>
            <button type="button" className="studio-done-icon" onClick={() => void copyLink()} title={copied ? m.common.linkCopied : m.common.copyLink}>
              {copied ? '✓' : '🔗'}
            </button>
            <button type="button" className="studio-done-icon" onClick={onReset} title={m.common.deleteResult}>
              🗑
            </button>
          </div>

          {extraDownloadUrl && extraDownloadLabel && (
            <a
              className="studio-done-secondary"
              href={extraDownloadUrl}
              download={extraDownloadName || 'traduction.txt'}
              onClick={onDownload}
            >
              {extraDownloadLabel}
            </a>
          )}

          {!paid && (
            <Link className="studio-done-pro" to="/pricing">
              <div>
                <strong>One2PDF Pro</strong>
                <ul>
                  {m.pricing.monthIncludes.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <span>{m.pricing.monthCta}</span>
            </Link>
          )}

          <button type="button" className="studio-done-restart" onClick={onReset}>
            ↻ {resetLabel}
          </button>
        </div>
      </div>
      <RelatedTools />
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
