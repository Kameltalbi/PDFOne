import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useI18n } from '../i18n';
import './ToolPage.css';

type ToolPageProps = {
  title: string;
  description: string;
  current: string;
  children: ReactNode;
};

export function ToolPage({ title, description, current, children }: ToolPageProps) {
  const { m } = useI18n();
  return (
    <div className="tool-page">
      <div className="tool-container">
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">{m.common.home}</Link>
          <span className="separator">›</span>
          <Link to="/tools" className="breadcrumb-link">{m.common.tools}</Link>
          <span className="separator">›</span>
          <span className="current">{current}</span>
        </div>
        <div className="tool-header">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <main className="tool-content">{children}</main>
      </div>
    </div>
  );
}

export function ToolProgress({ progress }: { progress: number }) {
  const { m, t } = useI18n();
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="progress-text">{t(m.common.progressDone, { progress })}</p>
    </div>
  );
}

export function ToolError({ message }: { message: string }) {
  return <div className="error-message">{message}</div>;
}

export function ToolButton({
  children,
  onClick,
  disabled
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="tool-actions">
      <button onClick={onClick} disabled={disabled} className="tool-button">
        {children}
      </button>
    </div>
  );
}

export function ToolSuccess({
  title,
  description,
  downloadUrl,
  downloadName,
  resetLabel,
  onReset
}: {
  title: string;
  description: string;
  downloadUrl: string;
  downloadName: string;
  resetLabel: string;
  onReset: () => void;
}) {
  const { m } = useI18n();
  return (
    <div className="success-container">
      <div className="success-icon">✓</div>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="download-actions">
        <a href={downloadUrl} download={downloadName} className="download-button">
          {m.common.download}
        </a>
        <button onClick={onReset} className="reset-button">{resetLabel}</button>
      </div>
    </div>
  );
}
