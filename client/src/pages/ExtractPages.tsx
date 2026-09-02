import { useEffect, useState } from 'react';
import { StudioLanding, StudioProcessing, StudioResult, StudioSidebarFrame, StudioWorkspace, StudioZoom } from '../components/PdfStudio';
import { postForm } from '../lib/api';
import { parsePageRanges } from '../lib/pdfPreview';
import { useSinglePdf } from '../lib/useSinglePdf';
import { landingSeoFrom, usePageSeo } from '../lib/usePageSeo';
import { useI18n } from '../i18n';

function ExtractPages() {
  const { m, t } = useI18n();
  usePageSeo(m.extractPages.seoTitle, m.extractPages.seoDescription);
  const pdf = useSinglePdf();
  const [selected, setSelected] = useState<number[]>([]);
  const [range, setRange] = useState('');
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
      pdf.setError(m.extractPages.invalidRange);
      return;
    }
    pdf.setError(null);
    setSelected(pages);
  };

  const handleExtract = async () => {
    if (!pdf.file || selected.length === 0) return;
    setIsProcessing(true);
    pdf.setError(null);
    setProgress(25);
    try {
      const formData = new FormData();
      formData.append('file', pdf.file);
      formData.append('pages', JSON.stringify(selected));
      setProgress(60);
      const result = await postForm('/api/pages/extract', formData);
      setProgress(100);
      pdf.setDownloadUrl(result.downloadUrl);
    } catch (err) {
      pdf.setError(err instanceof Error ? err.message : m.extractPages.fail);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  if (pdf.downloadUrl) {
    return (
      <StudioResult
        title={m.extractPages.doneTitle}
        text={m.extractPages.doneText}
        downloadUrl={pdf.downloadUrl}
        downloadName="extrait.pdf"
        resetLabel={m.extractPages.reset}
        onReset={pdf.reset}
        previewSrc={pdf.thumbs[0]}
        sourceName={pdf.file?.name}
      />
    );
  }

  if (isProcessing) {
    return <StudioProcessing label={m.extractPages.running} progress={progress} onCancel={pdf.reset} />;
  }

  if (!pdf.file) {
    return (
      <StudioLanding
        title={m.extractPages.title}
        subtitle={m.extractPages.subtitle}
        pickerId={pdf.pickerId}
        isDragging={pdf.isDragging}
        isLoading={pdf.isLoading}
        error={pdf.error}
        features={m.extractPages.features}
        seo={landingSeoFrom(m.extractPages)}
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
          title={m.extractPages.title}
          tip={m.extractPages.tip}
          error={pdf.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={isProcessing ? m.extractPages.running : m.extractPages.action}
          onAction={() => void handleExtract()}
          disabled={selected.length === 0}
          onChangeFile={pdf.reset}
        >
          <div className="studio-range">
            <label htmlFor="extract-range">{m.split.rangeLabel}</label>
            <div className="studio-range-row">
              <input id="extract-range" value={range} onChange={(event) => setRange(event.target.value)} placeholder={`1-${pdf.thumbs.length || 1}`} />
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

export default ExtractPages;
