import fs from 'node:fs/promises';
import { mapPdfError } from '../utils/pdf.js';
import { extractPdfText } from '../utils/pdfText.js';
import { writeTemp } from '../utils/temp.js';

const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'with', 'is', 'are', 'was', 'be', 'as', 'at', 'by', 'this', 'that',
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'à', 'au', 'aux', 'en', 'dans', 'sur', 'pour', 'par', 'pas', 'plus', 'est', 'sont', 'ce', 'ces', 'qui', 'que', 'dont',
  'el', 'los', 'las', 'una', 'unos', 'del', 'al', 'con', 'por', 'para', 'como', 'más',
  'o', 'os', 'as', 'um', 'uma', 'do', 'da', 'em', 'não',
  'der', 'die', 'das', 'und', 'den', 'dem', 'ein', 'eine', 'ist', 'im', 'nicht',
  'il', 'lo', 'gli', 'una', 'di', 'che', 'non', 'per', 'una'
]);

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?…])\s+/)
    .map((value) => value.trim())
    .filter((value) => value.length > 25);
}

function extractiveSummary(text: string, maxSentences: number): string {
  const sentences = splitSentences(text);
  if (sentences.length <= maxSentences) return text.slice(0, 12000);
  const freq = new Map<string, number>();
  for (const word of text.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? []) {
    if (word.length < 3 || STOP.has(word)) continue;
    freq.set(word, (freq.get(word) || 0) + 1);
  }
  const ranked = sentences
    .map((sentence, index) => {
      const words = sentence.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? [];
      const score = words.reduce((sum, word) => sum + (freq.get(word) || 0), 0) / Math.max(words.length, 1);
      return { sentence, index, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index);
  return ranked.map((item) => item.sentence).join(' ');
}

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
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt.slice(0, 24000) }]
    })
  });
  if (!response.ok) return null;
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return payload.choices?.[0]?.message?.content?.trim() || null;
}

async function myMemoryTranslate(text: string, from: string, to: string): Promise<string> {
  const chunks: string[] = [];
  let rest = text;
  while (rest.length) {
    chunks.push(rest.slice(0, 420));
    rest = rest.slice(420);
  }
  const parts: string[] = [];
  for (const chunk of chunks.slice(0, 40)) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${from}|${to}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Le service de traduction est indisponible.');
    const payload = await response.json() as { responseData?: { translatedText?: string } };
    parts.push(payload.responseData?.translatedText || chunk);
  }
  return parts.join('');
}

const LANG_LABELS: Record<string, string> = {
  fr: 'français',
  en: 'English',
  es: 'español',
  pt: 'português',
  de: 'Deutsch',
  tr: 'Türkçe',
  ar: 'العربية',
  it: 'italiano'
};

function parseJsonStrings(raw: string, expected: number): string[] | null {
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1));
    if (!Array.isArray(parsed) || parsed.length !== expected) return null;
    return parsed.map((value) => String(value ?? ''));
  } catch {
    return null;
  }
}

export async function translateFragments(texts: string[], target: string, source = 'auto'): Promise<string[]> {
  if (!texts.length) return [];
  const to = target;
  const from = source === 'auto' ? 'autodetect' : source;
  const pairFrom = from === 'autodetect' ? 'en' : from;
  const out: string[] = [];
  const batchSize = 40;
  for (let start = 0; start < texts.length; start += batchSize) {
    const batch = texts.slice(start, start + batchSize);
    const llm = await llmComplete(
      `Translate each string into ${LANG_LABELS[to] || to}. Return ONLY a JSON array of strings, same length and order. Keep numbers, dates, emails and product codes unchanged. Do not comment.\n\n${JSON.stringify(batch)}`
    );
    const parsed = llm ? parseJsonStrings(llm, batch.length) : null;
    if (parsed) {
      out.push(...parsed);
      continue;
    }
    for (const text of batch) {
      out.push(await myMemoryTranslate(text.slice(0, 800), pairFrom, to));
    }
  }
  return out;
}

export async function translatePdf(filePath: string, target: string, source = 'auto') {
  const { translatePdfDocument } = await import('./translateLayout.js');
  return translatePdfDocument(filePath, target, source);
}

export async function summarizePdf(filePath: string, length: 'short' | 'medium' = 'medium') {
  try {
    const text = await extractPdfText(await fs.readFile(filePath));
    if (!text) throw new Error('Aucun texte extractible. Lancez d’abord l’OCR sur un scan.');
    const maxSentences = length === 'short' ? 4 : 8;
    const llm = await llmComplete(
      `Résume le document suivant en ${maxSentences} phrases claires, dans la langue du texte :\n\n${text.slice(0, 18000)}`
    );
    const summary = llm || extractiveSummary(text, maxSentences);
    return writeTemp(Buffer.from(`${summary}\n`, 'utf8'), 'resume', 'txt');
  } catch (error) {
    throw new Error(mapPdfError(error, error instanceof Error ? error.message : 'Impossible de résumer ce PDF.'));
  }
}
