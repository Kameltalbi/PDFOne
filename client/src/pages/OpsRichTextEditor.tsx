import { useEffect, useRef, type MouseEvent } from 'react';
import { looksLikeHtml } from './opsRichText';

const COLORS = ['#111827', '#6b7280', '#ed5e44', '#dc2626', '#2563eb', '#16a34a', '#d97706', '#7c3aed'];
const SIZES = [
  { value: '14', label: '14' },
  { value: '16', label: '16' },
  { value: '18', label: '18' },
  { value: '22', label: '22' },
  { value: '28', label: '28' }
];

function markdownToHtml(source: string): string {
  if (!source.trim()) return '<p><br></p>';
  if (looksLikeHtml(source)) return source;
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let list: 'ul' | 'ol' | null = null;
  const closeList = () => {
    if (list) html.push(`</${list}>`);
    list = null;
  };
  for (const raw of lines) {
    const line = raw.trim();
    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    const bullet = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    if (heading) {
      closeList();
      html.push(heading[1] === '###' ? `<h3>${escapeHtml(heading[2])}</h3>` : `<h2>${escapeHtml(heading[2])}</h2>`);
      continue;
    }
    if (bullet || ordered) {
      const type = bullet ? 'ul' : 'ol';
      const item = (bullet || ordered)?.[1] || '';
      if (list !== type) {
        closeList();
        html.push(`<${type}>`);
        list = type;
      }
      html.push(`<li>${escapeHtml(item)}</li>`);
      continue;
    }
    closeList();
    if (!line) continue;
    html.push(`<p>${escapeHtml(line)}</p>`);
  }
  closeList();
  return html.join('') || '<p><br></p>';
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function rgbToHex(value: string): string | null {
  const hex = value.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
    return hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`.toLowerCase()
      : hex.toLowerCase();
  }
  const match = hex.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (!match) return null;
  return `#${[match[1], match[2], match[3]]
    .map((part) => Math.max(0, Math.min(255, Number(part))).toString(16).padStart(2, '0'))
    .join('')}`;
}

function readAlign(el: HTMLElement): 'left' | 'center' | 'right' | '' {
  const raw = (
    el.getAttribute('data-align')
    || el.getAttribute('align')
    || el.style.textAlign
    || ''
  ).toLowerCase();
  if (raw === 'center' || raw === 'right' || raw === 'left') return raw;
  if (raw === 'end') return 'right';
  if (raw === 'start' || raw === 'justify') return 'left';
  return '';
}

function applyAlign(html: string, align: 'left' | 'center' | 'right' | ''): string {
  if (!html || !align) return html;
  return html.replace(/<(p|h2|h3|ul|ol)(\s[^>]*)?>/gi, (full, tag: string, rest = '') => {
    if (/data-align=/i.test(rest)) return full;
    return `<${tag} data-align="${align}"${rest}>`;
  });
}

function serializeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return escapeHtml(node.textContent || '');
  if (node.nodeType !== Node.ELEMENT_NODE) return '';
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  const inner = Array.from(el.childNodes).map(serializeNode).join('');
  if (tag === 'br') return '<br>';
  if (tag === 'strong' || tag === 'b') return `<strong>${inner}</strong>`;
  if (tag === 'em' || tag === 'i') return `<em>${inner}</em>`;
  if (tag === 'u') return `<u>${inner}</u>`;
  if (tag === 'a') {
    const href = el.getAttribute('href') || '';
    if (href.startsWith('/') || href.includes('one2pdf.com')) {
      return `<a href="${escapeHtml(href)}">${inner}</a>`;
    }
    return inner;
  }
  if (tag === 'span' || tag === 'font') {
    const color = rgbToHex(el.getAttribute('data-color') || el.style.color || el.getAttribute('color') || '');
    const sizeRaw = el.getAttribute('data-size') || el.style.fontSize || el.getAttribute('size') || '';
    const size = sizeRaw.replace(/px$/i, '');
    let out = inner;
    if (color) out = `<span data-color="${color}">${out}</span>`;
    if (['14', '16', '18', '22', '28'].includes(size)) out = `<span data-size="${size}">${out}</span>`;
    return out;
  }
  if (tag === 'h2' || tag === 'h3' || tag === 'p' || tag === 'ul' || tag === 'ol' || tag === 'li') {
    const align = tag === 'li' ? '' : readAlign(el);
    const attr = align ? ` data-align="${align}"` : '';
    return `<${tag}${attr}>${inner || (tag === 'p' ? '<br>' : '')}</${tag}>`;
  }
  if (tag === 'div') {
    const aligned = applyAlign(inner, readAlign(el));
    if (aligned) return aligned;
    const align = readAlign(el);
    return align ? `<p data-align="${align}"><br></p>` : '';
  }
  return inner;
}

function serializeEditor(root: HTMLElement): string {
  const html = Array.from(root.childNodes).map(serializeNode).join('');
  return html.replace(/(<p><br><\/p>)+$/g, '').trim() || '<p><br></p>';
}

export default function OpsRichTextEditor({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef('');

  useEffect(() => {
    if (!ref.current) return;
    if (value === last.current) return;
    const html = markdownToHtml(value);
    ref.current.innerHTML = html;
    last.current = looksLikeHtml(value) ? value : html;
  }, [value]);

  const emit = () => {
    if (!ref.current) return;
    const html = serializeEditor(ref.current);
    last.current = html;
    onChange(html);
  };

  const run = (command: string, extra?: string) => {
    ref.current?.focus();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, extra);
    emit();
  };

  const keepSelection = (event: MouseEvent<HTMLButtonElement | HTMLSelectElement>) => {
    event.preventDefault();
  };

  const applySize = (size: string) => {
    ref.current?.focus();
    document.execCommand('fontSize', false, '7');
    ref.current?.querySelectorAll('font[size="7"], span[style*="xxx-large"]').forEach((node) => {
      const span = document.createElement('span');
      span.setAttribute('data-size', size);
      span.style.fontSize = `${size}px`;
      span.innerHTML = (node as HTMLElement).innerHTML;
      node.replaceWith(span);
    });
    emit();
  };

  const applyColor = (color: string) => {
    run('foreColor', color);
  };

  const applyLink = () => {
    const href = window.prompt('Lien interne One2PDF', '/compress')?.trim() || '';
    if (!href) return;
    run('createLink', href);
  };

  return (
    <div className="ops-editor">
      <div className="ops-editor-bar" role="toolbar" aria-label="Mise en forme">
        <button type="button" onMouseDown={keepSelection} onClick={() => run('bold')} title="Gras"><b>B</b></button>
        <button type="button" onMouseDown={keepSelection} onClick={() => run('italic')} title="Italique"><i>I</i></button>
        <button type="button" onMouseDown={keepSelection} onClick={() => run('underline')} title="Souligné"><u>U</u></button>
        <span className="ops-editor-sep" />
        <button type="button" onMouseDown={keepSelection} onClick={() => run('formatBlock', 'p')} title="Paragraphe">P</button>
        <button type="button" onMouseDown={keepSelection} onClick={() => run('formatBlock', 'h2')} title="Titre">H2</button>
        <button type="button" onMouseDown={keepSelection} onClick={() => run('formatBlock', 'h3')} title="Sous-titre">H3</button>
        <span className="ops-editor-sep" />
        <button type="button" className="ops-align ops-align-left" onMouseDown={keepSelection} onClick={() => run('justifyLeft')} title="Aligner à gauche" aria-label="Aligner à gauche"><span /><span /><span /></button>
        <button type="button" className="ops-align ops-align-center" onMouseDown={keepSelection} onClick={() => run('justifyCenter')} title="Centrer" aria-label="Centrer"><span /><span /><span /></button>
        <button type="button" className="ops-align ops-align-right" onMouseDown={keepSelection} onClick={() => run('justifyRight')} title="Aligner à droite" aria-label="Aligner à droite"><span /><span /><span /></button>
        <span className="ops-editor-sep" />
        <button type="button" onMouseDown={keepSelection} onClick={() => run('insertUnorderedList')} title="Liste">•</button>
        <button type="button" onMouseDown={keepSelection} onClick={() => run('insertOrderedList')} title="Liste numérotée">1.</button>
        <button type="button" onMouseDown={keepSelection} onClick={applyLink} title="Lien">Lien</button>
        <span className="ops-editor-sep" />
        <select
          aria-label="Taille"
          defaultValue="16"
          onChange={(event) => applySize(event.target.value)}
        >
          {SIZES.map((item) => (
            <option key={item.value} value={item.value}>{item.label} px</option>
          ))}
        </select>
        <span className="ops-editor-colors">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className="ops-editor-swatch"
              style={{ background: color }}
              title={color}
              onMouseDown={keepSelection}
              onClick={() => applyColor(color)}
            />
          ))}
        </span>
      </div>
      <div
        ref={ref}
        className="ops-editor-area"
        contentEditable
        role="textbox"
        aria-label="Contenu"
        data-placeholder={placeholder || 'Écrivez l’article…'}
        onInput={emit}
        onBlur={emit}
      />
    </div>
  );
}
