export function looksLikeHtml(value: string): boolean {
  return /<(p|h1|h2|h3|ul|ol|li|div|br|strong|em|b|i|u|span|font|a)\b/i.test(value);
}
