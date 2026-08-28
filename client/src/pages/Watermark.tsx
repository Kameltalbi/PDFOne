import { useState } from 'react';
import { StudioDocumentCanvas, StudioLanding, StudioResult, StudioSidebarFrame, StudioWorkspace } from '../components/PdfStudio';
import { postForm } from '../lib/api';
import { useSinglePdf } from '../lib/useSinglePdf';
import { landingSeoFrom, usePageSeo } from '../lib/usePageSeo';
import { useI18n } from '../i18n';

function Watermark() {
  const { m } = useI18n();
  usePageSeo(m.watermark.seoTitle, m.watermark.seoDescription);
  const pdf = useSinglePdf();
  const [text, setText] = useState(m.watermark.textPh);
  const [opacity, setOpacity] = useState(0.22);
  const [rotation, setRotation] = useState(45);
  const [color, setColor] = useState('#6b7280');
  const [mosaic, setMosaic] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleApply = async () => {
    if (!pdf.file) return;
    if (!text.trim()) {
      pdf.setError(m.watermark.empty);
      return;
    }

    setIsProcessing(true);
    pdf.setError(null);
    setProgress(25);
    try {
      const formData = new FormData();
      formData.append('file', pdf.file);
      formData.append('text', text.trim());
      formData.append('opacity', String(opacity));
      formData.append('rotation', String(rotation));
      formData.append('color', color);
      formData.append('mosaic', String(mosaic));
      setProgress(60);
      const result = await postForm('/api/pages/watermark', formData);
      setProgress(100);
      pdf.setDownloadUrl(result.downloadUrl);
    } catch (err) {
      pdf.setError(err instanceof Error ? err.message : m.watermark.fail);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  if (pdf.downloadUrl) {
    return (
      <StudioResult
        title={m.watermark.doneTitle}
        text={m.watermark.doneText}
        downloadUrl={pdf.downloadUrl}
        downloadName="filigrane.pdf"
        resetLabel={m.watermark.reset}
        onReset={pdf.reset}
      />
    );
  }

  if (!pdf.file) {
    return (
      <StudioLanding
        title={m.watermark.title}
        subtitle={m.watermark.subtitle}
        pickerId={pdf.pickerId}
        isDragging={pdf.isDragging}
        isLoading={pdf.isLoading}
        error={pdf.error}
        features={m.watermark.features}
        seo={landingSeoFrom(m.watermark)}
        onDragOver={() => pdf.setIsDragging(true)}
        onDragLeave={() => pdf.setIsDragging(false)}
        onDrop={pdf.onDropFiles}
        onFiles={(files) => void pdf.loadFile(files)}
      />
    );
  }

  const previewText = text.trim() || m.watermark.textPh;
  const previewMark = () => (
    <div
      className={`watermark-preview${mosaic ? ' mosaic' : ''}`}
      style={{ color, opacity, transform: mosaic ? undefined : `rotate(${rotation}deg)` }}
    >
      {mosaic
        ? Array.from({ length: 12 }, (_, index) => (
            <span key={index} style={{ transform: `rotate(${rotation}deg)` }}>{previewText}</span>
          ))
        : <span>{previewText}</span>}
    </div>
  );

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
          overlay={previewMark()}
        />
      )}
      sidebar={(
        <StudioSidebarFrame
          title={m.watermark.title}
          tip={m.watermark.tip}
          error={pdf.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={isProcessing ? m.watermark.running : m.watermark.action}
          onAction={() => void handleApply()}
          disabled={!text.trim()}
          onChangeFile={pdf.reset}
        >
          <div className="studio-field">
            <label htmlFor="watermark-text">{m.watermark.text}</label>
            <input id="watermark-text" value={text} maxLength={80} onChange={(event) => setText(event.target.value)} placeholder={m.watermark.textPh} />
          </div>
          <div className="studio-field">
            <label htmlFor="watermark-opacity">{m.watermark.opacity} ({Math.round(opacity * 100)}%)</label>
            <input id="watermark-opacity" type="range" min="0.08" max="0.6" step="0.02" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} />
          </div>
          <div className="studio-field">
            <label>{m.watermark.rotation}</label>
            <div className="studio-modes">
              <button type="button" className={rotation === 0 ? 'active' : ''} onClick={() => setRotation(0)}>
                <b>{m.watermark.horizontal}</b>
              </button>
              <button type="button" className={rotation === 45 ? 'active' : ''} onClick={() => setRotation(45)}>
                <b>{m.watermark.diagonal}</b>
              </button>
            </div>
          </div>
          <div className="studio-field">
            <label>{m.watermark.style}</label>
            <div className="studio-modes">
              <button type="button" className={!mosaic ? 'active' : ''} onClick={() => setMosaic(false)}>
                <b>{m.watermark.once}</b>
              </button>
              <button type="button" className={mosaic ? 'active' : ''} onClick={() => setMosaic(true)}>
                <b>{m.watermark.mosaic}</b>
              </button>
            </div>
          </div>
          <label className="studio-color">
            {m.watermark.color}
            <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
          </label>
        </StudioSidebarFrame>
      )}
    />
  );
}

export default Watermark;
