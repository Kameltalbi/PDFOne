import { useState } from 'react';
import { StudioLanding, StudioResult, StudioSidebarFrame, StudioWorkspace, StudioZoom } from '../components/PdfStudio';
import { postForm } from '../lib/api';
import { useSinglePdf } from '../lib/useSinglePdf';
import { useI18n } from '../i18n';

const PRESETS = [
  { id: 'light', value: 5 },
  { id: 'medium', value: 10 },
  { id: 'strong', value: 15 }
] as const;

function Crop() {
  const { m, t } = useI18n();
  const pdf = useSinglePdf();
  const [even, setEven] = useState(true);
  const [top, setTop] = useState(8);
  const [right, setRight] = useState(8);
  const [bottom, setBottom] = useState(8);
  const [left, setLeft] = useState(8);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const setAll = (value: number) => {
    setTop(value);
    setRight(value);
    setBottom(value);
    setLeft(value);
  };

  const setSide = (side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
    if (even) {
      setAll(value);
      return;
    }
    if (side === 'top') setTop(value);
    if (side === 'right') setRight(value);
    if (side === 'bottom') setBottom(value);
    if (side === 'left') setLeft(value);
  };

  const hasCrop = top + right + bottom + left > 0;

  const handleApply = async () => {
    if (!pdf.file) return;
    if (!hasCrop) {
      pdf.setError(m.cropPdf.empty);
      return;
    }
    setIsProcessing(true);
    pdf.setError(null);
    setProgress(25);
    try {
      const formData = new FormData();
      formData.append('file', pdf.file);
      formData.append('top', String(top / 100));
      formData.append('right', String(right / 100));
      formData.append('bottom', String(bottom / 100));
      formData.append('left', String(left / 100));
      setProgress(60);
      const result = await postForm('/api/pages/crop', formData);
      setProgress(100);
      pdf.setDownloadUrl(result.downloadUrl);
    } catch (err) {
      pdf.setError(err instanceof Error ? err.message : m.cropPdf.fail);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  if (pdf.downloadUrl) {
    return (
      <StudioResult
        title={m.cropPdf.doneTitle}
        text={m.cropPdf.doneText}
        downloadUrl={pdf.downloadUrl}
        downloadName="pdf-rogne.pdf"
        resetLabel={m.cropPdf.reset}
        onReset={pdf.reset}
      />
    );
  }

  if (!pdf.file) {
    return (
      <StudioLanding
        title={m.cropPdf.title}
        subtitle={m.cropPdf.subtitle}
        pickerId={pdf.pickerId}
        isDragging={pdf.isDragging}
        isLoading={pdf.isLoading}
        error={pdf.error}
        features={m.cropPdf.features}
        onDragOver={() => pdf.setIsDragging(true)}
        onDragLeave={() => pdf.setIsDragging(false)}
        onDrop={pdf.onDropFiles}
        onFiles={(files) => void pdf.loadFile(files)}
      />
    );
  }

  const sides = [
    ['top', m.cropPdf.top, top],
    ['right', m.cropPdf.right, right],
    ['bottom', m.cropPdf.bottom, bottom],
    ['left', m.cropPdf.left, left]
  ] as const;

  return (
    <StudioWorkspace
      canvas={(
        <>
          <StudioZoom setZoom={pdf.setZoom} />
          <div className="studio-thumbs" style={{ ['--thumb-scale' as string]: String(pdf.zoom) }}>
            {pdf.thumbs.map((src, index) => {
              const page = index + 1;
              return (
                <article key={page} className="studio-thumb">
                  <span className="studio-order">{page}</span>
                  <div className="studio-thumb-sheet">
                    <img src={src} alt={t(m.split.pageAlt, { page })} />
                    <span
                      className="crop-keep"
                      style={{ inset: `${top}% ${right}% ${bottom}% ${left}%` }}
                    />
                  </div>
                  <small>{t(m.split.pageAlt, { page })}</small>
                </article>
              );
            })}
          </div>
        </>
      )}
      sidebar={(
        <StudioSidebarFrame
          title={m.cropPdf.title}
          tip={m.cropPdf.tip}
          error={pdf.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={isProcessing ? m.cropPdf.running : m.cropPdf.action}
          onAction={() => void handleApply()}
          disabled={!hasCrop}
          onChangeFile={pdf.reset}
        >
          <div className="studio-field">
            <label>{m.cropPdf.presets}</label>
            <div className="studio-modes two-col">
              {PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  className={even && top === preset.value && right === preset.value && bottom === preset.value && left === preset.value ? 'active' : ''}
                  onClick={() => setAll(preset.value)}
                >
                  <b>{m.cropPdf[preset.id]}</b>
                  <span>{preset.value}%</span>
                </button>
              ))}
            </div>
          </div>
          <label className="studio-option">
            <input
              type="checkbox"
              checked={even}
              onChange={(event) => {
                setEven(event.target.checked);
                if (event.target.checked) setAll(top);
              }}
            />
            {m.cropPdf.even}
          </label>
          {even ? (
            <div className="studio-field">
              <label htmlFor="crop-even">{m.cropPdf.margin} ({top}%)</label>
              <input id="crop-even" type="range" min="0" max="35" step="1" value={top} onChange={(event) => setAll(Number(event.target.value))} />
            </div>
          ) : sides.map(([id, label, value]) => (
            <div className="studio-field" key={id}>
              <label htmlFor={`crop-${id}`}>{label} ({value}%)</label>
              <input id={`crop-${id}`} type="range" min="0" max="35" step="1" value={value} onChange={(event) => setSide(id, Number(event.target.value))} />
            </div>
          ))}
        </StudioSidebarFrame>
      )}
    />
  );
}

export default Crop;
