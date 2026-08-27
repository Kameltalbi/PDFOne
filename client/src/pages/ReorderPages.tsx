import { useEffect, useState } from 'react';
import { StudioLanding, StudioResult, StudioSidebarFrame, StudioWorkspace, StudioZoom } from '../components/PdfStudio';
import { postForm } from '../lib/api';
import { useSinglePdf } from '../lib/useSinglePdf';
import { useI18n } from '../i18n';

function ReorderPages() {
  const { m, t } = useI18n();
  const pdf = useSinglePdf();
  const [order, setOrder] = useState<number[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setOrder(pdf.thumbs.map((_, index) => index + 1));
  }, [pdf.thumbs]);

  const moveItem = (from: number, to: number) => {
    setOrder((current) => {
      if (from === to || from < 0 || to < 0 || from >= current.length || to >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const handleReorder = async () => {
    if (!pdf.file) return;
    setIsProcessing(true);
    pdf.setError(null);
    setProgress(25);
    try {
      const formData = new FormData();
      formData.append('file', pdf.file);
      formData.append('order', JSON.stringify(order));
      setProgress(60);
      const result = await postForm('/api/pages/reorder', formData);
      setProgress(100);
      pdf.setDownloadUrl(result.downloadUrl);
    } catch (err) {
      pdf.setError(err instanceof Error ? err.message : m.reorderPages.fail);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  if (pdf.downloadUrl) {
    return (
      <StudioResult
        title={m.reorderPages.doneTitle}
        text={m.reorderPages.doneText}
        downloadUrl={pdf.downloadUrl}
        downloadName="pages-reordonnees.pdf"
        resetLabel={m.reorderPages.reset}
        onReset={pdf.reset}
      />
    );
  }

  if (!pdf.file) {
    return (
      <StudioLanding
        title={m.reorderPages.title}
        subtitle={m.reorderPages.subtitle}
        pickerId={pdf.pickerId}
        isDragging={pdf.isDragging}
        isLoading={pdf.isLoading}
        error={pdf.error}
        features={m.reorderPages.features}
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
        <>
          <StudioZoom setZoom={pdf.setZoom} />
          <div className="studio-thumbs" style={{ ['--thumb-scale' as string]: String(pdf.zoom) }}>
            {order.map((page, index) => (
              <article
                key={`${page}-${index}`}
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
                <img src={pdf.thumbs[page - 1]} alt={t(m.split.pageAlt, { page })} />
                <small>{t(m.split.pageAlt, { page })}</small>
              </article>
            ))}
          </div>
        </>
      )}
      sidebar={(
        <StudioSidebarFrame
          title={m.reorderPages.title}
          tip={m.reorderPages.tip}
          error={pdf.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={isProcessing ? m.reorderPages.reordering : m.reorderPages.action}
          onAction={() => void handleReorder()}
          disabled={order.length === 0}
          onChangeFile={pdf.reset}
        />
      )}
    />
  );
}

export default ReorderPages;
