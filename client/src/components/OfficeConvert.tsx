import { useState } from 'react';
import { StudioLanding, StudioResult, StudioSidebarFrame, StudioWorkspace } from './PdfStudio';
import { formatFileSize, postForm } from '../lib/api';
import { useOfficeFile } from '../lib/useOfficeFile';
import { useI18n } from '../i18n';

export type OfficeJob =
  | 'pdf-to-word'
  | 'word-to-pdf'
  | 'pdf-to-excel'
  | 'excel-to-pdf'
  | 'pdf-to-ppt'
  | 'ppt-to-pdf';

const JOBS: Record<OfficeJob, {
  accept: string;
  exts: string[];
  previewPdf: boolean;
  downloadName: string;
  download: 'word' | 'excel' | 'ppt' | 'pdf';
}> = {
  'pdf-to-word': {
    accept: 'application/pdf,.pdf',
    exts: ['.pdf'],
    previewPdf: true,
    downloadName: 'document.docx',
    download: 'word'
  },
  'word-to-pdf': {
    accept: '.doc,.docx,.odt,.rtf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    exts: ['.doc', '.docx', '.odt', '.rtf'],
    previewPdf: false,
    downloadName: 'document.pdf',
    download: 'pdf'
  },
  'pdf-to-excel': {
    accept: 'application/pdf,.pdf',
    exts: ['.pdf'],
    previewPdf: true,
    downloadName: 'classeur.xlsx',
    download: 'excel'
  },
  'excel-to-pdf': {
    accept: '.xls,.xlsx,.ods,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    exts: ['.xls', '.xlsx', '.ods', '.csv'],
    previewPdf: false,
    downloadName: 'classeur.pdf',
    download: 'pdf'
  },
  'pdf-to-ppt': {
    accept: 'application/pdf,.pdf',
    exts: ['.pdf'],
    previewPdf: true,
    downloadName: 'presentation.pptx',
    download: 'ppt'
  },
  'ppt-to-pdf': {
    accept: '.ppt,.pptx,.odp,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation',
    exts: ['.ppt', '.pptx', '.odp'],
    previewPdf: false,
    downloadName: 'presentation.pdf',
    download: 'pdf'
  }
};

function OfficeConvert({ job }: { job: OfficeJob }) {
  const { m } = useI18n();
  const spec = JOBS[job];
  const fileState = useOfficeFile(spec.exts, { previewPdf: spec.previewPdf });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const copy = {
    'pdf-to-word': { title: m.convert.pdfToWordTitle, subtitle: m.convert.pdfToWordDesc, done: m.convert.pdfToWordDone },
    'word-to-pdf': { title: m.convert.wordToPdfTitle, subtitle: m.convert.wordToPdfDesc, done: m.convert.wordToPdfDone },
    'pdf-to-excel': { title: m.convert.pdfToExcelTitle, subtitle: m.convert.pdfToExcelDesc, done: m.convert.pdfToExcelDone },
    'excel-to-pdf': { title: m.convert.excelToPdfTitle, subtitle: m.convert.excelToPdfDesc, done: m.convert.excelToPdfDone },
    'pdf-to-ppt': { title: m.convert.pdfToPptTitle, subtitle: m.convert.pdfToPptDesc, done: m.convert.pdfToPptDone },
    'ppt-to-pdf': { title: m.convert.pptToPdfTitle, subtitle: m.convert.pptToPdfDesc, done: m.convert.pptToPdfDone }
  }[job];

  const downloadLabel = spec.download === 'word'
    ? m.convert.downloadWord
    : spec.download === 'excel'
      ? m.convert.downloadExcel
      : spec.download === 'ppt'
        ? m.convert.downloadPpt
        : m.common.downloadPdf;

  const handleConvert = async () => {
    if (!fileState.file) return;
    setIsProcessing(true);
    fileState.setError(null);
    setProgress(25);
    try {
      const formData = new FormData();
      formData.append('file', fileState.file);
      setProgress(55);
      const result = await postForm(`/api/office/${job}`, formData);
      setProgress(100);
      fileState.setDownloadUrl(result.downloadUrl);
    } catch (error) {
      fileState.setError(error instanceof Error ? error.message : m.convert.fail);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    fileState.reset();
    setProgress(0);
  };

  if (fileState.downloadUrl) {
    return (
      <StudioResult
        title={m.convert.doneTitle}
        text={copy.done}
        downloadUrl={fileState.downloadUrl}
        downloadName={downloadNameFrom(fileState.file?.name, spec.downloadName)}
        downloadLabel={downloadLabel}
        resetLabel={m.convert.reset}
        onReset={reset}
      />
    );
  }

  if (!fileState.file) {
    return (
      <StudioLanding
        title={copy.title}
        subtitle={copy.subtitle}
        pickerId={fileState.pickerId}
        isDragging={fileState.isDragging}
        isLoading={fileState.isLoading}
        error={fileState.error}
        features={m.convert.features}
        accept={spec.accept}
        onDragOver={() => fileState.setIsDragging(true)}
        onDragLeave={() => fileState.setIsDragging(false)}
        onDrop={fileState.onDropFiles}
        onFiles={(files) => void fileState.loadFile(files)}
      />
    );
  }

  const ext = fileState.file.name.split('.').pop()?.toUpperCase() || 'FILE';

  return (
    <StudioWorkspace
      canvas={(
        <article className="studio-office-file">
          {fileState.thumbs[0]
            ? <img src={fileState.thumbs[0]} alt="" />
            : <span className="studio-office-ext">{ext}</span>}
          <b>{fileState.file.name}</b>
          <span>{formatFileSize(fileState.file.size)}</span>
        </article>
      )}
      sidebar={(
        <StudioSidebarFrame
          title={copy.title}
          tip={m.convert.tip}
          error={fileState.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={isProcessing ? m.convert.running : m.convert.action}
          onAction={() => void handleConvert()}
          disabled={false}
          onChangeFile={reset}
        />
      )}
    />
  );
}

function downloadNameFrom(original: string | undefined, fallback: string) {
  if (!original) return fallback;
  const base = original.replace(/\.[^.]+$/, '');
  const ext = fallback.includes('.') ? fallback.slice(fallback.lastIndexOf('.')) : '';
  return `${base}${ext}`;
}

export default OfficeConvert;
