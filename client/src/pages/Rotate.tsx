import { useEffect, useState } from 'react';
import { StudioLanding, StudioProcessing, StudioResult, StudioSidebarFrame, StudioWorkspace, StudioZoom } from '../components/PdfStudio';
import { postForm } from '../lib/api';
import { useSinglePdf } from '../lib/useSinglePdf';
import { landingSeoFrom, usePageSeo } from '../lib/usePageSeo';
import { useI18n } from '../i18n';

function turn(value: number, delta: number) {
  return ((value + delta) % 360 + 360) % 360;
}

function Rotate() {
  const { m, t } = useI18n();
  usePageSeo(m.rotatePdf.seoTitle, m.rotatePdf.seoDescription);
  const pdf = useSinglePdf();
  const [angles, setAngles] = useState<number[]>([]);
  const [active, setActive] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setAngles((current) => pdf.thumbs.map((_, index) => current[index] ?? 0));
    setActive((index) => (pdf.thumbs.length ? Math.min(index, pdf.thumbs.length - 1) : 0));
  }, [pdf.thumbs]);

  const rotatePage = (index: number, delta = 90) => {
    setAngles((current) => current.map((value, pageIndex) => (pageIndex === index ? turn(value, delta) : value)));
    setActive(index);
  };

  const rotateAll = (delta: number) => {
    setAngles((current) => current.map((value) => turn(value, delta)));
  };

  const handleRotate = async () => {
    if (!pdf.file) return;
    setIsProcessing(true);
    pdf.setError(null);
    setProgress(25);
    try {
      const formData = new FormData();
      formData.append('file', pdf.file);
      formData.append('rotations', JSON.stringify(angles));
      setProgress(60);
      const result = await postForm('/api/pages/rotate', formData);
      setProgress(100);
      pdf.setDownloadUrl(result.downloadUrl);
    } catch (err) {
      pdf.setError(err instanceof Error ? err.message : m.rotatePdf.fail);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  if (pdf.downloadUrl) {
    return (
      <StudioResult
        title={m.rotatePdf.doneTitle}
        text={m.rotatePdf.doneText}
        downloadUrl={pdf.downloadUrl}
        downloadName="pdf-pivote.pdf"
        resetLabel={m.rotatePdf.reset}
        onReset={pdf.reset}
        previewSrc={pdf.thumbs[0]}
        sourceName={pdf.file?.name}
      />
    );
  }

  if (isProcessing) {
    return <StudioProcessing label={m.rotatePdf.rotating} progress={progress} onCancel={pdf.reset} />;
  }

  if (!pdf.file) {
    return (
      <StudioLanding
        title={m.rotatePdf.title}
        subtitle={m.rotatePdf.subtitle}
        pickerId={pdf.pickerId}
        isDragging={pdf.isDragging}
        isLoading={pdf.isLoading}
        error={pdf.error}
        features={m.rotatePdf.features}
        seo={landingSeoFrom(m.rotatePdf)}
        onDragOver={() => pdf.setIsDragging(true)}
        onDragLeave={() => pdf.setIsDragging(false)}
        onDrop={pdf.onDropFiles}
        onFiles={(files) => void pdf.loadFile(files)}
      />
    );
  }

  const pageCount = pdf.thumbs.length;
  const deg = angles[active] || 0;
  const src = pdf.thumbs[active];
  const page = active + 1;
  const hasRotation = angles.some((value) => value !== 0);
  const canRotate = pageCount > 0 && !pdf.isLoading;

  return (
    <StudioWorkspace
      canvas={(
        <>
          <StudioZoom setZoom={pdf.setZoom} />
          {pdf.isLoading && pageCount === 0 ? (
            <p className="studio-or">{m.merge.preparing}</p>
          ) : (
            <>
              <div className="rotate-preview">
                <div className="rotate-toolbar">
                  <button type="button" disabled={!canRotate} onClick={() => rotatePage(active, -90)}>{m.rotatePdf.rotateLeft}</button>
                  <button type="button" disabled={!canRotate} onClick={() => rotatePage(active, 90)}>{m.rotatePdf.rotateRight}</button>
                  <button type="button" disabled={!canRotate} onClick={() => rotateAll(-90)}>{m.rotatePdf.rotateAllLeft}</button>
                  <button type="button" disabled={!canRotate} onClick={() => rotateAll(90)}>{m.rotatePdf.rotateAllRight}</button>
                </div>
                {src ? (
                  <div className={`rotate-preview-frame deg-${deg}`}>
                    {deg !== 0 && <span className="studio-angle">{t(m.rotatePdf.rotated, { deg })}</span>}
                    <img src={src} alt={t(m.split.pageAlt, { page })} style={{ transform: `rotate(${deg}deg)` }} />
                  </div>
                ) : (
                  <div className="studio-thumb-fallback">{t(m.split.pageAlt, { page: page || 1 })}</div>
                )}
                {pageCount > 1 && (
                  <div className="rotate-pager">
                    <button type="button" disabled={active <= 0} onClick={() => setActive((index) => Math.max(0, index - 1))}>‹</button>
                    <span>{t(m.rotatePdf.pageOf, { page, count: pageCount })}</span>
                    <button type="button" disabled={active >= pageCount - 1} onClick={() => setActive((index) => Math.min(pageCount - 1, index + 1))}>›</button>
                  </div>
                )}
              </div>
              <div className="studio-thumbs" style={{ ['--thumb-scale' as string]: String(pdf.zoom) }}>
                {pdf.thumbs.map((thumb, index) => {
                  const thumbPage = index + 1;
                  const thumbDeg = angles[index] || 0;
                  return (
                    <article
                      key={thumbPage}
                      className={`studio-thumb clickable${index === active ? ' selected' : ''}`}
                      onClick={() => setActive(index)}
                    >
                      <span className="studio-order">{thumbPage}</span>
                      {thumbDeg !== 0 && <span className="studio-angle">{t(m.rotatePdf.rotated, { deg: thumbDeg })}</span>}
                      <img className="rotated" src={thumb} alt={t(m.split.pageAlt, { page: thumbPage })} style={{ transform: `rotate(${thumbDeg}deg)` }} />
                      <small>{t(m.split.pageAlt, { page: thumbPage })}</small>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
      sidebar={(
        <StudioSidebarFrame
          title={m.rotatePdf.title}
          tip={m.rotatePdf.tip}
          error={pdf.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={isProcessing ? m.rotatePdf.rotating : m.rotatePdf.action}
          onAction={() => void handleRotate()}
          disabled={!hasRotation}
          onChangeFile={pdf.reset}
        >
          <p className="studio-count">{m.rotatePdf.clickToRotate}</p>
          <div className="studio-modes two-col">
            <button type="button" disabled={!canRotate} onClick={() => rotatePage(active, -90)}>
              <b>{m.rotatePdf.rotateLeft}</b>
            </button>
            <button type="button" disabled={!canRotate} onClick={() => rotatePage(active, 90)}>
              <b>{m.rotatePdf.rotateRight}</b>
            </button>
            <button type="button" disabled={!canRotate} onClick={() => rotateAll(-90)}>
              <b>{m.rotatePdf.rotateAllLeft}</b>
            </button>
            <button type="button" disabled={!canRotate} onClick={() => rotateAll(90)}>
              <b>{m.rotatePdf.rotateAllRight}</b>
            </button>
          </div>
        </StudioSidebarFrame>
      )}
    />
  );
}

export default Rotate;
