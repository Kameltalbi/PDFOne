import { useState } from 'react';
import { StudioLanding, StudioResult, StudioSidebarFrame, StudioWorkspace } from '../components/PdfStudio';
import { postForm } from '../lib/api';
import { useSinglePdf } from '../lib/useSinglePdf';
import { useI18n } from '../i18n';

function ToJpg() {
  const { m } = useI18n();
  const pdf = useSinglePdf({ allPages: false });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filename, setFilename] = useState('page.jpg');

  const handleConvert = async () => {
    if (!pdf.file) return;
    setIsProcessing(true);
    pdf.setError(null);
    setProgress(20);
    try {
      const formData = new FormData();
      formData.append('file', pdf.file);
      formData.append('quality', '85');
      setProgress(55);
      const data = await postForm('/api/to-jpg', formData);
      setProgress(100);
      setFilename(data.filename || 'page.jpg');
      pdf.setDownloadUrl(data.downloadUrl);
    } catch (err) {
      pdf.setError(err instanceof Error ? err.message : m.toJpg.fail);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const isZip = filename.endsWith('.zip');

  if (pdf.downloadUrl) {
    return (
      <StudioResult
        title={m.toJpg.doneTitle}
        text={isZip ? m.toJpg.doneZip : m.toJpg.doneSingle}
        downloadUrl={pdf.downloadUrl}
        downloadName={isZip ? 'pages.zip' : 'page.jpg'}
        resetLabel={m.toJpg.reset}
        onReset={pdf.reset}
      />
    );
  }

  if (!pdf.file) {
    return (
      <StudioLanding
        title={m.toJpg.title}
        subtitle={m.toJpg.subtitle}
        pickerId={pdf.pickerId}
        isDragging={pdf.isDragging}
        isLoading={pdf.isLoading}
        error={pdf.error}
        features={m.toJpg.features}
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
        <div className="studio-thumbs">
          <article className="studio-thumb">
            {pdf.thumbs[0] ? <img src={pdf.thumbs[0]} alt="" /> : <div className="studio-thumb-fallback">PDF</div>}
            <b>{pdf.file.name}</b>
          </article>
        </div>
      )}
      sidebar={(
        <StudioSidebarFrame
          title={m.toJpg.title}
          tip={m.toJpg.tip}
          error={pdf.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={isProcessing ? m.toJpg.running : m.toJpg.action}
          onAction={() => void handleConvert()}
          disabled={false}
          onChangeFile={pdf.reset}
        />
      )}
    />
  );
}

export default ToJpg;
