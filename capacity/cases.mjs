// Explicit local-processing allowlist. No billing, account, admin, AI or translation routes.
const text = { type: 'text', page: 0, x: .1, y: .15, text: 'SYNTHETIC TEST', size: 16, color: '#111111' };
export function cases(pages) {
  const single = (path, fields = {}, fixture, extra = {}) => ({ path, fields, fixture, ...extra });
  return {
    homepage: { path: '/', get: true },
    health: { path: '/health', get: true, health: true },
    // No upload-only endpoint exists. This is upload + PDF parse/form inspection.
    'upload-inspect': single('/api/pages/form-inspect', {}, undefined, { inspect: true }),
    merge: single('/api/merge', { order: '[0,1]' }, undefined, { multiple: true }),
    split: single('/api/split', { pages: JSON.stringify([1, 2]), mode: 'separate' }),
    'split-extract': single('/api/split', { pages: '[1]', mode: 'extract' }),
    'compress-low': single('/api/compress', { quality: 'low' }),
    compress: single('/api/compress', { quality: 'medium' }),
    'compress-high': single('/api/compress', { quality: 'high' }),
    rotate: single('/api/pages/rotate', { rotations: JSON.stringify(Array(pages).fill(90)) }),
    protect: single('/api/protect', { password: 'synthetic-test-only' }),
    unlock: single('/api/unlock', { password: 'synthetic-test-only' }, 'protected.pdf'),
    'to-jpg': single('/api/to-jpg', { quality: '85' }),
    'to-png': single('/api/to-png'),
    'image-to-pdf': single('/api/jpg-to-pdf', {}, 'image.jpg', { multiple: true }),
    'png-to-pdf': single('/api/jpg-to-pdf', {}, 'image.png', { multiple: true }),
    'webp-to-pdf': single('/api/jpg-to-pdf', {}, 'image.webp', { multiple: true }),
    'heic-to-pdf': single('/api/jpg-to-pdf', {}, 'image.heic', { multiple: true }),
    'pdf-to-word': single('/api/office/pdf-to-word'),
    'word-to-pdf': single('/api/office/word-to-pdf', {}, 'document.docx'),
    'pdf-to-excel': single('/api/office/pdf-to-excel'),
    'excel-to-pdf': single('/api/office/excel-to-pdf', {}, 'sheet.csv'),
    'pdf-to-ppt': single('/api/office/pdf-to-ppt'),
    'ppt-to-pdf': single('/api/office/ppt-to-pdf', {}, 'slides.odp'),
    'html-to-pdf': single('/api/html-to-pdf', {}, 'document.html'),
    'office-html-to-pdf': single('/api/office/html-to-pdf', {}, 'document.html'),
    ocr: single('/api/ocr', { lang: 'en' }, 'scan-2pages.pdf'),
    'to-text': single('/api/to-text'),
    delete: single('/api/pages/delete', { pages: '[1]' }),
    reorder: single('/api/pages/reorder', { order: JSON.stringify(Array.from({ length: pages }, (_, i) => pages - i)) }),
    extract: single('/api/pages/extract', { pages: '[1]' }),
    'extract-images': single('/api/pages/extract-images'),
    crop: single('/api/pages/crop', { top: '5', right: '5', bottom: '5', left: '5' }),
    watermark: single('/api/pages/watermark', { text: 'SYNTHETIC', opacity: '.3', rotation: '45' }),
    numbers: single('/api/pages/numbers', { start: '1', locale: 'en' }),
    'header-footer': single('/api/pages/header-footer', { header: 'Synthetic', footer: 'Capacity test' }),
    flatten: single('/api/pages/flatten', {}, 'form.pdf'),
    'form-fill': single('/api/pages/form-fill', { values: '{"test_value":"Synthetic"}', flatten: 'true' }, 'form.pdf'),
    'fill-sign': single('/api/pages/fill-sign', { annotations: JSON.stringify([text, { type: 'drawing', page: 0, color: '#111111', width: 2, points: [{ x: .1, y: .3 }, { x: .2, y: .35 }, { x: .3, y: .3 }] }]), formValues: '{"test_value":"Synthetic"}' }, 'form.pdf'),
    edit: single('/api/edit', { annotations: JSON.stringify([text]) }, undefined, { direct: true }),
    sign: single('/api/pages/sign', { name: 'Synthetic Test', reason: 'Benchmark only', locale: 'en' }),
  };
}
export const mixed = [
  ['homepage', 30], ['health', 30], ['compress', 15], ['merge', 8], ['split', 5],
  ['to-jpg', 4], ['image-to-pdf', 3], ['pdf-to-word', 1], ['word-to-pdf', 1], ['ocr', 2], ['fill-sign', 1],
];
export function percentile(values, p) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(p * sorted.length) - 1)];
}
export function safety(sample, baseline, limits, now = Date.now()) {
  const numeric = ['timestamp', 'cpuPct', 'ramPct', 'swapBytes', 'swapOutBytes', 'diskFreeBytes', 'diskFreePct', 'tempBytes', 'tempFiles', 'oomKills', 'restarts', 'loCount', 'ocrCount', 'zombies', 'nodeRssBytes', 'oldestChildSeconds'];
  if (!sample || numeric.some(key => !Number.isFinite(sample[key]))) return 'missing or invalid monitoring';
  if (now - sample.timestamp > 15000 || sample.timestamp - now > 5000) return 'stale monitoring or clock skew';
  if (sample.ok !== true || sample.online !== true) return 'monitoring or PM2 unhealthy';
  if (sample.ramPct > 90) return 'RAM >90%';
  if (sample.diskFreeBytes < limits.minDiskFreeBytes || sample.diskFreePct < 15) return 'disk headroom';
  if (sample.swapBytes - baseline.swapBytes > limits.maxSwapGrowthBytes || sample.swapOutBytes - baseline.swapOutBytes > limits.maxSwapGrowthBytes) return 'swap growth';
  if (sample.tempBytes - baseline.tempBytes > limits.maxTempGrowthBytes || sample.tempFiles - baseline.tempFiles > limits.maxTempGrowthFiles) return 'temporary storage growth';
  if (sample.oomKills > baseline.oomKills) return 'OOM event';
  if (sample.restarts !== baseline.restarts) return 'PM2 restart';
  if (sample.loCount > limits.maxLoProcesses || sample.ocrCount > limits.maxOcrProcesses || sample.zombies > baseline.zombies || sample.oldestChildSeconds > limits.maxChildAgeSeconds) return 'child process accumulation';
  return null;
}
