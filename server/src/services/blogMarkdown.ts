export type InlinePart = string | { text: string; to: string };

export type BlogBlock =
  | { type: 'p'; text: string }
  | { type: 'p'; parts: InlinePart[] }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: Array<string | InlinePart[]> };

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

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
  const parsed = parseInline(text);
  return parsed;
}

export function markdownToBlocks(markdown: string): BlogBlock[] {
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
    if (list.type === 'ul') {
      blocks.push({
        type: 'ul',
        items: list.items.map((item) => (typeof item === 'string' ? item : item.map((part) => typeof part === 'string' ? part : part.text).join('')))
      });
    } else {
      blocks.push({ type: 'ol', items: list.items });
    }
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
