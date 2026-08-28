import { useState } from 'react';
import { StudioDocumentCanvas, StudioLanding, StudioProcessing, StudioResult, StudioSidebarFrame, StudioWorkspace } from '../components/PdfStudio';
import { postForm } from '../lib/api';
import { useSinglePdf } from '../lib/useSinglePdf';
import { landingSeoFrom, usePageSeo } from '../lib/usePageSeo';
import { useI18n } from '../i18n';

type PageFormat = 'n' | 'n_of_n' | 'page_n' | 'page_n_of_n';
type PagePosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

const POSITIONS: { id: PagePosition; dot: string; label: 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight' }[] = [
  { id: 'top-left', dot: 'tl', label: 'topLeft' },
  { id: 'top-center', dot: 'tc', label: 'topCenter' },
  { id: 'top-right', dot: 'tr', label: 'topRight' },
  { id: 'bottom-left', dot: 'bl', label: 'bottomLeft' },
  { id: 'bottom-center', dot: 'bc', label: 'bottomCenter' },
  { id: 'bottom-right', dot: 'br', label: 'bottomRight' }
];

function PageNumbers() {
  const { m, t, locale } = useI18n();
  usePageSeo(m.numberPages.seoTitle, m.numberPages.seoDescription);
  const pdf = useSinglePdf();
  const [format, setFormat] = useState<PageFormat>('n_of_n');
  const [position, setPosition] = useState<PagePosition>('bottom-center');
  const [start, setStart] = useState(1);
  const [color, setColor] = useState('#4b5563');
  const [activePage, setActivePage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const pageCount = Math.max(1, pdf.thumbs.length);
  const last = start + pageCount - 1;

  const labelFor = (n: number) => {
    const vars = { n, total: last };
    if (format === 'n') return t(m.numberPages.formatN, vars);
    if (format === 'page_n') return t(m.numberPages.formatPageN, vars);
    if (format === 'page_n_of_n') return t(m.numberPages.formatPageNOfN, vars);
    return t(m.numberPages.formatNOfN, vars);
  };

  const handleApply = async () => {
    if (!pdf.file) return;
    setIsProcessing(true);
    pdf.setError(null);
    setProgress(25);
    try {
      const formData = new FormData();
      formData.append('file', pdf.file);
      formData.append('format', format);
      formData.append('position', position);
      formData.append('start', String(start));
      formData.append('color', color);
      formData.append('locale', locale);
      setProgress(60);
      const result = await postForm('/api/pages/numbers', formData);
      setProgress(100);
      pdf.setDownloadUrl(result.downloadUrl);
    } catch (err) {
      pdf.setError(err instanceof Error ? err.message : m.numberPages.fail);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  if (pdf.downloadUrl) {
    return (
      <StudioResult
        title={m.numberPages.doneTitle}
        text={m.numberPages.doneText}
        downloadUrl={pdf.downloadUrl}
        downloadName="pages-numerotees.pdf"
        resetLabel={m.numberPages.reset}
        onReset={pdf.reset}
        previewSrc={pdf.thumbs[0]}
        sourceName={pdf.file?.name}
      />
    );
  }

  if (isProcessing) {
    return <StudioProcessing label={m.numberPages.running} progress={progress} onCancel={pdf.reset} />;
  }

  if (!pdf.file) {
    return (
      <StudioLanding
        title={m.numberPages.title}
        subtitle={m.numberPages.subtitle}
        pickerId={pdf.pickerId}
        isDragging={pdf.isDragging}
        isLoading={pdf.isLoading}
        error={pdf.error}
        features={m.numberPages.features}
        seo={landingSeoFrom(m.numberPages)}
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
          activePage={activePage}
          onActivePageChange={setActivePage}
          overlay={<span className={`pagenum-preview ${position}`} style={{ color }}>{labelFor(start + activePage)}</span>}
        />
      )}
      sidebar={(
        <StudioSidebarFrame
          title={m.numberPages.title}
          tip={m.numberPages.tip}
          error={pdf.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={isProcessing ? m.numberPages.running : m.numberPages.action}
          onAction={() => void handleApply()}
          disabled={false}
          onChangeFile={pdf.reset}
        >
          <div className="studio-field">
            <label>{m.numberPages.format}</label>
            <div className="studio-modes two-col">
              {([
                ['n', m.numberPages.formatN],
                ['n_of_n', m.numberPages.formatNOfN],
                ['page_n', m.numberPages.formatPageN],
                ['page_n_of_n', m.numberPages.formatPageNOfN]
              ] as const).map(([id, template]) => (
                <button type="button" key={id} className={format === id ? 'active' : ''} onClick={() => setFormat(id)}>
                  <b>{t(template, { n: start, total: last })}</b>
                </button>
              ))}
            </div>
          </div>
          <div className="studio-field">
            <label>{m.numberPages.position}</label>
            <div className="page-pos">
              {POSITIONS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={position === item.id ? 'active' : ''}
                  aria-label={m.numberPages[item.label]}
                  title={m.numberPages[item.label]}
                  onClick={() => setPosition(item.id)}
                >
                  <i className={item.dot} />
                </button>
              ))}
            </div>
          </div>
          <div className="studio-field">
            <label htmlFor="page-start">{m.numberPages.start}</label>
            <input
              id="page-start"
              type="number"
              min={1}
              max={9999}
              value={start}
              onChange={(event) => setStart(Math.min(9999, Math.max(1, Number(event.target.value) || 1)))}
            />
          </div>
          <label className="studio-color">
            {m.numberPages.color}
            <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
          </label>
        </StudioSidebarFrame>
      )}
    />
  );
}

export default PageNumbers;
