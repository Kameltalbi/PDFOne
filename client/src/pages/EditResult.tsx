import { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import './EditResult.css';

type ResultState = { downloadUrl: string; filename: string; originalName: string };

function EditResult() {
  const { m, t } = useI18n();
  const location = useLocation();
  const state = location.state as ResultState | null;

  const nextTools = [
    { name: m.tools.edit, icon: 'T', path: '/edit-pdf' },
    { name: m.tools.compress, icon: '⇊', path: '/compress' },
    { name: m.tools.merge, icon: '⇄', path: '/merge' },
    { name: m.tools.split, icon: '✂', path: '/split' },
    { name: m.tools.protect, icon: '✓', path: '/protect' },
    { name: m.tools.pdfToJpg, icon: 'JPG', path: '/to-jpg' }
  ];

  useEffect(() => () => {
    if (state?.downloadUrl) URL.revokeObjectURL(state.downloadUrl);
  }, [state?.downloadUrl]);

  if (!state?.downloadUrl) return <Navigate to="/edit-pdf" replace />;

  return <main className="result-page">
    <section className="result-heading">
      <span className="result-check">✓</span>
      <div><h1>{m.edit.resultTitle}</h1><p>{t(m.edit.resultText, { name: state.originalName })}</p></div>
    </section>

    <section className="result-layout">
      <div className="result-preview-column">
        <div className="result-preview"><iframe src={`${state.downloadUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={m.edit.previewAlt} /></div>
        <div className="result-file"><span>PDF</span><div><strong>{state.filename}</strong><small>{m.edit.modifiedDoc}</small></div></div>
      </div>

      <div className="result-actions-column">
        <a className="result-download" href={state.downloadUrl} download={state.filename}><span>⇩</span> {m.common.downloadPdf}</a>
        <div className="result-success-card"><span>✓</span><div><strong>{m.edit.processingDone}</strong><p>{m.edit.processingHint}</p></div></div>
        <div className="result-next-heading"><span>{m.edit.continue}</span><Link to="/edit-pdf">{m.edit.restart}</Link></div>
        <div className="result-tools">{nextTools.map((tool) => <Link key={tool.path} to={tool.path}><span>{tool.icon}</span><strong>{tool.name}</strong></Link>)}</div>
        <Link to="/tools" className="result-all-tools">{m.edit.allPdfTools} <span>→</span></Link>
      </div>
    </section>
  </main>;
}

export default EditResult;
