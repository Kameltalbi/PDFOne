import { useMemo, useState } from 'react';
import { StudioDocumentCanvas, StudioLanding, StudioProcessing, StudioResult, StudioSidebarFrame, StudioWorkspace } from '../components/PdfStudio';
import { postForm } from '../lib/api';
import { useSinglePdf } from '../lib/useSinglePdf';
import { landingSeoFrom, usePageSeo } from '../lib/usePageSeo';
import { useI18n } from '../i18n';

type SignPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

const POSITIONS: { id: SignPosition; dot: string; label: 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight' }[] = [
  { id: 'top-left', dot: 'tl', label: 'topLeft' },
  { id: 'top-center', dot: 'tc', label: 'topCenter' },
  { id: 'top-right', dot: 'tr', label: 'topRight' },
  { id: 'bottom-left', dot: 'bl', label: 'bottomLeft' },
  { id: 'bottom-center', dot: 'bc', label: 'bottomCenter' },
  { id: 'bottom-right', dot: 'br', label: 'bottomRight' }
];

function Sign() {
  const { m, locale } = useI18n();
  usePageSeo(m.signPdf.seoTitle, m.signPdf.seoDescription);
  const pdf = useSinglePdf();
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [position, setPosition] = useState<SignPosition>('bottom-right');
  const [scope, setScope] = useState<'last' | 'all'>('last');
  const [activePage, setActivePage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const stampDate = useMemo(
    () => new Date().toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' }),
    [locale]
  );

  const handleSign = async () => {
    if (!pdf.file) return;
    if (!name.trim()) {
      pdf.setError(m.signPdf.empty);
      return;
    }

    setIsProcessing(true);
    pdf.setError(null);
    setProgress(20);
    try {
      const formData = new FormData();
      formData.append('file', pdf.file);
      formData.append('name', name.trim());
      formData.append('reason', reason.trim());
      formData.append('position', position);
      formData.append('scope', scope);
      formData.append('locale', locale);
      formData.append('signedLabel', m.signPdf.stampSigned);
      formData.append('dateLabel', m.signPdf.stampDate);
      formData.append('reasonLabel', m.signPdf.stampReason);
      setProgress(55);
      const result = await postForm('/api/pages/sign', formData);
      setProgress(100);
      pdf.setDownloadUrl(result.downloadUrl);
    } catch (err) {
      pdf.setError(err instanceof Error ? err.message : m.signPdf.fail);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  if (pdf.downloadUrl) {
    return (
      <StudioResult
        title={m.signPdf.doneTitle}
        text={m.signPdf.doneText}
        downloadUrl={pdf.downloadUrl}
        downloadName="signe.pdf"
        resetLabel={m.signPdf.reset}
        onReset={pdf.reset}
        previewSrc={pdf.thumbs[0]}
        sourceName={pdf.file?.name}
      />
    );
  }

  if (isProcessing) {
    return <StudioProcessing label={m.signPdf.running} progress={progress} onCancel={pdf.reset} />;
  }

  if (!pdf.file) {
    return (
      <StudioLanding
        title={m.signPdf.title}
        subtitle={m.signPdf.subtitle}
        pickerId={pdf.pickerId}
        isDragging={pdf.isDragging}
        isLoading={pdf.isLoading}
        error={pdf.error}
        features={m.signPdf.features}
        seo={landingSeoFrom(m.signPdf)}
        onDragOver={() => pdf.setIsDragging(true)}
        onDragLeave={() => pdf.setIsDragging(false)}
        onDrop={pdf.onDropFiles}
        onFiles={(files) => void pdf.loadFile(files)}
      />
    );
  }

  const previewName = name.trim() || m.signPdf.namePh;
  const lastPage = Math.max(pdf.thumbs.length, 1);
  const showStamp = scope === 'all' || activePage === lastPage - 1;

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
          activePage={activePage}
          onActivePageChange={setActivePage}
          overlay={showStamp ? (
            <div className={`sign-preview ${position}`}>
              <b>{m.signPdf.stampSigned}</b>
              <strong>{previewName}</strong>
              <small>{m.signPdf.stampDate} : {stampDate}</small>
              {reason.trim() && <small>{m.signPdf.stampReason} : {reason.trim()}</small>}
            </div>
          ) : undefined}
        />
      )}
      sidebar={(
        <StudioSidebarFrame
          title={m.signPdf.title}
          tip={m.signPdf.tip}
          error={pdf.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={isProcessing ? m.signPdf.running : m.signPdf.action}
          onAction={() => void handleSign()}
          disabled={!name.trim()}
          onChangeFile={pdf.reset}
        >
          <div className="studio-field">
            <label htmlFor="sign-name">{m.signPdf.name}</label>
            <input id="sign-name" value={name} maxLength={80} onChange={(event) => setName(event.target.value)} placeholder={m.signPdf.namePh} autoComplete="name" />
          </div>
          <div className="studio-field">
            <label htmlFor="sign-reason">{m.signPdf.reason}</label>
            <input id="sign-reason" value={reason} maxLength={120} onChange={(event) => setReason(event.target.value)} placeholder={m.signPdf.reasonPh} />
          </div>
          <div className="studio-field">
            <label>{m.signPdf.pages}</label>
            <div className="studio-modes">
              <button type="button" className={scope === 'last' ? 'active' : ''} onClick={() => setScope('last')}>
                <b>{m.signPdf.lastPage}</b>
              </button>
              <button type="button" className={scope === 'all' ? 'active' : ''} onClick={() => setScope('all')}>
                <b>{m.signPdf.allPages}</b>
              </button>
            </div>
          </div>
          <div className="studio-field">
            <label>{m.signPdf.position}</label>
            <div className="page-pos">
              {POSITIONS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={position === item.id ? 'active' : ''}
                  aria-label={m.signPdf[item.label]}
                  title={m.signPdf[item.label]}
                  onClick={() => setPosition(item.id)}
                >
                  <i className={item.dot} />
                </button>
              ))}
            </div>
          </div>
        </StudioSidebarFrame>
      )}
    />
  );
}

export default Sign;
