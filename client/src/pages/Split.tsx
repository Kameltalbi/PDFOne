import { useEffect, useState } from 'react';
import { StudioLanding, StudioResult, StudioSidebarFrame, StudioWorkspace, StudioZoom } from '../components/PdfStudio';
import { postForm } from '../lib/api';
import { parsePageRanges } from '../lib/pdfPreview';
import { useSinglePdf } from '../lib/useSinglePdf';
import { usePageSeo } from '../lib/usePageSeo';
import { useI18n } from '../i18n';

function Split() {
  const { m, t } = useI18n();
  usePageSeo(m.split.seoTitle, m.split.seoDescription);
  const pdf = useSinglePdf();
  const [selected, setSelected] = useState<number[]>([]);
  const [range, setRange] = useState('');
  const [mode, setMode] = useState<'extract' | 'separate'>('extract');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setSelected(pdf.thumbs.map((_, index) => index + 1));
    setRange('');
  }, [pdf.thumbs]);

  const togglePage = (page: number) => {
    setSelected((current) => (
      current.includes(page) ? current.filter((value) => value !== page) : [...current, page].sort((a, b) => a - b)
    ));
  };

  const applyRange = () => {
    const pages = parsePageRanges(range, pdf.thumbs.length);
    if (pages.length === 0) {
      pdf.setError(m.split.invalidRange);
      return;
    }
    pdf.setError(null);
    setSelected(pages);
  };

  const handleSplit = async () => {
    if (!pdf.file) {
      pdf.setError(m.split.addFile);
      return;
    }
    if (selected.length === 0) {
      pdf.setError(m.split.selectPage);
      return;
    }

    setIsProcessing(true);
    pdf.setError(null);
    setProgress(25);
    try {
      const formData = new FormData();
      formData.append('file', pdf.file);
      formData.append('pages', JSON.stringify(selected));
      formData.append('mode', mode);
      setProgress(60);
      const result = await postForm('/api/split', formData);
      setProgress(100);
      pdf.setDownloadUrl(result.downloadUrl);
    } catch (err) {
      pdf.setError(err instanceof Error ? err.message : m.split.fail);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  if (pdf.downloadUrl) {
    return (
      <StudioResult
        title={m.split.doneTitle}
        text={mode === 'extract' ? m.split.doneExtract : m.split.doneSeparate}
        downloadUrl={pdf.downloadUrl}
        downloadName={mode === 'extract' ? 'extrait.pdf' : 'pages.zip'}
        resetLabel={m.split.reset}
        onReset={pdf.reset}
      />
    );
  }

  if (!pdf.file) {
    return (
      <StudioLanding
        title={m.split.title}
        subtitle={m.split.subtitle}
        pickerId={pdf.pickerId}
        isDragging={pdf.isDragging}
        isLoading={pdf.isLoading}
        error={pdf.error}
        features={m.split.features}
        seo={{
          h2: m.split.seoH2,
          paragraphs: [m.split.seoP1, m.split.seoP2, m.split.seoP3]
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
        <>
          <StudioZoom setZoom={pdf.setZoom} />
          <div className="studio-thumbs" style={{ ['--thumb-scale' as string]: String(pdf.zoom) }}>
            {pdf.thumbs.map((src, index) => {
              const page = index + 1;
              const isSelected = selected.includes(page);
              return (
                <article key={page} className={`studio-thumb clickable ${isSelected ? 'selected' : ''}`} onClick={() => togglePage(page)}>
                  <span className="studio-order">{page}</span>
                  {isSelected && <span className="studio-check">✓</span>}
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
          title={m.split.title}
          tip={m.split.tip}
          error={pdf.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={isProcessing ? m.split.splitting : mode === 'extract' ? m.split.extractPages : m.split.separatePages}
          onAction={() => void handleSplit()}
          disabled={selected.length === 0}
          onChangeFile={pdf.reset}
        >
          <div className="studio-modes">
            <button type="button" className={mode === 'extract' ? 'active' : ''} onClick={() => setMode('extract')}>
              <b>{m.split.extract}</b>
              <span>{m.split.extractDesc}</span>
            </button>
            <button type="button" className={mode === 'separate' ? 'active' : ''} onClick={() => setMode('separate')}>
              <b>{m.split.separate}</b>
              <span>{m.split.separateDesc}</span>
            </button>
          </div>
          <div className="studio-range">
            <label htmlFor="page-range">{m.split.rangeLabel}</label>
            <div className="studio-range-row">
              <input id="page-range" value={range} onChange={(event) => setRange(event.target.value)} placeholder={`1-${pdf.thumbs.length || 1}`} />
              <button type="button" onClick={applyRange}>{m.split.apply}</button>
            </div>
            <div className="studio-range-row">
              <button type="button" className="studio-mini" onClick={() => setSelected(pdf.thumbs.map((_, index) => index + 1))}>{m.split.all}</button>
              <button type="button" className="studio-mini" onClick={() => setSelected([])}>{m.split.none}</button>
            </div>
          </div>
          <p className="studio-count">{t(m.split.selected, { count: selected.length })}</p>
        </StudioSidebarFrame>
      )}
    />
  );
}

export default Split;
