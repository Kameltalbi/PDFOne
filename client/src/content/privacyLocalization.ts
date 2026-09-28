/**
 * Spanish legal body is intentionally not published.
 * getPrivacyPolicy('es') still returns the English policy.
 * A translation of the full policy can change legal meaning and needs review
 * before it replaces the English text.
 */
export const privacyLocalization = {
  es: {
    status: 'flagged' as const,
    reason:
      'The full privacy policy stays in English for Spanish visitors. The short interface strings in legal.* are localized. Do not publish a Spanish legal body until it has been reviewed against the English policy.'
  }
};
