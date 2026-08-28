import type { ReactNode } from 'react';
import { useState } from 'react';
import { StudioDocumentCanvas, StudioLanding, StudioResult, StudioSidebarFrame, StudioWorkspace } from './PdfStudio';
import { postForm } from '../lib/api';
import { useSinglePdf } from '../lib/useSinglePdf';
import type { FeatureCopy, PageSeoCopy } from '../i18n/types';
import { landingSeoFrom, usePageSeo } from '../lib/usePageSeo';

type Copy = {
  title: string;
  subtitle: string;
  tip: string;
  action: string;
  running: string;
  fail: string;
  doneTitle: string;
  doneText: string;
  reset: string;
  features: FeatureCopy[];
} & Partial<PageSeoCopy>;

export function PdfAction({
  copy,
  endpoint,
  extra,
  extraForm,
  disabled = false,
  allowLocked = false,
  downloadName,
  downloadLabel
}: {
  copy: Copy;
  endpoint: string;
  extra?: ReactNode;
  extraForm?: (form: FormData) => void;
  disabled?: boolean;
  allowLocked?: boolean;
  downloadName: string;
  downloadLabel?: string;
}) {
  const pdf = useSinglePdf({ allPages: false, allowLocked });
  const pageSeo = copy.seoTitle && copy.seoDescription && copy.seoH2 && copy.seoP1 && copy.seoP2 && copy.seoP3
    ? {
        seoTitle: copy.seoTitle,
        seoDescription: copy.seoDescription,
        seoH2: copy.seoH2,
        seoP1: copy.seoP1,
        seoP2: copy.seoP2,
        seoP3: copy.seoP3
      }
    : undefined;
  usePageSeo(pageSeo?.seoTitle, pageSeo?.seoDescription);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultName, setResultName] = useState(downloadName);

  const run = async () => {
    if (!pdf.file) return;
    setIsProcessing(true);
    pdf.setError(null);
    setProgress(25);
    try {
      const formData = new FormData();
      formData.append('file', pdf.file);
      extraForm?.(formData);
      setProgress(55);
      const result = await postForm(endpoint, formData);
      setProgress(100);
      setResultName(result.filename || downloadName);
      pdf.setDownloadUrl(result.downloadUrl);
    } catch (error) {
      pdf.setError(error instanceof Error ? error.message : copy.fail);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    pdf.reset();
    setProgress(0);
    setResultName(downloadName);
  };

  if (pdf.downloadUrl) {
    return (
      <StudioResult
        title={copy.doneTitle}
        text={copy.doneText}
        downloadUrl={pdf.downloadUrl}
        downloadName={resultName}
        downloadLabel={downloadLabel}
        resetLabel={copy.reset}
        onReset={reset}
      />
    );
  }

  if (!pdf.file) {
    return (
      <StudioLanding
        title={copy.title}
        subtitle={copy.subtitle}
        pickerId={pdf.pickerId}
        isDragging={pdf.isDragging}
        isLoading={pdf.isLoading}
        error={pdf.error}
        features={copy.features}
        seo={pageSeo ? landingSeoFrom(pageSeo) : undefined}
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
        />
      )}
      sidebar={(
        <StudioSidebarFrame
          title={copy.title}
          tip={copy.tip}
          error={pdf.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={isProcessing ? copy.running : copy.action}
          onAction={() => void run()}
          disabled={disabled}
          onChangeFile={reset}
        >
          {extra}
        </StudioSidebarFrame>
      )}
    />
  );
}
