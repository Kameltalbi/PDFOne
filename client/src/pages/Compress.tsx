import { useMemo, useState } from 'react';
import { StudioDocumentCanvas, StudioLanding, StudioResult, StudioSidebarFrame, StudioWorkspace } from '../components/PdfStudio';
import { formatFileSize, postForm } from '../lib/api';
import { faqPageJsonLd, useJsonLd } from '../lib/jsonLd';
import { useSinglePdf } from '../lib/useSinglePdf';
import { usePageSeo } from '../lib/usePageSeo';
import { useI18n } from '../i18n';

function Compress() {
  const { m, t } = useI18n();
  usePageSeo(m.compress.seoTitle, m.compress.seoDescription);
  const faqJsonLd = useMemo(
    () => faqPageJsonLd(m.compress.faq, 'https://one2pdf.com/compress'),
    [m.compress.faq]
  );
  useJsonLd('one2pdf-faq-compress', faqJsonLd);
  const pdf = useSinglePdf({ allPages: false });
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ downloadUrl: string; originalSize?: number; compressedSize?: number } | null>(null);

  const qualities = [
    { id: 'high' as const, title: m.compress.high, desc: m.compress.highDesc },
    { id: 'medium' as const, title: m.compress.medium, desc: m.compress.mediumDesc },
    { id: 'low' as const, title: m.compress.low, desc: m.compress.lowDesc }
  ];

  const handleCompress = async () => {
    if (!pdf.file) return;
    setIsProcessing(true);
    pdf.setError(null);
    setProgress(20);
    try {
      const formData = new FormData();
      formData.append('file', pdf.file);
      formData.append('quality', quality);
      setProgress(60);
      const data = await postForm('/api/compress', formData);
      setProgress(100);
      setResult(data);
    } catch (err) {
      pdf.setError(err instanceof Error ? err.message : m.compress.fail);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    pdf.reset();
    setResult(null);
    setProgress(0);
    setQuality('medium');
  };

  const savings = result?.originalSize && result.compressedSize
    ? Math.max(0, Math.round((1 - result.compressedSize / result.originalSize) * 100))
    : null;

  if (result) {
    return (
      <StudioResult
        title={m.compress.doneTitle}
        text={
          savings !== null && result.originalSize && result.compressedSize
            ? t(m.compress.savings, { from: formatFileSize(result.originalSize), to: formatFileSize(result.compressedSize), percent: savings })
            : m.compress.doneGeneric
        }
        downloadUrl={result.downloadUrl}
        downloadName="compresse.pdf"
        resetLabel={m.compress.reset}
        onReset={reset}
      />
    );
  }

  if (!pdf.file) {
    return (
      <StudioLanding
        title={m.compress.title}
        subtitle={m.compress.subtitle}
        pickerId={pdf.pickerId}
        isDragging={pdf.isDragging}
        isLoading={pdf.isLoading}
        error={pdf.error}
        features={m.compress.features}
        seo={{
          h2: m.compress.seoH2,
          paragraphs: [m.compress.seoP1, m.compress.seoP2, m.compress.seoP3],
          faqTitle: m.compress.faqTitle,
          faq: m.compress.faq
        }}
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
          title={m.compress.title}
          tip={m.compress.tip}
          error={pdf.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={isProcessing ? m.compress.running : m.compress.action}
          onAction={() => void handleCompress()}
          disabled={false}
          onChangeFile={reset}
        >
          <div className="studio-modes">
            {qualities.map((option) => (
              <button key={option.id} type="button" className={quality === option.id ? 'active' : ''} onClick={() => setQuality(option.id)}>
                <b>{option.title}</b>
                <span>{option.desc}</span>
              </button>
            ))}
          </div>
          {(quality === 'medium' || quality === 'low') && <p className="studio-count">{m.compress.lossyHint}</p>}
        </StudioSidebarFrame>
      )}
    />
  );
}

export default Compress;
