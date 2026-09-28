import { useLocation } from 'react-router-dom';
import { Navigate, useLocaleNavigate } from '../components/LocaleLink';
import { StudioResult } from '../components/PdfStudio';
import { useI18n } from '../i18n';
import { useRobotsMeta } from '../lib/usePageSeo';

type ResultState = {
  downloadUrl: string;
  filename: string;
  originalName: string;
  previewSrc?: string | null;
};

function EditResult() {
  const { m, t } = useI18n();
  const location = useLocation();
  const navigate = useLocaleNavigate();
  const state = location.state as ResultState | null;
  useRobotsMeta('noindex, nofollow');

  if (!state?.downloadUrl) return <Navigate to="/edit-pdf" replace />;

  const reset = () => {
    URL.revokeObjectURL(state.downloadUrl);
    navigate('/edit-pdf');
  };

  return (
    <StudioResult
      title={m.edit.resultTitle}
      text={t(m.edit.resultText, { name: state.originalName })}
      downloadUrl={state.downloadUrl}
      downloadName={state.filename}
      resetLabel={m.edit.restart}
      onReset={reset}
      previewSrc={state.previewSrc}
      sourceName={state.originalName}
    />
  );
}

export default EditResult;
