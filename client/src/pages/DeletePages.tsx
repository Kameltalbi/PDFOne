import { useEffect, useState } from 'react';
import { StudioLanding, StudioResult, StudioSidebarFrame, StudioWorkspace, StudioZoom } from '../components/PdfStudio';
import { postForm } from '../lib/api';
import { useSinglePdf } from '../lib/useSinglePdf';
import { useI18n } from '../i18n';

function DeletePages() {
  const { m, t } = useI18n();
  const pdf = useSinglePdf();
  const [selected, setSelected] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setSelected([]);
  }, [pdf.thumbs]);

  const togglePage = (page: number) => {
    setSelected((current) => (
      current.includes(page) ? current.filter((value) => value !== page) : [...current, page].sort((a, b) => a - b)
    ));
  };

  const handleDelete = async () => {
    if (!pdf.file) return;
    if (selected.length === 0) return;
    if (selected.length >= pdf.thumbs.length) {
      pdf.setError(m.deletePages.keepOne);
      return;
    }

    setIsProcessing(true);
    pdf.setError(null);
    setProgress(25);
    try {
      const formData = new FormData();
      formData.append('file', pdf.file);
      formData.append('pages', JSON.stringify(selected));
      setProgress(60);
      const result = await postForm('/api/pages/delete', formData);
      setProgress(100);
      pdf.setDownloadUrl(result.downloadUrl);
    } catch (err) {
      pdf.setError(err instanceof Error ? err.message : m.deletePages.fail);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  if (pdf.downloadUrl) {
    return (
      <StudioResult
        title={m.deletePages.doneTitle}
        text={m.deletePages.doneText}
        downloadUrl={pdf.downloadUrl}
        downloadName="pages-supprimees.pdf"
        resetLabel={m.deletePages.reset}
        onReset={pdf.reset}
      />
    );
  }

  if (!pdf.file) {
    return (
      <StudioLanding
        title={m.deletePages.title}
        subtitle={m.deletePages.subtitle}
        pickerId={pdf.pickerId}
        isDragging={pdf.isDragging}
        isLoading={pdf.isLoading}
        error={pdf.error}
        features={m.deletePages.features}
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
            {pdf.thumbs.map((src, index) => {
              const page = index + 1;
              const marked = selected.includes(page);
              return (
                <article key={page} className={`studio-thumb clickable ${marked ? 'danger' : ''}`} onClick={() => togglePage(page)}>
                  <span className="studio-order">{page}</span>
                  {marked && <span className="studio-check">×</span>}
                  <img src={src} alt={t(m.split.pageAlt, { page })} />
                  <small>{t(m.split.pageAlt, { page })}</small>
                </article>
              );
            })}
          </div>
        </>
      )}
      sidebar={(
        <StudioSidebarFrame
          title={m.deletePages.title}
          tip={m.deletePages.tip}
          error={pdf.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={isProcessing ? m.deletePages.deleting : t(m.deletePages.action, { count: selected.length })}
          onAction={() => void handleDelete()}
          disabled={selected.length === 0 || selected.length >= pdf.thumbs.length}
          onChangeFile={pdf.reset}
        >
          <p className="studio-count">{t(m.deletePages.selectToDelete, { count: selected.length })}</p>
        </StudioSidebarFrame>
      )}
    />
  );
}

export default DeletePages;
