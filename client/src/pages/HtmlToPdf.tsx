import { useState } from 'react';
import { StudioLanding, StudioResult, StudioSidebarFrame, StudioWorkspace } from '../components/PdfStudio';
import { formatFileSize, postForm } from '../lib/api';
import { useOfficeFile } from '../lib/useOfficeFile';
import { useI18n } from '../i18n';

export default function HtmlToPdf() {
  const { m } = useI18n();
  const fileState = useOfficeFile(['.html', '.htm']);
  const [draft, setDraft] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const convert = async (file?: File, html?: string) => {
    setIsProcessing(true);
    fileState.setError(null);
    setProgress(25);
    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      if (html) formData.append('html', html);
      setProgress(55);
      const result = await postForm('/api/html-to-pdf', formData);
      setProgress(100);
      fileState.setDownloadUrl(result.downloadUrl);
    } catch (error) {
      fileState.setError(error instanceof Error ? error.message : m.htmlPdf.fail);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const useDraft = () => {
    const html = draft.trim();
    if (!html) {
      fileState.setError(m.htmlPdf.empty);
      return;
    }
    const wrapped = /<html[\s>]/i.test(html)
      ? html
      : `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`;
    const file = new File([wrapped], 'document.html', { type: 'text/html' });
    void fileState.loadFile([file]);
  };

  const reset = () => {
    fileState.reset();
    setDraft('');
    setProgress(0);
  };

  if (fileState.downloadUrl) {
    return (
      <StudioResult
        title={m.htmlPdf.doneTitle}
        text={m.htmlPdf.doneText}
        downloadUrl={fileState.downloadUrl}
        downloadName="document.pdf"
        resetLabel={m.htmlPdf.reset}
        onReset={reset}
      />
    );
  }

  if (!fileState.file) {
    return (
      <StudioLanding
        title={m.htmlPdf.title}
        subtitle={m.htmlPdf.subtitle}
        pickerId={fileState.pickerId}
        isDragging={fileState.isDragging}
        isLoading={fileState.isLoading}
        error={fileState.error}
        features={m.htmlPdf.features}
        accept=".html,.htm,text/html"
        onDragOver={() => fileState.setIsDragging(true)}
        onDragLeave={() => fileState.setIsDragging(false)}
        onDrop={fileState.onDropFiles}
        onFiles={(files) => void fileState.loadFile(files)}
      >
        <div className="studio-html-paste">
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={m.htmlPdf.pastePh} />
          <button type="button" onClick={useDraft}>{m.htmlPdf.useHtml}</button>
        </div>
      </StudioLanding>
    );
  }

  return (
    <StudioWorkspace
      canvas={(
        <article className="studio-office-file">
          <span className="studio-office-ext">HTML</span>
          <b>{fileState.file.name}</b>
          <span>{formatFileSize(fileState.file.size)}</span>
        </article>
      )}
      sidebar={(
        <StudioSidebarFrame
          title={m.htmlPdf.title}
          tip={m.htmlPdf.tip}
          error={fileState.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={isProcessing ? m.htmlPdf.running : m.htmlPdf.action}
          onAction={() => void convert(fileState.file || undefined)}
          disabled={false}
          onChangeFile={reset}
        />
      )}
    />
  );
}
