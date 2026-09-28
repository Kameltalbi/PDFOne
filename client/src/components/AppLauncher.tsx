import { useEffect, useId, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import type { Locale } from '../i18n/types';

export type One2AppIcon = 'pdf' | 'image' | 'video';

/**
 * One2 products shown in the header launcher.
 * Append an entry when another application goes live. Leave `href` empty for the app the visitor is already using.
 */
export type One2App = {
  id: string;
  name: string;
  href?: string;
  current?: boolean;
  icon: One2AppIcon;
};

export const ONE2_APPS: One2App[] = [
  { id: 'one2pdf', name: 'One2PDF', current: true, icon: 'pdf' },
  { id: 'one2image', name: 'One2Image', href: 'https://www.one2image.com', icon: 'image' },
  { id: 'one2video', name: 'One2Video', href: 'https://one2video.com', icon: 'video' }
];

const PANEL_TITLE = 'Applications One2';

const APP_COPY: Record<Locale, { current: string; pdf: string; image: string; video: string }> = {
  en: { current: 'Current application', pdf: 'PDF tools', image: 'Image tools', video: 'Video tools' },
  fr: { current: 'Application actuelle', pdf: 'Outils PDF', image: 'Outils image', video: 'Outils vidéo' },
  es: { current: 'Aplicación actual', pdf: 'Herramientas PDF', image: 'Herramientas de imagen', video: 'Herramientas de vídeo' },
  de: { current: 'Aktuelle Anwendung', pdf: 'PDF-Werkzeuge', image: 'Bildwerkzeuge', video: 'Videowerkzeuge' },
  pt: { current: 'Aplicação atual', pdf: 'Ferramentas PDF', image: 'Ferramentas de imagem', video: 'Ferramentas de vídeo' },
  it: { current: 'Applicazione attuale', pdf: 'Strumenti PDF', image: 'Strumenti immagine', video: 'Strumenti video' },
  tr: { current: 'Geçerli uygulama', pdf: 'PDF araçları', image: 'Görsel araçları', video: 'Video araçları' },
  ar: { current: 'التطبيق الحالي', pdf: 'أدوات PDF', image: 'أدوات الصور', video: 'أدوات الفيديو' }
};

function DotsIcon() {
  const points = [2.2, 9, 15.8];
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true">
      {points.flatMap((y) => points.map((x) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.35" fill="currentColor" />
      )))}
    </svg>
  );
}

function AppMark({ icon }: { icon: One2AppIcon }) {
  return (
    <span className={`app-mark app-mark-${icon}`} aria-hidden="true">
      {icon === 'pdf' && (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M7.2 3.5h6.4L18.5 8.2V19.2a1.6 1.6 0 0 1-1.6 1.6H7.2a1.6 1.6 0 0 1-1.6-1.6V5.1a1.6 1.6 0 0 1 1.6-1.6Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M13.4 3.7V8.2h4.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      )}
      {icon === 'image' && (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <rect x="3.5" y="4.5" width="17" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="8.5" cy="9" r="1.4" fill="currentColor" />
          <path d="M4.5 16.5 9 12.2l3 2.8 2.2-2 5.3 4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      )}
      {icon === 'video' && (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <rect x="3.5" y="5.5" width="17" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M10.2 9.2v5.6l4.8-2.8-4.8-2.8Z" fill="currentColor" />
        </svg>
      )}
    </span>
  );
}

export function AppLauncher() {
  const { locale } = useI18n();
  const copy = APP_COPY[locale];
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="app-launcher" ref={rootRef}>
      <button
        type="button"
        className="app-launcher-trigger"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={panelId}
        aria-label={PANEL_TITLE}
        onClick={() => setOpen((value) => !value)}
      >
        <DotsIcon />
      </button>
      {open && (
        <div id={panelId} className="app-launcher-panel" role="region" aria-label={PANEL_TITLE}>
          <p className="app-launcher-title">{PANEL_TITLE}</p>
          <ul className="app-launcher-list">
            {ONE2_APPS.map((app) => {
              const body = (
                <>
                  <AppMark icon={app.icon} />
                  <span className="app-launcher-copy">
                    <strong>{app.name}</strong>
                    <span>{copy[app.icon]}</span>
                    {app.current && <em>{copy.current}</em>}
                  </span>
                </>
              );
              return (
                <li key={app.id}>
                  {app.current || !app.href ? (
                    <div className="app-launcher-item current" aria-current="page">{body}</div>
                  ) : (
                    <a className="app-launcher-item" href={app.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                      {body}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
