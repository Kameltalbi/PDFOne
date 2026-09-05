/** Strip absolute filesystem paths from user-facing error strings. */
export function sanitizePublicError(message: string, fallback: string): string {
  const cleaned = message
    .replace(/\/(?:Volumes|Users|home|var|tmp|private|opt|usr)\/[^\s"'`]+/gi, '[path]')
    .replace(/[A-Za-z]:\\[^\s"'`]+/g, '[path]')
    .replace(/pdfone-[a-z0-9_-]+/gi, '[temp]')
    .trim();
  if (!cleaned || cleaned === '[path]' || cleaned.length < 3) return fallback;
  // Prefer short operator messages over stack/path dumps.
  if (cleaned.includes('\n') || cleaned.length > 280) return fallback;
  return cleaned;
}

export function publicErrorFromUnknown(error: unknown, fallback: string): string {
  if (!(error instanceof Error) || !error.message) return fallback;
  return sanitizePublicError(error.message, fallback);
}
