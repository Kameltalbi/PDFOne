import { useEffect, useState } from 'react';
import { StudioLanding, StudioResult, StudioSidebarFrame, StudioWorkspace, StudioZoom } from '../components/PdfStudio';
import { postForm } from '../lib/api';
import { useSinglePdf } from '../lib/useSinglePdf';
import { useI18n } from '../i18n';

function Rotate() {
  const { m, t } = useI18n();
  const pdf = useSinglePdf();
  const [angles, setAngles] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setAngles(pdf.thumbs.map(() => 0));
  }, [pdf.thumbs]);

  const rotatePage = (index: number) => {
    setAngles((current) => current.map((value, pageIndex) => (pageIndex === index ? (value + 90) % 360 : value)));
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
      />
    );
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
              const deg = angles[index] || 0;
              return (
                <article key={page} className="studio-thumb clickable" onClick={() => rotatePage(index)}>
                  <span className="studio-order">{page}</span>
                  {deg !== 0 && <span className="studio-angle">{t(m.rotatePdf.rotated, { deg })}</span>}
                  <img className="rotated" src={src} alt={t(m.split.pageAlt, { page })} style={{ transform: `rotate(${deg}deg)` }} />
                  <small>{t(m.split.pageAlt, { page })}</small>
                </article>
              );
            })}
          </div>
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
          disabled={!angles.some((value) => value !== 0)}
          onChangeFile={pdf.reset}
        >
          <p className="studio-count">{m.rotatePdf.clickToRotate}</p>
        </StudioSidebarFrame>
      )}
    />
  );
}

export default Rotate;
