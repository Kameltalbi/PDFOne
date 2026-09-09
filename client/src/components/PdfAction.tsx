import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { StudioDocumentCanvas, StudioLanding, StudioProcessing, StudioResult, StudioSidebarFrame, StudioWorkspace } from './PdfStudio';
import { postForm } from '../lib/api';
import { useSinglePdf } from '../lib/useSinglePdf';
import { useBilling } from '../lib/billing';
import { useUpgrade } from '../lib/upgrade';
import { featureRequiresPro, type PremiumFeature } from '../lib/monetization';
import { trackUpgradeClick } from '../lib/analytics';
import type { FeatureCopy, PageSeoCopy } from '../i18n/types';
import { useI18n } from '../i18n';
import { faqPageJsonLd, pageUrl, useJsonLd } from '../lib/jsonLd';
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
  downloadLabel,
  extraDownloadLabel,
  premiumFeature
}: {
  copy: Copy;
  endpoint: string;
  extra?: ReactNode;
  extraForm?: (form: FormData) => void;
  disabled?: boolean;
  allowLocked?: boolean;
  downloadName: string;
  downloadLabel?: string;
  extraDownloadLabel?: string;
  /** When set, unpaid users are gated if monetization requires Pro for this feature. */
  premiumFeature?: PremiumFeature;
}) {
  const pdf = useSinglePdf({ allPages: false, allowLocked });
  const { pathname } = useLocation();
  const { m, t } = useI18n();
  const { status } = useBilling();
  const { openPremiumUpgrade } = useUpgrade();
  const pageSeo = copy.seoTitle && copy.seoDescription && copy.seoH2 && copy.seoP1 && copy.seoP2 && copy.seoP3
    ? {
        seoTitle: copy.seoTitle,
        seoDescription: copy.seoDescription,
        seoH2: copy.seoH2,
        seoP1: copy.seoP1,
        seoP2: copy.seoP2,
        seoP3: copy.seoP3,
        howTitle: copy.howTitle,
        howSteps: copy.howSteps,
        faqTitle: copy.faqTitle,
        faq: copy.faq
      } satisfies PageSeoCopy
    : undefined;
  usePageSeo(pageSeo?.seoTitle, pageSeo?.seoDescription);
  const faqJsonLd = useMemo(
    () => (pageSeo?.faq?.length ? faqPageJsonLd(pageSeo.faq, pageUrl(pathname)) : null),
    [pageSeo?.faq, pathname]
  );
  useJsonLd(`one2pdf-faq-${pathname}`, faqJsonLd);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultName, setResultName] = useState(downloadName);
  const [textDownload, setTextDownload] = useState<{ url: string; name: string } | null>(null);

  const needsPro = Boolean(
    premiumFeature
    && !status.paid
    && featureRequiresPro(status.monetization, premiumFeature)
  );

  const featureLabel = premiumFeature === 'ocr'
    ? m.upgrade.featureOcr
    : premiumFeature === 'translate'
      ? m.upgrade.featureTranslate
      : m.upgrade.featureSummarize;

  const run = async () => {
    if (!pdf.file) return;
    if (needsPro && premiumFeature) {
      openPremiumUpgrade(premiumFeature);
      return;
    }
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
      setTextDownload(result.textDownloadUrl
        ? { url: result.textDownloadUrl, name: result.textFilename || 'traduction.txt' }
        : null);
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
    setTextDownload(null);
  };

  if (pdf.downloadUrl) {
    return (
      <StudioResult
        title={copy.doneTitle}
        text={copy.doneText}
        downloadUrl={pdf.downloadUrl}
        downloadName={resultName}
        downloadLabel={downloadLabel}
        extraDownloadUrl={textDownload?.url}
        extraDownloadName={textDownload?.name}
        extraDownloadLabel={extraDownloadLabel}
        resetLabel={copy.reset}
        onReset={reset}
        previewSrc={pdf.thumbs[0]}
        sourceName={pdf.file?.name}
      />
    );
  }

  if (isProcessing) {
    return (
      <StudioProcessing
        label={copy.running}
        progress={progress}
        onCancel={reset}
      />
    );
  }

  if (!pdf.file) {
    return (
      <>
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
        {needsPro && (
          <p className="studio-premium-note" style={{ textAlign: 'center', margin: '0.75rem auto 1.5rem', maxWidth: '36rem' }}>
            {t(m.upgrade.premiumText, { feature: featureLabel })}{' '}
            <Link to="/pricing" onClick={() => trackUpgradeClick(premiumFeature || 'premium')}>{m.common.getPro}</Link>
          </p>
        )}
      </>
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
          tip={needsPro ? t(m.upgrade.premiumText, { feature: featureLabel }) : copy.tip}
          error={pdf.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={needsPro ? m.common.getPro : (isProcessing ? copy.running : copy.action)}
          onAction={() => {
            if (needsPro && premiumFeature) openPremiumUpgrade(premiumFeature);
            else void run();
          }}
          disabled={disabled}
          onChangeFile={reset}
        >
          {extra}
        </StudioSidebarFrame>
      )}
    />
  );
}
