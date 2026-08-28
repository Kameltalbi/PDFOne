import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { StudioResult } from '../components/PdfStudio';
import { useI18n } from '../i18n';

type ResultState = { downloadUrl: string; filename: string; originalName: string };

function EditResult() {
  const { m, t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultState | null;

  useEffect(() => () => {
    if (state?.downloadUrl) URL.revokeObjectURL(state.downloadUrl);
  }, [state?.downloadUrl]);

  if (!state?.downloadUrl) return <Navigate to="/edit-pdf" replace />;

  return (
    <StudioResult
      title={m.edit.resultTitle}
      text={t(m.edit.resultText, { name: state.originalName })}
      downloadUrl={state.downloadUrl}
      downloadName={state.filename}
      resetLabel={m.edit.restart}
      onReset={() => navigate('/edit-pdf')}
      sourceName={state.originalName}
    />
  );
}

export default EditResult;
