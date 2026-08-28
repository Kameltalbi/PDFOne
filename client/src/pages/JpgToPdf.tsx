import { useState } from 'react';
import { StudioLanding, StudioProcessing, StudioResult, StudioSidebarFrame, StudioWorkspace, StudioZoom } from '../components/PdfStudio';
import { postForm } from '../lib/api';
import { useImageFiles } from '../lib/useImageFiles';
import { landingSeoFrom, usePageSeo } from '../lib/usePageSeo';
import { useI18n } from '../i18n';

function JpgToPdf() {
  const { m, t } = useI18n();
  usePageSeo(m.jpgToPdf.seoTitle, m.jpgToPdf.seoDescription);
  const images = useImageFiles();
  const addPickerId = `${images.pickerId}-add`;
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const moveItem = (from: number, to: number) => {
    images.setItems((current) => {
      if (from === to || from < 0 || to < 0 || from >= current.length || to >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

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
      images.setError(err instanceof Error ? err.message : m.jpgToPdf.fail);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  if (images.downloadUrl) {
    return (
      <StudioResult
        title={m.jpgToPdf.doneTitle}
        text={m.jpgToPdf.doneText}
        downloadUrl={images.downloadUrl}
        downloadName="images.pdf"
        resetLabel={m.jpgToPdf.reset}
        onReset={images.reset}
        previewSrc={images.items[0]?.thumb}
        sourceName={images.items[0]?.name}
      />
    );
  }

  if (isProcessing) {
    return <StudioProcessing label={m.jpgToPdf.running} progress={progress} onCancel={images.reset} />;
  }

  if (images.items.length === 0) {
    return (
      <StudioLanding
        title={m.jpgToPdf.title}
        subtitle={m.jpgToPdf.subtitle}
        pickerId={images.pickerId}
        isDragging={images.isDragging}
        isLoading={false}
        error={images.error}
        features={m.jpgToPdf.features}
        seo={landingSeoFrom(m.jpgToPdf)}
        multiple
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
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
            {images.items.map((item, index) => (
              <article
                key={item.id}
                className={`studio-thumb ${dragIndex === index ? 'dragging' : ''}`}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (dragIndex !== null) moveItem(dragIndex, index);
                  setDragIndex(null);
                }}
                onDragEnd={() => setDragIndex(null)}
              >
                <span className="studio-order">{index + 1}</span>
                <button type="button" className="studio-check" onClick={() => images.setItems((current) => current.filter((entry) => entry.id !== item.id))} aria-label={t(m.merge.remove, { name: item.name })}>×</button>
                <img src={item.thumb} alt="" />
                <b>{item.name}</b>
              </article>
            ))}
          </div>
          <div className="studio-fabs">
            <label htmlFor={addPickerId} className="studio-fab">+</label>
          </div>
          <input id={addPickerId} type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" multiple className="studio-file-input" onChange={(event) => { if (event.target.files) images.loadFiles(event.target.files); event.target.value = ''; }} />
        </>
      )}
      sidebar={(
        <StudioSidebarFrame
          title={m.jpgToPdf.title}
          tip={m.jpgToPdf.tip}
          error={images.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={isProcessing ? m.jpgToPdf.running : t(m.jpgToPdf.action, { count: images.items.length })}
          onAction={() => void handleConvert()}
          disabled={images.items.length === 0}
          onChangeFile={images.reset}
        />
      )}
    />
  );
}

export default JpgToPdf;
