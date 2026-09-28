/**
 * Full legal bodies for Spanish, German, Portuguese, Italian, Turkish and Arabic are intentionally not published.
 * getPrivacyPolicy still returns the English policy for those locales.
 * A translation of the full policy can change legal meaning and needs review
 * before it replaces the English text.
 */
export const privacyLocalization = {
  ar: {
    status: 'flagged' as const,
    reason:
      'The full privacy policy stays in English for Arabic visitors. The short interface strings in legal.* are localized. Do not publish an Arabic legal body until it has been reviewed against the English policy.'
  },
  tr: {
    status: 'flagged' as const,
    reason:
      'The full privacy policy stays in English for Turkish visitors. The short interface strings in legal.* are localized. Do not publish a Turkish legal body until it has been reviewed against the English policy.'
  },
  it: {
    status: 'flagged' as const,
    reason:
      'The full privacy policy stays in English for Italian visitors. The short interface strings in legal.* are localized. Do not publish an Italian legal body until it has been reviewed against the English policy.'
  },
  pt: {
    status: 'flagged' as const,
    reason:
      'The full privacy policy stays in English for Portuguese visitors. The short interface strings in legal.* are localized. Do not publish a Portuguese legal body until it has been reviewed against the English policy.'
  },
  de: {
    status: 'flagged' as const,
    reason:
      'The full privacy policy stays in English for German visitors. The short interface strings in legal.* are localized. Do not publish a German legal body until it has been reviewed against the English policy.'
  },
  es: {
    status: 'flagged' as const,
    reason:
      'The full privacy policy stays in English for Spanish visitors. The short interface strings in legal.* are localized. Do not publish a Spanish legal body until it has been reviewed against the English policy.'
  }
};
