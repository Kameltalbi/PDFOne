import { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import './EditResult.css';

type ResultState = { downloadUrl: string; filename: string; originalName: string };

const nextTools = [
  { name: 'Modifier PDF', icon: 'T', path: '/edit-pdf' },
  { name: 'Compresser PDF', icon: '⇊', path: '/compress' },
  { name: 'Fusionner PDF', icon: '⇄', path: '/merge' },
  { name: 'PDF en Word', icon: 'W', path: '/pdf-to-word' },
  { name: 'Protéger PDF', icon: '✓', path: '/protect' },
  { name: 'PDF en JPG', icon: 'JPG', path: '/to-jpg' }
];

function EditResult() {
  const location = useLocation();
  const state = location.state as ResultState | null;

  useEffect(() => () => {
    if (state?.downloadUrl) URL.revokeObjectURL(state.downloadUrl);
  }, [state?.downloadUrl]);

  if (!state?.downloadUrl) return <Navigate to="/edit-pdf" replace />;

  return <main className="result-page">
    <section className="result-heading">
      <span className="result-check">✓</span>
      <div><h1>Votre PDF est prêt !</h1><p>Le fichier « {state.originalName} » a été modifié avec succès.</p></div>
    </section>

    <section className="result-layout">
      <div className="result-preview-column">
        <div className="result-preview"><iframe src={`${state.downloadUrl}#toolbar=0&navpanes=0&scrollbar=0`} title="Aperçu du PDF modifié" /></div>
        <div className="result-file"><span>PDF</span><div><strong>{state.filename}</strong><small>Document modifié</small></div></div>
      </div>

      <div className="result-actions-column">
        <a className="result-download" href={state.downloadUrl} download={state.filename}><span>⇩</span> Télécharger le PDF</a>
        <div className="result-success-card"><span>✓</span><div><strong>Traitement terminé</strong><p>Votre document est prêt. Le fichier temporaire sera supprimé lorsque vous quitterez cette page.</p></div></div>
        <div className="result-next-heading"><span>Continuer avec un autre outil</span><Link to="/edit-pdf">↻ Recommencer</Link></div>
        <div className="result-tools">{nextTools.map((tool) => <Link key={tool.name} to={tool.path}><span>{tool.icon}</span><strong>{tool.name}</strong></Link>)}</div>
        <Link to="/tools" className="result-all-tools">Voir tous les outils PDF <span>→</span></Link>
      </div>
    </section>
  </main>;
}

export default EditResult;
