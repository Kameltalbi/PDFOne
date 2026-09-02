import { useState } from 'react';
import { StudioDocumentCanvas, StudioLanding, StudioProcessing, StudioResult, StudioSidebarFrame, StudioWorkspace } from '../components/PdfStudio';
import { postForm } from '../lib/api';
import { useSinglePdf } from '../lib/useSinglePdf';
import { landingSeoFrom, usePageSeo } from '../lib/usePageSeo';
import { useI18n } from '../i18n';

function HeaderFooter() {
  const { m, locale } = useI18n();
  usePageSeo(m.headerFooter.seoTitle, m.headerFooter.seoDescription);
  const pdf = useSinglePdf();
  const [header, setHeader] = useState('');
  const [footer, setFooter] = useState('');
  const [numbers, setNumbers] = useState(false);
  const [color, setColor] = useState('#4b5563');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const canApply = Boolean(header.trim() || footer.trim() || numbers);

  const handleApply = async () => {
    if (!pdf.file || !canApply) {
      pdf.setError(m.headerFooter.empty);
      return;
    }
    setIsProcessing(true);
    pdf.setError(null);
    setProgress(25);
    try {
      const formData = new FormData();
      formData.append('file', pdf.file);
      formData.append('header', header);
      formData.append('footer', footer);
      formData.append('numbers', String(numbers));
      formData.append('color', color);
      formData.append('locale', locale);
      setProgress(60);
      const result = await postForm('/api/pages/header-footer', formData);
      setProgress(100);
      pdf.setDownloadUrl(result.downloadUrl);
    } catch (err) {
      pdf.setError(err instanceof Error ? err.message : m.headerFooter.fail);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  if (pdf.downloadUrl) {
    return (
      <StudioResult
        title={m.headerFooter.doneTitle}
        text={m.headerFooter.doneText}
        downloadUrl={pdf.downloadUrl}
        downloadName="en-tete-pied.pdf"
        resetLabel={m.headerFooter.reset}
        onReset={pdf.reset}
        previewSrc={pdf.thumbs[0]}
        sourceName={pdf.file?.name}
      />
    );
  }

  if (isProcessing) {
    return <StudioProcessing label={m.headerFooter.running} progress={progress} onCancel={pdf.reset} />;
  }

  if (!pdf.file) {
    return (
      <StudioLanding
        title={m.headerFooter.title}
        subtitle={m.headerFooter.subtitle}
        pickerId={pdf.pickerId}
        isDragging={pdf.isDragging}
        isLoading={pdf.isLoading}
        error={pdf.error}
        features={m.headerFooter.features}
        seo={landingSeoFrom(m.headerFooter)}
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
          title={m.headerFooter.title}
          tip={m.headerFooter.tip}
          error={pdf.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={isProcessing ? m.headerFooter.running : m.headerFooter.action}
          onAction={() => void handleApply()}
          disabled={!canApply}
          onChangeFile={pdf.reset}
        >
          <div className="studio-field">
            <label htmlFor="hf-header">{m.headerFooter.header}</label>
            <input id="hf-header" value={header} onChange={(event) => setHeader(event.target.value)} placeholder={m.headerFooter.headerPh} maxLength={80} />
          </div>
          <div className="studio-field">
            <label htmlFor="hf-footer">{m.headerFooter.footer}</label>
            <input id="hf-footer" value={footer} onChange={(event) => setFooter(event.target.value)} placeholder={m.headerFooter.footerPh} maxLength={80} />
          </div>
          <label className="studio-check-row">
            <input type="checkbox" checked={numbers} onChange={(event) => setNumbers(event.target.checked)} />
            {m.headerFooter.numbers}
          </label>
          <label className="studio-color">
            {m.headerFooter.color}
            <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
          </label>
        </StudioSidebarFrame>
      )}
    />
  );
}

export default HeaderFooter;
