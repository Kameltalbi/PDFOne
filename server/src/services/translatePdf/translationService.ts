const LANG_LABELS: Record<string, string> = {
  fr: 'French',
  en: 'English',
  es: 'Spanish',
  pt: 'Portuguese',
  de: 'German',
  tr: 'Turkish',
  ar: 'Arabic',
  it: 'Italian'
};

export type BlockPayload = {
  id: string;
  text: string;
  prev?: string;
  next?: string;
};

async function llmComplete(prompt: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [{ role: 'user', content: prompt.slice(0, 32000) }]
    })
  });
  if (!response.ok) return null;
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return payload.choices?.[0]?.message?.content?.trim() || null;
}

function parseIdTranslations(raw: string): Map<string, string> {
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  const out = new Map<string, string>();
  if (start < 0 || end <= start) return out;
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as Array<{ id?: string; translation?: string }>;
    if (!Array.isArray(parsed)) return out;
    for (const item of parsed) {
      if (item?.id && typeof item.translation === 'string') out.set(item.id, item.translation);
    }
  } catch {
    /* ignore malformed batches */
  }
  return out;
}

export function keepOriginal(text: string) {
  const value = text.trim();
  if (value.length < 2) return true;
  if (!/[\p{L}]/u.test(value)) return true;
  if (/^https?:/i.test(value) || /^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(value)) return true;
  return false;
}

export async function translateBlocks(
  items: BlockPayload[],
  target: string,
  source = 'auto',
  documentTitle?: string
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (!items.length) return result;
  const to = LANG_LABELS[target] || target;
  const from = source === 'auto' ? 'auto-detected' : (LANG_LABELS[source] || source);
  const batchSize = 24;
  for (let start = 0; start < items.length; start += batchSize) {
    const batch = items.slice(start, start + batchSize);
    const payload = batch.map((item) => ({
      id: item.id,
      text: item.text,
      previous: item.prev || '',
      next: item.next || ''
    }));
    const prompt = [
      `Translate each item's "text" into ${to}.`,
      `Source language: ${from}.`,
      documentTitle ? `Document title: ${documentTitle}` : '',
      'Return ONLY a JSON array of {"id","translation"} objects.',
      'Keep the same ids. Do not reorder, drop, or add items.',
      'previous/next are context only — do not translate them.',
      'Keep numbers, dates, emails, URLs and product codes unchanged.',
      'Do not wrap the JSON in markdown.',
      JSON.stringify(payload)
    ].filter(Boolean).join('\n');
    const llm = await llmComplete(prompt);
    const parsed = llm ? parseIdTranslations(llm) : new Map<string, string>();
    for (const item of batch) {
      result.set(item.id, parsed.get(item.id) || item.text);
    }
  }
  return result;
}
