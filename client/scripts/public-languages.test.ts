import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { publicLocaleFromTags } from '../src/i18n/detect.ts';
import { dictionaries } from '../src/i18n/dictionaries.ts';
import { localizedPath, routeLocale } from '../src/i18n/localePath.ts';

describe('public language simplification', () => {
  it('selects French only for French browser preferences', () => {
    assert.equal(publicLocaleFromTags(['fr-FR', 'en-US']), 'fr');
    assert.equal(publicLocaleFromTags(['ar-TN', 'fr-CA']), 'fr');
    assert.equal(publicLocaleFromTags(['es-ES']), 'en');
    assert.equal(publicLocaleFromTags(['de-DE', 'tr-TR']), 'en');
  });

  it('keeps legacy locale URLs routable and their dictionaries available', () => {
    for (const locale of ['es', 'de', 'pt', 'it', 'tr', 'ar'] as const) {
      assert.equal(routeLocale(`/${locale}/compress`), locale);
      assert.equal(localizedPath('/compress', locale), `/${locale}/compress`);
      assert.ok(dictionaries[locale].compress.seoTitle);
    }
  });
});
