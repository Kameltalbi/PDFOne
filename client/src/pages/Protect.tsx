import { useState } from 'react';
import { StudioDocumentCanvas, StudioLanding, StudioResult, StudioSidebarFrame, StudioWorkspace } from '../components/PdfStudio';
import { postForm } from '../lib/api';
import { useSinglePdf } from '../lib/useSinglePdf';
import { landingSeoFrom, usePageSeo } from '../lib/usePageSeo';
import { useI18n } from '../i18n';

function Protect() {
  const { m } = useI18n();
  usePageSeo(m.protect.seoTitle, m.protect.seoDescription);
  const pdf = useSinglePdf({ allPages: false });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleProtect = async () => {
    if (!pdf.file) return;
    if (password.length < 4) { pdf.setError(m.protect.shortPassword); return; }
    if (password !== confirmPassword) { pdf.setError(m.protect.mismatch); return; }

    setIsProcessing(true);
    pdf.setError(null);
    setProgress(20);
    try {
      const formData = new FormData();
      formData.append('file', pdf.file);
      formData.append('password', password);
      setProgress(55);
      const result = await postForm('/api/protect', formData);
      setProgress(100);
      pdf.setDownloadUrl(result.downloadUrl);
    } catch (err) {
      pdf.setError(err instanceof Error ? err.message : m.protect.fail);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    pdf.reset();
    setPassword('');
    setConfirmPassword('');
    setProgress(0);
  };

  if (pdf.downloadUrl) {
    return (
      <StudioResult
        title={m.protect.doneTitle}
        text={m.protect.doneText}
        downloadUrl={pdf.downloadUrl}
        downloadName="protege.pdf"
        resetLabel={m.protect.reset}
        onReset={reset}
      />
    );
  }

  if (!pdf.file) {
    return (
      <StudioLanding
        title={m.protect.title}
        subtitle={m.protect.subtitle}
        pickerId={pdf.pickerId}
        isDragging={pdf.isDragging}
        isLoading={pdf.isLoading}
        error={pdf.error}
        features={m.protect.features}
        seo={landingSeoFrom(m.protect)}
        onDragOver={() => pdf.setIsDragging(true)}
        onDragLeave={() => pdf.setIsDragging(false)}
        onDrop={pdf.onDropFiles}
        onFiles={(files) => void pdf.loadFile(files)}
      />
    );
  }

  return (
    <StudioWorkspace
      canvas={(
        <StudioDocumentCanvas
          thumbs={pdf.thumbs}
          isLoading={pdf.isLoading}
          zoom={pdf.zoom}
          setZoom={pdf.setZoom}
          fileName={pdf.file.name}
          pageCount={pdf.pageCount}
        />
      )}
      sidebar={(
        <StudioSidebarFrame
          title={m.protect.title}
          tip={m.protect.tip}
          error={pdf.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={isProcessing ? m.protect.running : m.protect.action}
          onAction={() => void handleProtect()}
          disabled={!password || !confirmPassword}
          onChangeFile={reset}
        >
          <div className="studio-field">
            <label htmlFor="password">{m.protect.password}</label>
            <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={m.protect.passwordPh} />
          </div>
          <div className="studio-field">
            <label htmlFor="confirm-password">{m.protect.confirm}</label>
            <input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder={m.protect.confirmPh} />
          </div>
        </StudioSidebarFrame>
      )}
    />
  );
}

export default Protect;
