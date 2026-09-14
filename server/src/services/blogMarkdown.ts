export type InlineMark = {
  text: string;
  to?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  fontSize?: string;
};

export type InlinePart = string | InlineMark;

export type BlogBlock =
  | { type: 'p'; text: string }
  | { type: 'p'; parts: InlinePart[] }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: Array<string | InlinePart[]> }
  | { type: 'ol'; items: Array<string | InlinePart[]> };

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
const ALLOWED_SIZES = new Set(['14', '16', '18', '22', '28']);
const COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeHref(href: string): string | null {
  const raw = href.trim();
  if (!raw || raw.length > 200) return null;
  if (raw.startsWith('/') && !raw.startsWith('//')) {
    if (!/^\/[a-zA-Z0-9/_\-?=#%.]*$/.test(raw)) return null;
    return raw;
  }
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (url.hostname !== 'one2pdf.com' && url.hostname !== 'www.one2pdf.com') return null;
    return `${url.pathname}${url.search}${url.hash}` || '/';
  } catch {
    return null;
  }
}

export function looksLikeHtml(value: string): boolean {
  return /<(p|h1|h2|h3|ul|ol|li|div|br|strong|em|b|i|u|span|font|a)\b/i.test(value);
}

export function sanitizeColor(value: string | null | undefined): string | undefined {
  const raw = String(value || '').trim().toLowerCase();
  if (COLOR_RE.test(raw)) {
    if (raw.length === 4) {
      return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`;
    }
    return raw;
  }
  const rgb = raw.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!rgb) return undefined;
  const hex = [rgb[1], rgb[2], rgb[3]]
    .map((part) => Math.max(0, Math.min(255, Number(part))).toString(16).padStart(2, '0'))
    .join('');
  return `#${hex}`;
}

export function sanitizeSize(value: string | null | undefined): string | undefined {
  const raw = String(value || '').trim().replace(/px$/i, '');
  if (ALLOWED_SIZES.has(raw)) return raw;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return undefined;
  if (n <= 14) return '14';
  if (n <= 16) return '16';
  if (n <= 18) return '18';
  if (n <= 22) return '22';
  return '28';
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function parseInline(text: string): InlinePart[] | string {
  const parts: InlinePart[] = [];
  let last = 0;
  LINK_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  let hasLink = false;
  while ((match = LINK_RE.exec(text))) {
    const href = normalizeHref(match[2] || '');
    if (!href) continue;
    hasLink = true;
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push({ text: match[1], to: href });
    last = match.index + match[0].length;
  }
  if (!hasLink) return text;
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function asParagraph(text: string): BlogBlock {
  const parsed = parseInline(text);
  if (typeof parsed === 'string') return { type: 'p', text: parsed };
  return { type: 'p', parts: parsed };
}

function asListItem(text: string): string | InlinePart[] {
  return parseInline(text);
}

function collapseParts(parts: InlinePart[]): string | InlinePart[] {
  const cleaned = parts.filter((part) => (typeof part === 'string' ? part.length > 0 : part.text.length > 0));
  if (cleaned.length === 0) return '';
  if (cleaned.every((part) => typeof part === 'string')) return cleaned.join('');
  return cleaned;
}

function paragraphFromParts(parts: InlinePart[]): BlogBlock | null {
  const collapsed = collapseParts(parts);
  if (!collapsed || (typeof collapsed === 'string' && !collapsed.trim())) return null;
  if (typeof collapsed === 'string') return { type: 'p', text: collapsed.trim() };
  return { type: 'p', parts: collapsed };
}

type Marks = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color?: string;
  fontSize?: string;
  href?: string;
};

function currentMarks(stack: Array<{ tag: string; attrs: Record<string, string> }>): Marks {
  const marks: Marks = { bold: false, italic: false, underline: false };
  for (const frame of stack) {
    const tag = frame.tag;
    if (tag === 'strong' || tag === 'b') marks.bold = true;
    if (tag === 'em' || tag === 'i') marks.italic = true;
    if (tag === 'u') marks.underline = true;
    if (tag === 'a') {
      const href = normalizeHref(frame.attrs.href || '');
      if (href) marks.href = href;
    }
    const color = sanitizeColor(frame.attrs['data-color'] || frame.attrs.color || '');
    const size = sanitizeSize(frame.attrs['data-size'] || frame.attrs.size || '');
    const style = frame.attrs.style || '';
    const styleColor = sanitizeColor((style.match(/color\s*:\s*([^;]+)/i) || [])[1]);
    const styleSize = sanitizeSize((style.match(/font-size\s*:\s*([^;]+)/i) || [])[1]);
    if (color || styleColor) marks.color = color || styleColor;
    if (size || styleSize) marks.fontSize = size || styleSize;
  }
  return marks;
}

function pushMarkedText(text: string, stack: Array<{ tag: string; attrs: Record<string, string> }>, out: InlinePart[]) {
  const decoded = decodeEntities(text).replace(/\s+/g, ' ');
  if (!decoded) return;
  const marks = currentMarks(stack);
  const styled = Boolean(marks.bold || marks.italic || marks.underline || marks.color || marks.fontSize || marks.href);
  if (!styled) {
    out.push(decoded);
    return;
  }
  out.push({
    text: decoded,
    ...(marks.href ? { to: marks.href } : {}),
    ...(marks.bold ? { bold: true } : {}),
    ...(marks.italic ? { italic: true } : {}),
    ...(marks.underline ? { underline: true } : {}),
    ...(marks.color ? { color: marks.color } : {}),
    ...(marks.fontSize ? { fontSize: marks.fontSize } : {})
  });
}

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([a-zA-Z_:][\w:.-]*)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw))) {
    attrs[match[1].toLowerCase()] = match[3] || match[4] || match[5] || '';
  }
  return attrs;
}

function htmlToBlocks(html: string): BlogBlock[] {
  const tokens = html.replace(/\r\n/g, '\n').match(/<\/?[a-zA-Z][^>]*>|[^<]+/g) || [];
  const blocks: BlogBlock[] = [];
  const stack: Array<{ tag: string; attrs: Record<string, string> }> = [];
  let inline: InlinePart[] = [];
  let list: { type: 'ul' | 'ol'; items: Array<string | InlinePart[]> } | null = null;
  let inLi = false;

  const flushParagraph = () => {
    const block = paragraphFromParts(inline);
    inline = [];
    if (block) blocks.push(block);
  };

  const flushList = () => {
    if (!list || list.items.length === 0) {
      list = null;
      return;
    }
    blocks.push({ type: list.type, items: list.items });
    list = null;
  };

  const flushLi = () => {
    if (!list) return;
    const collapsed = collapseParts(inline);
    inline = [];
    inLi = false;
    if (typeof collapsed === 'string') {
      if (collapsed.trim()) list.items.push(collapsed.trim());
    } else if (collapsed.length) list.items.push(collapsed);
  };

  const headingText = () => {
    const collapsed = collapseParts(inline);
    inline = [];
    if (typeof collapsed === 'string') return collapsed.trim();
    return collapsed.map((part) => (typeof part === 'string' ? part : part.text)).join('').trim();
  };

  for (const token of tokens) {
    if (token.startsWith('<')) {
      const closing = /^<\s*\//.test(token);
      const name = (token.match(/^<\s*\/?\s*([a-zA-Z][a-zA-Z0-9]*)/) || [])[1]?.toLowerCase() || '';
      if (!name || name === 'script' || name === 'style') continue;
      if (name === 'br') {
        if (inLi || stack.some((frame) => frame.tag === 'p')) inline.push(' ');
        else flushParagraph();
        continue;
      }
      if (closing) {
        if (name === 'p' || name === 'div') {
          if (inLi) continue;
          flushList();
          flushParagraph();
          stack.pop();
          continue;
        }
        if (name === 'h1' || name === 'h2' || name === 'h3') {
          flushList();
          const text = headingText();
          if (text) blocks.push({ type: name === 'h3' ? 'h3' : 'h2', text });
          stack.pop();
          continue;
        }
        if (name === 'li') {
          flushLi();
          continue;
        }
        if (name === 'ul' || name === 'ol') {
          if (inLi) flushLi();
          flushList();
          continue;
        }
        const idx = [...stack].map((frame) => frame.tag).lastIndexOf(name);
        if (idx >= 0) stack.splice(idx, 1);
        continue;
      }
      const attrs = parseAttrs(token.replace(/^<\s*[a-zA-Z][a-zA-Z0-9]*\s*/i, '').replace(/\/?>$/, ''));
      if (name === 'p' || name === 'div') {
        if (!inLi) {
          flushList();
          flushParagraph();
        }
        stack.push({ tag: 'p', attrs });
        continue;
      }
      if (name === 'h1' || name === 'h2' || name === 'h3') {
        flushList();
        flushParagraph();
        stack.push({ tag: name, attrs });
        continue;
      }
      if (name === 'ul' || name === 'ol') {
        flushParagraph();
        if (list && list.type !== name) flushList();
        if (!list) list = { type: name, items: [] };
        continue;
      }
      if (name === 'li') {
        if (!list) list = { type: 'ul', items: [] };
        if (inLi) flushLi();
        inLi = true;
        inline = [];
        continue;
      }
      stack.push({ tag: name, attrs });
      continue;
    }
    pushMarkedText(token, stack, inline);
  }
  if (inLi) flushLi();
  flushList();
  flushParagraph();
  return blocks;
}

function markdownToBlocksLegacy(markdown: string): BlogBlock[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: BlogBlock[] = [];
  let paragraph: string[] = [];
  let list: { type: 'ul' | 'ol'; items: Array<string | InlinePart[]> } | null = null;

  const flushParagraph = () => {
    const text = paragraph.join(' ').replace(/\s+/g, ' ').trim();
    paragraph = [];
    if (text) blocks.push(asParagraph(text));
  };

  const flushList = () => {
    if (!list || list.items.length === 0) {
      list = null;
      return;
    }
    blocks.push({ type: list.type, items: list.items });
    list = null;
  };

  const startList = (type: 'ul' | 'ol', item: string | InlinePart[]) => {
    if (list && list.type !== type) flushList();
    if (!list) list = { type, items: [] };
    list.items.push(item);
  };

  for (const raw of lines) {
    const line = raw.replace(/\t/g, '  ');
    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    const bullet = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+[.)]\s+(.+)$/);

    if (heading) {
      flushParagraph();
      flushList();
      const text = heading[2].trim();
      blocks.push({ type: heading[1] === '###' ? 'h3' : 'h2', text });
      continue;
    }
    if (bullet) {
      flushParagraph();
      startList('ul', asListItem(bullet[1].trim()));
      continue;
    }
    if (ordered) {
      flushParagraph();
      startList('ol', asListItem(ordered[1].trim()));
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    flushList();
    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  return blocks;
}

export function markdownToBlocks(markdown: string): BlogBlock[] {
  const raw = String(markdown || '');
  if (looksLikeHtml(raw)) return htmlToBlocks(raw);
  return markdownToBlocksLegacy(raw);
}
