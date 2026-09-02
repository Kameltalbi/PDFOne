import { useMemo, useState } from 'react';
import { StudioLanding, StudioProcessing, StudioResult, StudioSidebarFrame, StudioWorkspace, StudioZoom } from '../components/PdfStudio';
import { postForm } from '../lib/api';
import { useImageFiles } from '../lib/useImageFiles';
import { landingSeoFrom, usePageSeo } from '../lib/usePageSeo';
import { useI18n } from '../i18n';

function HeicToPdf() {
  const { m } = useI18n();
  usePageSeo(m.heicToPdf.seoTitle, m.heicToPdf.seoDescription);
  const images = useImageFiles();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const accept = 'image/heic,image/heif,.heic,.heif,image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

  const heicCount = useMemo(
    () => images.items.filter((item) => /\.(heic|heif)$/i.test(item.name) || /heic|heif/i.test(item.file.type)).length,
    [images.items]
  );

  const handleConvert = async () => {
    if (images.items.length === 0) return;
    setIsProcessing(true);
    images.setError(null);
    setProgress(20);
    try {
      const formData = new FormData();
      images.items.forEach((item) => formData.append('files', item.file));
      formData.append('order', JSON.stringify(images.items.map((_, index) => index)));
      setProgress(55);
      const result = await postForm('/api/jpg-to-pdf', formData);
      setProgress(100);
      images.setDownloadUrl(result.downloadUrl);
    } catch (err) {
      images.setError(err instanceof Error ? err.message : m.heicToPdf.fail);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  if (images.downloadUrl) {
    return (
      <StudioResult
        title={m.heicToPdf.doneTitle}
        text={m.heicToPdf.doneText}
        downloadUrl={images.downloadUrl}
        downloadName="heic.pdf"
        resetLabel={m.heicToPdf.reset}
        onReset={images.reset}
        previewSrc={images.items[0]?.thumb}
        sourceName={images.items[0]?.name}
      />
    );
  }

  if (isProcessing) {
    return <StudioProcessing label={m.heicToPdf.running} progress={progress} onCancel={images.reset} />;
  }

  if (images.items.length === 0) {
    return (
      <StudioLanding
        title={m.heicToPdf.title}
        subtitle={m.heicToPdf.subtitle}
        pickerId={images.pickerId}
        isDragging={images.isDragging}
        isLoading={false}
        error={images.error}
        features={m.heicToPdf.features}
        seo={landingSeoFrom(m.heicToPdf)}
        multiple
        accept={accept}
        onDragOver={() => images.setIsDragging(true)}
        onDragLeave={() => images.setIsDragging(false)}
        onDrop={images.onDropFiles}
        onFiles={images.loadFiles}
      />
    );
  }

  return (
    <StudioWorkspace
      isDragging={images.isDragging}
      onDragOver={() => images.setIsDragging(true)}
      onDragLeave={() => images.setIsDragging(false)}
      onDrop={images.onDropFiles}
      canvas={(
        <>
          <StudioZoom setZoom={images.setZoom} />
          <div className="studio-thumbs" style={{ ['--thumb-scale' as string]: String(images.zoom) }}>
            {images.items.map((item) => (
              <article key={item.id} className="studio-thumb">
                <img src={item.thumb} alt={item.name} />
                <small>{item.name}</small>
              </article>
            ))}
          </div>
        </>
      )}
      sidebar={(
        <StudioSidebarFrame
          title={m.heicToPdf.title}
          tip={heicCount ? m.heicToPdf.tip : m.heicToPdf.tipMixed}
          error={images.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={isProcessing ? m.heicToPdf.running : m.heicToPdf.action}
          onAction={() => void handleConvert()}
          disabled={images.items.length === 0}
          onChangeFile={images.reset}
        />
      )}
    />
  );
}

export default HeicToPdf;
