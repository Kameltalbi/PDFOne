import { useEffect, useId, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import type { Locale } from '../i18n/types';

export type LauncherIcon = 'image' | 'video' | 'wordpress';

type Copy = { products: string; extensions: string; one2image: string; one2video: string; wordpress: string };

/**
 * Header launcher sections. Append a product or an extension here when it has a real public page.
 */
export type LauncherItem = {
  id: keyof Pick<Copy, 'one2image' | 'one2video' | 'wordpress'>;
  name: string;
  href: string;
  icon: LauncherIcon;
};

export type LauncherSection = {
  id: 'products' | 'extensions';
  items: LauncherItem[];
};

export const LAUNCHER_SECTIONS: LauncherSection[] = [
  {
    id: 'products',
    items: [
      { id: 'one2image', name: 'One2Image', href: 'https://www.one2image.com', icon: 'image' },
      { id: 'one2video', name: 'One2Video', href: 'https://one2video.com', icon: 'video' }
    ]
  },
  {
    id: 'extensions',
    items: [
      { id: 'wordpress', name: 'One2Image', href: 'https://wordpress.org/plugins/one2image/', icon: 'wordpress' }
    ]
  }
];

const COPY: Record<Locale, Copy> = {
  fr: {
    products: 'Autres produits',
    extensions: 'Extensions',
    one2image: 'Optimiser, convertir et redimensionner vos images',
    one2video: 'Convertir, compresser et modifier vos vidéos',
    wordpress: 'Optimisez vos médias avec les outils One2'
  },
  en: {
    products: 'Other products',
    extensions: 'Extensions',
    one2image: 'Optimize, convert and resize your images',
    one2video: 'Convert, compress and edit your videos',
    wordpress: 'Optimize your media with One2 tools'
  },
  es: {
    products: 'Otros productos',
    extensions: 'Extensiones',
    one2image: 'Optimiza, convierte y redimensiona tus imágenes',
    one2video: 'Convierte, comprime y edita tus vídeos',
    wordpress: 'Optimiza tus medios con las herramientas One2'
  },
  de: {
    products: 'Weitere Produkte',
    extensions: 'Erweiterungen',
    one2image: 'Bilder optimieren, konvertieren und skalieren',
    one2video: 'Videos konvertieren, komprimieren und bearbeiten',
    wordpress: 'Medien mit den One2-Werkzeugen optimieren'
  },
  pt: {
    products: 'Outros produtos',
    extensions: 'Extensões',
    one2image: 'Otimizar, converter e redimensionar as suas imagens',
    one2video: 'Converter, comprimir e editar os seus vídeos',
    wordpress: 'Otimize os seus média com as ferramentas One2'
  },
  it: {
    products: 'Altri prodotti',
    extensions: 'Estensioni',
    one2image: 'Ottimizza, converti e ridimensiona le tue immagini',
    one2video: 'Converti, comprimi e modifica i tuoi video',
    wordpress: 'Ottimizza i media con gli strumenti One2'
  },
  tr: {
    products: 'Diğer ürünler',
    extensions: 'Eklentiler',
    one2image: 'Görselleri optimize edin, dönüştürün ve yeniden boyutlandırın',
    one2video: 'Videoları dönüştürün, sıkıştırın ve düzenleyin',
    wordpress: 'Ortam dosyalarınızı One2 araçlarıyla optimize edin'
  },
  ar: {
    products: 'منتجات أخرى',
    extensions: 'الإضافات',
    one2image: 'حسّن الصور وحوّلها وغيّر مقاسها',
    one2video: 'حوّل الفيديو واضغطه وعدّله',
    wordpress: 'حسّن الوسائط بأدوات One2'
  }
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

function AppMark({ icon }: { icon: LauncherIcon }) {
  return (
    <span className={`app-mark app-mark-${icon}`} aria-hidden="true">
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
      {icon === 'wordpress' && (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M5.2 6.2 8.6 17.8 12 8.4l3.4 9.4 3.4-11.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

export function AppLauncher() {
  const { locale } = useI18n();
  const copy = COPY[locale];
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
        aria-label={copy.products}
        onClick={() => setOpen((value) => !value)}
      >
        <DotsIcon />
      </button>
      {open && (
        <div id={panelId} className="app-launcher-panel" role="region" aria-label={copy.products}>
          {LAUNCHER_SECTIONS.map((section, index) => (
            <section key={section.id} className="app-launcher-section">
              {index > 0 && <hr className="app-launcher-sep" />}
              <p className="app-launcher-label">{copy[section.id]}</p>
              <ul className="app-launcher-list">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <a
                      className="app-launcher-item"
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                    >
                      <AppMark icon={item.icon} />
                      <span className="app-launcher-copy">
                        <strong>{item.name}</strong>
                        <span>{copy[item.id]}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
