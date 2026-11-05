import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const readClient = (relative: string) => fs.readFileSync(path.join(here, '..', relative), 'utf8');

describe('first-paint guard', () => {
  it('does not paint the SEO fallback before React takes ownership', () => {
    const html = readClient('index.html');
    assert.match(html, /dataset\.appShell = 'loading'/);
    assert.match(html, /data-app-shell="loading"\] #seo-prerender/);
  });

  it('prioritizes the initial React render and does not force a service-worker reload', () => {
    const main = readClient('src/main.tsx');
    assert.ok(main.indexOf('createRoot(') < main.lastIndexOf('registerPwa()'));
    const pwa = readClient('src/lib/registerPwa.ts');
    assert.doesNotMatch(pwa, /applyUpdate\(true\)/);
  });
});
