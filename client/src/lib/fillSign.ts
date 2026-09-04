import type { PageViewport } from 'pdfjs-dist';

export type FillSignTool =
  | 'select'
  | 'text'
  | 'signature'
  | 'initials'
  | 'date'
  | 'checkbox'
  | 'check'
  | 'cross'
  | 'circle'
  | 'draw';

export type FillSignItem =
  | {
      id: string;
      type: 'text';
      page: number;
      x: number;
      y: number;
      width: number;
      height: number;
      text: string;
      size: number;
      color: string;
      bold?: boolean;
    }
  | {
      id: string;
      type: 'image';
      page: number;
      x: number;
      y: number;
      width: number;
      height: number;
      dataUrl: string;
      kind: 'signature' | 'initials' | 'image';
    }
  | {
      id: string;
      type: 'mark';
      page: number;
      x: number;
      y: number;
      width: number;
      height: number;
      kind: 'check' | 'cross' | 'checkbox' | 'circle';
      color: string;
    }
  | {
      id: string;
      type: 'drawing';
      page: number;
      color: string;
      width: number;
      points: Array<{ x: number; y: number }>;
    };

export type FormWidget = {
  id: string;
  page: number;
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown';
  x: number;
  y: number;
  width: number;
  height: number;
  options?: string[];
  radioValue?: string;
  readOnly?: boolean;
};

export function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function pdfBoxToCss(viewport: PageViewport, x: number, y: number, width: number, height: number) {
  const [x1, y1] = viewport.convertToViewportPoint(x, y + height);
  const [x2, y2] = viewport.convertToViewportPoint(x + width, y);
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  return {
    left: `${(left / viewport.width) * 100}%`,
    top: `${(top / viewport.height) * 100}%`,
    width: `${(Math.abs(x2 - x1) / viewport.width) * 100}%`,
    height: `${(Math.abs(y2 - y1) / viewport.height) * 100}%`
  };
}

export function clientToPdf(viewport: PageViewport, bounds: DOMRect, clientX: number, clientY: number) {
  const vx = ((clientX - bounds.left) / bounds.width) * viewport.width;
  const vy = ((clientY - bounds.top) / bounds.height) * viewport.height;
  const [x, y] = viewport.convertToPdfPoint(vx, vy);
  return { x, y };
}

export function cssDeltaToPdf(
  viewport: PageViewport,
  bounds: DOMRect,
  start: { x: number; y: number },
  clientX: number,
  clientY: number
) {
  const next = clientToPdf(viewport, bounds, clientX, clientY);
  return { dx: next.x - start.x, dy: next.y - start.y };
}

export function rasterizeCursive(text: string, kind: 'signature' | 'initials') {
  const canvas = document.createElement('canvas');
  canvas.width = kind === 'initials' ? 520 : 900;
  canvas.height = kind === 'initials' ? 240 : 280;
  const context = canvas.getContext('2d');
  if (!context) return '';
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#111827';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = `italic ${kind === 'initials' ? 92 : 88}px "Segoe Script", "Bradley Hand", "Snell Roundhand", "Apple Chancery", cursive`;
  context.fillText(text.slice(0, kind === 'initials' ? 8 : 48), canvas.width / 2, canvas.height / 2, canvas.width - 40);
  return canvas.toDataURL('image/png');
}

export function trimTransparentPng(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      if (!context) {
        resolve(dataUrl);
        return;
      }
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let top = canvas.height;
      let left = canvas.width;
      let right = 0;
      let bottom = 0;
      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          if (pixels[(y * canvas.width + x) * 4 + 3] > 12) {
            if (x < left) left = x;
            if (x > right) right = x;
            if (y < top) top = y;
            if (y > bottom) bottom = y;
          }
        }
      }
      if (right <= left || bottom <= top) {
        resolve(dataUrl);
        return;
      }
      const pad = 8;
      const sx = Math.max(0, left - pad);
      const sy = Math.max(0, top - pad);
      const sw = Math.min(canvas.width - sx, right - left + pad * 2);
      const sh = Math.min(canvas.height - sy, bottom - top + pad * 2);
      const cropped = document.createElement('canvas');
      cropped.width = sw;
      cropped.height = sh;
      cropped.getContext('2d')?.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
      resolve(cropped.toDataURL('image/png'));
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
}

export function formatLocaleDate(locale: string, value = new Date()) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(value);
}
