import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  StudioDocumentCanvas,
  StudioLanding,
  StudioProcessing,
  StudioSidebarFrame,
  StudioWorkspace
} from '../components/PdfStudio';
import { RelatedTools } from '../components/RelatedTools';
import { postFormData } from '../lib/api';
import { useSinglePdf } from '../lib/useSinglePdf';
import { useBilling } from '../lib/billing';
import { useUpgrade } from '../lib/upgrade';
import { featureRequiresPro } from '../lib/monetization';
import {
  trackFileDownload,
  trackFileUpload,
  trackProcessingSuccess,
  trackUpgradeClick
} from '../lib/analytics';
import { useI18n } from '../i18n';
import { landingSeoFrom, usePageSeo } from '../lib/usePageSeo';

export type SummaryMode = 'quick' | 'detailed' | 'key_points';
export type SummaryLanguage = 'same' | 'en' | 'fr' | 'es' | 'de' | 'it' | 'pt' | 'ar';

type SummarizeResult = {
  downloadUrl: string;
  filename: string;
  summary?: string;
  mode?: SummaryMode;
  language?: SummaryLanguage;
};

const MODES: SummaryMode[] = ['quick', 'detailed', 'key_points'];

export default function Summarize() {
  const { m, t } = useI18n();
  const copy = m.summarizePdf;
  const pdf = useSinglePdf({ allPages: false });
  const { status } = useBilling();
  const { openPremiumUpgrade } = useUpgrade();
  usePageSeo(copy.seoTitle, copy.seoDescription);

  const [mode, setMode] = useState<SummaryMode>('detailed');
  const [language, setLanguage] = useState<SummaryLanguage>('same');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SummarizeResult | null>(null);
  const [copied, setCopied] = useState(false);

  const needsPro = !status.paid && featureRequiresPro(status.monetization, 'summarize');
  const analyticsExtras = {
    summary_mode: mode,
    summary_language: (language === 'same' ? 'same_as_document' : language) as
      | 'same_as_document'
      | 'en'
      | 'fr'
      | 'es'
      | 'de'
      | 'it'
      | 'pt'
      | 'ar'
  };

  const modeLabel = (value: SummaryMode) => {
    if (value === 'quick') return copy.modeQuick;
    if (value === 'key_points') return copy.modeKeyPoints;
    return copy.modeDetailed;
  };

  const modeHint = (value: SummaryMode) => {
    if (value === 'quick') return copy.modeQuickHint;
    if (value === 'key_points') return copy.modeKeyPointsHint;
    return copy.modeDetailedHint;
  };

  const languageLabel = (value: SummaryLanguage) => {
    if (value === 'same') return copy.languageSame;
    if (value === 'en') return copy.langEn;
    if (value === 'fr') return copy.langFr;
    if (value === 'es') return copy.langEs;
    if (value === 'de') return copy.langDe;
    if (value === 'it') return copy.langIt;
    if (value === 'pt') return copy.langPt;
    return copy.langAr;
  };

  const languageOptions: SummaryLanguage[] = ['same', 'en', 'fr', 'es', 'de', 'it', 'pt', 'ar'];

  const loadFile = async (files: FileList | File[]) => {
    await pdf.loadFile(files);
    const file = files instanceof FileList ? files[0] : files[0];
    if (file) trackFileUpload(file, 'summarize_pdf');
  };

  const run = async () => {
    if (!pdf.file) return;
    if (needsPro) {
      trackUpgradeClick('summarize');
      openPremiumUpgrade('summarize');
      return;
    }
    setIsProcessing(true);
    pdf.setError(null);
    setProgress(25);
    const startedAt = Date.now();
    try {
      const formData = new FormData();
      formData.append('file', pdf.file);
      formData.append('mode', mode);
      formData.append('language', language);
      setProgress(55);
      const data = await postFormData<SummarizeResult>('/api/summarize', formData, {
        toolName: 'summarize_pdf',
        extras: analyticsExtras
      });
      setProgress(100);
      setResult({
        downloadUrl: data.downloadUrl,
        filename: data.filename || 'resume.txt',
        summary: data.summary || '',
        mode: data.mode || mode,
        language: data.language || language
      });
      trackProcessingSuccess(startedAt, 'summarize_pdf', analyticsExtras);
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
    setResult(null);
    setCopied(false);
    setMode('detailed');
    setLanguage('same');
  };

  const copySummary = async () => {
    const text = result?.summary?.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const optionsPanel = (
    <>
      <div className="studio-field summarize-modes">
        <p className="summarize-modes-question" id="summary-mode-label">{copy.modeQuestion}</p>
        <div className="summarize-mode-grid" role="radiogroup" aria-labelledby="summary-mode-label">
          {MODES.map((value) => {
            const selected = mode === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`summarize-mode-card${selected ? ' is-selected' : ''}`}
                onClick={() => setMode(value)}
              >
                <strong>{modeLabel(value)}</strong>
                <span>{modeHint(value)}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="studio-field">
        <label htmlFor="summary-language">{copy.languageLabel}</label>
        <select
          id="summary-language"
          value={language}
          onChange={(event) => setLanguage(event.target.value as SummaryLanguage)}
        >
          {languageOptions.map((code) => (
            <option key={code} value={code}>{languageLabel(code)}</option>
          ))}
        </select>
      </div>
    </>
  );

  if (result) {
    const shownMode = result.mode || mode;
    const shownLang = result.language || language;
    return (
      <div className="studio-done summarize-done" aria-label={copy.doneTitle}>
        <div className="summarize-done-panel">
          <h1 className="studio-done-kicker">
            <span className="studio-done-check">✓</span>
            {copy.doneTitle}
          </h1>
          <p className="studio-done-text">{copy.doneText}</p>
          <dl className="summarize-meta">
            {pdf.file?.name && (
              <>
                <dt>{copy.documentLabel}</dt>
                <dd title={pdf.file.name}>{pdf.file.name}</dd>
              </>
            )}
            <dt>{copy.resultMode}</dt>
            <dd>{modeLabel(shownMode)}</dd>
            <dt>{copy.resultLanguage}</dt>
            <dd>{languageLabel(shownLang)}</dd>
          </dl>
          <pre className="summarize-output" dir={shownLang === 'ar' ? 'rtl' : undefined}>{result.summary}</pre>
          <div className="studio-done-row summarize-actions">
            <button type="button" className="studio-done-download" onClick={() => void copySummary()}>
              {copied ? copy.copied : copy.copy}
            </button>
            <a
              className="studio-done-secondary"
              href={result.downloadUrl}
              download={result.filename}
              onClick={() => trackFileDownload('summarize_pdf')}
            >
              {copy.download}
            </a>
          </div>
          <button type="button" className="studio-done-restart" onClick={reset}>
            ↻ {copy.reset}
          </button>
        </div>
        <RelatedTools />
      </div>
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
          seo={landingSeoFrom(copy)}
          onDragOver={() => pdf.setIsDragging(true)}
          onDragLeave={() => pdf.setIsDragging(false)}
          onDrop={pdf.onDropFiles}
          onFiles={(files) => void loadFile(files)}
        />
        {needsPro && (
          <p className="studio-premium-note" style={{ textAlign: 'center', margin: '0.75rem auto 1.5rem', maxWidth: '36rem' }}>
            {t(m.upgrade.premiumText, { feature: m.upgrade.featureSummarize })}{' '}
            <Link to="/pricing" onClick={() => trackUpgradeClick('summarize')}>{m.common.getPro}</Link>
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
          tip={needsPro ? t(m.upgrade.premiumText, { feature: m.upgrade.featureSummarize }) : copy.tip}
          error={pdf.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={needsPro ? m.common.getPro : copy.action}
          disabled={false}
          onAction={() => {
            if (needsPro) {
              trackUpgradeClick('summarize');
              openPremiumUpgrade('summarize');
            } else void run();
          }}
          onChangeFile={reset}
        >
          {optionsPanel}
        </StudioSidebarFrame>
      )}
    />
  );
}
