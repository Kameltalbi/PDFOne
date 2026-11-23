import { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link, useLocaleNavigate } from '../components/LocaleLink';
import { HOME_BEYOND, HOME_PROOF } from '../content/brandPages';
import { urlLocaleFromPath } from '../i18n/localePath';
import { AdBanner } from '../components/AdBanner';
import { useI18n } from '../i18n';
import { useJsonLd, websiteJsonLd } from '../lib/jsonLd';
import { usePageSeo } from '../lib/usePageSeo';
import { useUpgrade } from '../lib/upgrade';
import { maxFileBytes, maxFileLabel } from '../lib/limits';
import { catalogEntries } from '../lib/toolCatalog';
import { useBilling } from '../lib/billing';
import { formatFileSize } from '../lib/api';
import { trackFileUpload } from '../lib/analytics';
import type { IncomingPdfState } from '../lib/incomingPdf';
import './Home.css';

type HomeFileKind = 'pdf' | 'word' | 'image';
type ActionGlyph = 'compress' | 'merge' | 'split' | 'edit' | 'sign' | 'word' | 'doc' | 'image';

const ACCEPT = [
  'application/pdf,.pdf',
  '.doc,.docx,.odt,.rtf',
  'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.oasis.opendocument.text,application/rtf,text/rtf',
  'image/jpeg,image/png,.jpg,.jpeg,.png'
].join(',');

const WORD_EXT = /\.(doc|docx|odt|rtf)$/i;
const IMAGE_EXT = /\.(jpe?g|png)$/i;

function homeFileKind(file: File): HomeFileKind | null {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  if (type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (
    type === 'application/msword'
    || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    || type === 'application/vnd.oasis.opendocument.text'
    || type === 'application/rtf'
    || type === 'text/rtf'
    || WORD_EXT.test(name)
  ) return 'word';
  if (type === 'image/jpeg' || type === 'image/jpg' || type === 'image/pjpeg' || type === 'image/png' || IMAGE_EXT.test(name)) return 'image';
  return null;
}

function ActionIcon({ glyph }: { glyph: ActionGlyph }) {
  if (glyph === 'compress') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 12h6.5M4 12l3.2-3.2M4 12l3.2 3.2M20 12h-6.5M20 12l-3.2-3.2M20 12l-3.2 3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (glyph === 'merge') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="7" width="9" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <rect x="11" y="5" width="9" height="11" rx="2" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (glyph === 'split') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="7.2" cy="7.2" r="2.1" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="7.2" cy="16.8" r="2.1" stroke="currentColor" strokeWidth="1.7" />
        <path d="m9 8.6 9.2 7.2M9 15.4 18.2 8.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  if (glyph === 'edit') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 20h4.2L19.2 9a1.8 1.8 0 0 0 0-2.5L17.5 4.8a1.8 1.8 0 0 0-2.5 0L4 15.8V20Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="m13.6 6.2 4.2 4.2" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (glyph === 'sign') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 16.5c2-2.2 3.2-2.6 5-.9 2 1.9 2.6-2.2 4.8-.2 1.6 1.4 2.6 1.6 6.2-.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M14 5.5 18 9.5 10.5 17l-3.2.7.7-3.2L14 5.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }
  if (glyph === 'image') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="9" cy="10" r="1.4" fill="currentColor" />
        <path d="m7 16 3.2-3.2a1 1 0 0 1 1.4 0L17 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 4.5h7.2L19 9.2V19a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 6 19V6A1.5 1.5 0 0 1 7.5 4.5H7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M14 4.8V9h4.2M8.2 13.2h7.6M8.2 16.4h5.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function HeroArt() {
  return (
    <svg className="pro-hero-svg" viewBox="0 0 640 500" fill="none" aria-hidden="true">
      <ellipse cx="372" cy="268" rx="236" ry="176" fill="#E7EEFF" />
      <ellipse cx="448" cy="214" rx="148" ry="128" fill="#F4E9FF" />
      <path d="M132 392h392c10 0 14 8 11 16l-10 18c-1.4 2.6-4 4.2-7 4.2H142c-3 0-5.6-1.6-7-4.2l-10-18c-3-8 1-16 7-16Z" fill="#D7DEEA" />
      <path d="M176 392h304c8 0 10 4 8 8H168c-2-4 0-8 8-8Z" fill="#F4F7FB" />
      <rect x="176" y="132" width="300" height="204" rx="18" fill="#1B2437" />
      <rect x="190" y="146" width="272" height="176" rx="8" fill="#F8FAFC" />
      <g className="pro-float" transform="translate(248 86) rotate(-7)">
        <rect width="176" height="220" rx="12" fill="#fff" stroke="#E6EAF2" />
        <rect x="48" y="20" width="80" height="30" rx="5" fill="#EF3438" />
        <text x="88" y="41" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="800" fontFamily="Inter, ui-sans-serif, system-ui, sans-serif">PDF</text>
        <rect x="22" y="68" width="132" height="8" rx="4" fill="#E7EDF5" />
        <rect x="22" y="86" width="108" height="8" rx="4" fill="#E7EDF5" />
        <rect x="22" y="104" width="120" height="8" rx="4" fill="#E7EDF5" />
        <rect x="22" y="130" width="132" height="40" rx="7" fill="#F3F6FB" />
        <rect x="22" y="184" width="84" height="8" rx="4" fill="#E7EDF5" />
      </g>
      <g className="pro-float" transform="translate(78 168)">
        <rect width="62" height="62" rx="16" fill="#fff" />
        <rect x="9" y="9" width="44" height="44" rx="12" fill="#FFE4E8" />
        <path d="M20 31h8M20 31l3.2-3.2M20 31l3.2 3.2M42 31h-8M42 31l-3.2-3.2M42 31l-3.2 3.2" stroke="#EF3438" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="pro-float" transform="translate(108 292)">
        <rect width="58" height="58" rx="16" fill="#fff" />
        <rect x="8" y="8" width="42" height="42" rx="12" fill="#FFE8EA" />
        <rect x="16" y="20" width="16" height="18" rx="3" stroke="#EF3438" strokeWidth="1.7" />
        <rect x="26" y="16" width="16" height="18" rx="3" fill="#fff" stroke="#EF3438" strokeWidth="1.7" />
      </g>
      <g className="pro-float" transform="translate(286 42)">
        <rect width="58" height="58" rx="16" fill="#fff" />
        <rect x="8" y="8" width="42" height="42" rx="12" fill="#E7F0FF" />
        <text x="29" y="37" textAnchor="middle" fill="#1769FF" fontSize="20" fontWeight="800" fontFamily="Inter, ui-sans-serif, system-ui, sans-serif">W</text>
      </g>
      <g className="pro-float" transform="translate(468 78)">
        <rect width="58" height="58" rx="16" fill="#fff" />
        <rect x="8" y="8" width="42" height="42" rx="12" fill="#FFF1E4" />
        <circle cx="22" cy="22" r="3" stroke="#F59E0B" strokeWidth="1.7" />
        <circle cx="22" cy="36" r="3" stroke="#F59E0B" strokeWidth="1.7" />
        <circle cx="36" cy="29" r="3" stroke="#F59E0B" strokeWidth="1.7" />
        <path d="M24.4 24.2 33.4 28M24.4 33.8 33.4 30" stroke="#F59E0B" strokeWidth="1.7" strokeLinecap="round" />
      </g>
      <g className="pro-float" transform="translate(520 188)">
        <rect width="58" height="58" rx="16" fill="#fff" />
        <rect x="8" y="8" width="42" height="42" rx="12" fill="#FFF6D8" />
        <path d="M20 38 34 18l4 4L24 42h-4v-4Z" stroke="#E0A106" strokeWidth="1.7" strokeLinejoin="round" />
      </g>
      <g className="pro-float" transform="translate(498 292)">
        <rect width="58" height="58" rx="16" fill="#fff" />
        <rect x="8" y="8" width="42" height="42" rx="12" fill="#E7F0FF" />
        <path d="M16 34c4-5 7-6 11-2 3 3 5-3 9-1" stroke="#1769FF" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Home() {
  const { m, t, locale } = useI18n();
  const urlLocale = urlLocaleFromPath(useLocation().pathname);
  usePageSeo(m.home.seoTitle, m.home.seoDescription);
  useJsonLd('one2pdf-website', websiteJsonLd());
  const navigate = useLocaleNavigate();
  const { status } = useBilling();
  const { allowFiles } = useUpgrade();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [kind, setKind] = useState<HomeFileKind | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxBytes = maxFileBytes(status.paid);
  const sizeLabel = maxFileLabel(status.paid);
  const catalog = catalogEntries(m, locale === urlLocale ? urlLocale : locale);

  const acceptIncoming = (list: FileList | File[]) => {
    const incoming = Array.from(list);
    if (incoming.length === 0) return;
    const tagged = incoming.map((file) => ({ file, kind: homeFileKind(file) }));
    if (tagged.some((item) => !item.kind)) {
      setError(m.home.unsupportedType);
      return;
    }
    const nextKind = tagged[0].kind as HomeFileKind;
    if (tagged.some((item) => item.kind !== nextKind)) {
      setError(m.home.mixedTypes);
      return;
    }
    const accepted = allowFiles(tagged.map((item) => item.file));
    if (accepted.length === 0) return;
    const withinLimit = accepted.filter((file) => file.size <= maxBytes);
    const oversized = accepted.find((file) => file.size > maxBytes);
    if (withinLimit.length === 0) {
      if (oversized) setError(t(m.common.fileTooLarge, { name: oversized.name, size: sizeLabel }));
      return;
    }
    const cap = nextKind === 'image' ? 20 : nextKind === 'pdf' ? 10 : 1;
    const kept = withinLimit.slice(0, cap);
    if (oversized) setError(t(m.common.fileTooLarge, { name: oversized.name, size: sizeLabel }));
    else if (withinLimit.length > cap) setError(t(m.common.maxFiles, { count: cap }));
    else setError(null);
    setKind(nextKind);
    setFiles(kept);
    trackFileUpload(kept[0]);
  };

  const openPicker = () => inputRef.current?.click();

  const clearFiles = () => {
    setFiles([]);
    setKind(null);
    setError(null);
  };

  const removeFile = (index: number) => {
    const next = files.filter((_, itemIndex) => itemIndex !== index);
    setFiles(next);
    if (next.length === 0) setKind(null);
  };

  const goWithFile = (path: string) => {
    if (!kind || files.length === 0) return;
    const payload = path === '/merge' || path === '/jpg-to-pdf' ? files : [files[0]];
    navigate(path, {
      state: {
        incomingPdf: payload[0],
        ...(payload.length > 1 ? { incomingFiles: payload } : {})
      } satisfies IncomingPdfState
    });
  };

  const actions: { label: string; path: string; glyph: ActionGlyph }[] = kind === 'word'
    ? [{ label: m.tools.wordToPdf, path: '/word-to-pdf', glyph: 'doc' }]
    : kind === 'image'
      ? [{ label: m.tools.jpgToPdf, path: '/jpg-to-pdf', glyph: 'image' }]
      : [
        { label: m.tools.compress, path: '/compress', glyph: 'compress' },
        { label: m.tools.edit, path: '/edit-pdf', glyph: 'edit' },
        { label: m.tools.split, path: '/split', glyph: 'split' },
        { label: m.tools.merge, path: '/merge', glyph: 'merge' },
        { label: m.home.shortcutSign, path: '/fill-sign-pdf', glyph: 'sign' },
        { label: m.tools.pdfToWord, path: '/pdf-to-word', glyph: 'word' }
      ];

  const tools: { name: string; description: string; path: string; glyph: ActionGlyph; tone: string }[] = [
    { name: m.tools.compress, description: m.home.toolCompressDesc, path: '/compress', glyph: 'compress', tone: 'red' },
    { name: m.tools.merge, description: m.home.toolMergeDesc, path: '/merge', glyph: 'merge', tone: 'violet' },
    { name: m.tools.split, description: m.home.toolSplitDesc, path: '/split', glyph: 'split', tone: 'orange' },
    { name: m.tools.pdfToWord, description: m.home.toolPdfToWordDesc, path: '/pdf-to-word', glyph: 'word', tone: 'blue' },
    { name: m.tools.wordToPdf, description: m.home.toolWordToPdfDesc, path: '/word-to-pdf', glyph: 'doc', tone: 'blue' },
    { name: m.tools.edit, description: m.home.toolEditDesc, path: '/edit-pdf', glyph: 'edit', tone: 'green' }
  ];

  const perks = [
    { title: m.home.perkFast, text: m.home.perkFastText, tone: 'fast', icon: 'bolt' },
    { title: m.home.perkSecure, text: m.home.perkSecureText, tone: 'secure', icon: 'shield' },
    { title: m.home.perkPrivate, text: m.home.perkPrivateText, tone: 'private', icon: 'trash' }
  ] as const;

  return <div className="pro-home">
    <main>
      <section className="pro-hero">
        <div className="pro-hero-inner">
          <div className="pro-hero-copy">
            <h1>
              <span className="pro-hero-title-main">{m.home.title}</span>
              <span className="pro-hero-title-accent">{m.home.titleAccent}</span>
            </h1>
            <p className="pro-hero-lede">{m.home.subtitle}</p>
            <ul className="pro-perks">
              {perks.map((perk) => (
                <li key={perk.tone}>
                  <span className={`pro-perk-icon ${perk.tone}`} aria-hidden="true">
                    {perk.icon === 'bolt' && (
                      <svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" fill="currentColor" /></svg>
                    )}
                    {perk.icon === 'shield' && (
                      <svg viewBox="0 0 24 24" fill="none"><path d="M12 3 5 6v6.2c0 4.2 2.8 7 7 8.3 4.2-1.3 7-4.1 7-8.3V6l-7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="m8.8 12.1 2.2 2.2 4.3-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    )}
                    {perk.icon === 'trash' && (
                      <svg viewBox="0 0 24 24" fill="none"><path d="M5 7h14M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M8 7l.7 12.1A1.5 1.5 0 0 0 10.2 20.5h3.6a1.5 1.5 0 0 0 1.5-1.4L16 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    )}
                  </span>
                  <span>
                    <strong>{perk.title}</strong>
                    <span>{perk.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pro-hero-art">
            <HeroArt />
          </div>
        </div>
      </section>

      <section className="pro-import">
        {files.length > 0 && kind ? (
          <div className="pro-chooser" role="region" aria-label={m.home.chooseActionTitle}>
            <div className="pro-file-list">
              {files.map((file, index) => (
                <div className="pro-file-row" key={`${file.name}-${file.size}-${file.lastModified}`}>
                  <span className={`pro-file-mark ${kind}`} aria-hidden="true">{kind === 'pdf' ? 'PDF' : kind === 'word' ? 'W' : 'IMG'}</span>
                  <span className="pro-file-copy">
                    <strong title={file.name}>{file.name}</strong>
                    <span>{formatFileSize(file.size)}</span>
                  </span>
                  <button type="button" onClick={() => removeFile(index)} aria-label={t(m.merge.remove, { name: file.name })}>×</button>
                </div>
              ))}
            </div>
            <button type="button" className="pro-file-change" onClick={() => { clearFiles(); openPicker(); }}>{m.home.chooseActionChange}</button>
            <h2 className="pro-chooser-title" id="home-action-title">{m.home.chooseActionTitle}</h2>
            <div className="pro-chooser-grid" role="group" aria-labelledby="home-action-title">
              {actions.map((action) => (
                <button key={action.path} type="button" onClick={() => goWithFile(action.path)}>
                  <span className={`pro-action-icon ${action.glyph}`} aria-hidden="true"><ActionIcon glyph={action.glyph} /></span>
                  {action.label}
                </button>
              ))}
            </div>
            <p className="pro-drop-meta">{status.paid ? t(m.home.dropHintPaid, { size: sizeLabel }) : t(m.home.dropHint, { size: sizeLabel })}</p>
          </div>
        ) : (
          <div
            className={`pro-drop${isDragging ? ' over' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={m.home.dropAria}
            onClick={openPicker}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openPicker();
              }
            }}
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              acceptIncoming(event.dataTransfer.files);
            }}
          >
            <span className="pro-drop-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <path d="M14 8.5h13.2L34 15.2V36a3.5 3.5 0 0 1-3.5 3.5h-16A3.5 3.5 0 0 1 11 36V12a3.5 3.5 0 0 1 3.5-3.5H14Z" stroke="#8AA0C2" strokeWidth="1.8" />
                <path d="M27 8.8V15h6.2" stroke="#8AA0C2" strokeWidth="1.8" strokeLinejoin="round" />
                <circle cx="33" cy="33" r="9" fill="#1769FF" />
                <path d="M33 29.2v7.2M30.2 32.2 33 29.2l2.8 3" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="pro-drop-title" id="home-import-title">{m.home.dropTitle}</span>
            <span className="pro-drop-choose">{m.home.dropChoose}</span>
            <span className="pro-drop-cta">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 13.5V4.8M6.6 8.1 10 4.6l3.4 3.5M4.2 15.4h11.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {m.home.dropCta}
            </span>
            <p className="pro-drop-meta">{status.paid ? t(m.home.dropHintPaid, { size: sizeLabel }) : t(m.home.dropHint, { size: sizeLabel })}</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="pro-drop-input"
          tabIndex={-1}
          onChange={(event) => {
            if (event.target.files) acceptIncoming(event.target.files);
            event.target.value = '';
          }}
        />
        {error && <p className="pro-drop-error" role="alert">{error}</p>}
      </section>

      <section className="pro-tools-section" id="popular-tools" aria-labelledby="home-popular-title">
        <h2 className="pro-popular-title" id="home-popular-title">{m.home.popularTitle}</h2>
        <div className="pro-tools-grid">
          {tools.map((tool) => (
            <Link key={tool.path} to={tool.path} className="pro-tool-card">
              <span className={`pro-tool-icon ${tool.tone}`} aria-hidden="true"><ActionIcon glyph={tool.glyph} /></span>
              <span className="pro-tool-copy"><h3>{tool.name}</h3><p>{tool.description}</p></span>
              <span className="pro-tool-arrow" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none"><path d="M7 4.5 12.5 10 7 15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </Link>
          ))}
        </div>
        <AdBanner />
      </section>

      {locale === 'en' && (
        <section className="pro-beyond" aria-labelledby="home-beyond-title">
          <div className="pro-section-heading">
            <div>
              <span>{HOME_BEYOND.label}</span>
              <h2 id="home-beyond-title">{HOME_BEYOND.title}</h2>
            </div>
          </div>
          <p className="pro-catalog-lead">{HOME_PROOF.join(' · ')}</p>
          <p className="pro-catalog-lead">{HOME_BEYOND.text}</p>
          <ul className="pro-beyond-list">
            {HOME_BEYOND.links.map((item) => (
              <li key={item.href}><Link to={item.href}>{item.label}</Link></li>
            ))}
          </ul>
        </section>
      )}

      <section className="pro-catalog" aria-labelledby="home-all-tools">
        <div className="pro-section-heading">
          <div>
            <span>{m.tools.catalogEyebrow}</span>
            <h2 id="home-all-tools">{m.tools.catalogTitle}</h2>
          </div>
          <Link to="/tools">{m.home.seeAllTools} <b>→</b></Link>
        </div>
        <p className="pro-catalog-lead">{m.tools.catalogSubtitle}</p>
        <ul className="pro-catalog-list">
          {catalog.map((tool) => (
            <li key={tool.id}>
              <Link to={tool.path}>{tool.label}</Link>
              <p>{tool.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="pro-free-value" aria-labelledby="home-free-value-title">
        <div className="pro-free-value-inner">
          <header className="pro-free-value-intro">
            <span className="pro-section-label">{m.home.freeValueLabel}</span>
            <h2 id="home-free-value-title">{m.home.freeValueTitle}</h2>
            <p>{m.home.freeValueText}</p>
          </header>
          <div className="pro-free-value-grid">
            <article>
              <span className="pro-free-value-icon" aria-hidden="true">✓</span>
              <h3>{m.home.freeValueFreeTitle}</h3>
              <p>{m.home.freeValueFreeText}</p>
            </article>
            <article>
              <span className="pro-free-value-icon" aria-hidden="true">⚡</span>
              <h3>{m.home.freeValueSimpleTitle}</h3>
              <p>{m.home.freeValueSimpleText}</p>
            </article>
            <article>
              <span className="pro-free-value-icon" aria-hidden="true">◎</span>
              <h3>{m.home.freeValueSecureTitle}</h3>
              <p>{m.home.freeValueSecureText}</p>
            </article>
          </div>
          <div className="pro-free-value-cta">
            <Link to="/tools" className="pro-btn secondary">{m.home.freeValueCta}</Link>
          </div>
        </div>
      </section>

      <section className="pro-values" aria-label={m.home.value1Title}>
        <article><span>⌁</span><h3>{m.home.value1Title}</h3><p>{m.home.value1Text}</p></article>
        <article><span>◈</span><h3>{m.home.value2Title}</h3><p>{m.home.value2Text}</p></article>
        <article><span>◎</span><h3>{m.home.value3Title}</h3><p>{m.home.value3Text}</p></article>
        <article><span>◇</span><h3>{m.home.value4Title}</h3><p>{m.home.value4Text}</p></article>
      </section>

      <section className="pro-privacy" aria-labelledby="home-privacy-title">
        <div className="pro-privacy-inner">
          <div className="pro-privacy-icon" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M16 3 6 7.5v8.2c0 6.2 4.1 10.4 10 12.3 5.9-1.9 10-6.1 10-12.3V7.5L16 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="m11.4 16.1 3.1 3.1 6.1-6.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="pro-privacy-copy">
            <p className="pro-privacy-kicker">{m.home.privacyKicker}</p>
            <h2 id="home-privacy-title">{m.home.privacyTitle}</h2>
            <p>{m.home.privacyText}</p>
            <ul>
              <li>{m.home.privacyNeverStored}</li>
              <li>{m.home.privacyAutoDelete}</li>
              <li>{m.home.privacyNoShare}</li>
            </ul>
            <Link to="/privacy" className="pro-privacy-link">{m.home.privacyLearnMore} →</Link>
          </div>
        </div>
      </section>

      <section className="pro-process">
        <div className="pro-process-copy"><span className="pro-section-label">{m.home.processLabel}</span><h2>{m.home.processTitle}</h2><p>{m.home.processText}</p><Link to="/edit-pdf" className="pro-text-link">{m.home.processCta} <span>→</span></Link></div>
        <div className="pro-steps">
          <article><span>01</span><div><h3>{m.home.step1Title}</h3><p>{m.home.step1Text}</p></div></article>
          <article><span>02</span><div><h3>{m.home.step2Title}</h3><p>{m.home.step2Text}</p></div></article>
          <article><span>03</span><div><h3>{m.home.step3Title}</h3><p>{m.home.step3Text}</p></div></article>
        </div>
      </section>

      <section className="pro-final-cta">
        <div>
          <span>{m.home.ctaLabel}</span>
          <h2>{m.home.ctaTitle}</h2>
          <p>{m.home.ctaText}</p>
        </div>
        <Link to="/tools" className="pro-btn light">{m.home.ctaButton} <span>→</span></Link>
      </section>
    </main>
  </div>;
}

export default Home;
