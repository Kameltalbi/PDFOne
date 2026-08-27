import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import type { FeatureCopy } from '../i18n/types';
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
      <section className="studio-features">
        {features.map((feature) => (
          <article key={feature.title}>
            <span className={`studio-feature-icon ${feature.tone}`}>{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>
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
