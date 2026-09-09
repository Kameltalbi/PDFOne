import { test, expect, nextE2eIp } from '../fixtures';
import fs from 'node:fs';
import { SMALL_PDF } from '../helpers/fixtures';
import { openToolLanding, pickStudioFile, waitForStudioRun, runToolAndDownload } from '../helpers/studio';
import { assertPdf } from '../helpers/assertFile';

async function growthModeEnabled(page: import('@playwright/test').Page): Promise<boolean> {
  const res = await page.request.get('/api/billing/me');
  const body = await res.json();
  return Boolean(body?.data?.monetization?.growthMode && body?.data?.monetization?.standardToolsFree);
}

test.describe('Growth Mode monetization', () => {
  test('gratuit: compress Upload → Process → Download', async ({ page }) => {
    test.skip(!(await growthModeEnabled(page)), 'GROWTH_MODE disabled');
    const { bytes } = await runToolAndDownload(page, '/compress', SMALL_PDF());
    await assertPdf(bytes, { minPages: 1 });
  });

  test('gratuit: pas de quota après 4 compressions', async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      locale: 'fr-FR',
      baseURL,
      extraHTTPHeaders: { 'X-Forwarded-For': nextE2eIp() }
    });
    const page = await context.newPage();
    test.skip(!(await growthModeEnabled(page)), 'GROWTH_MODE disabled');

    const pdf = fs.readFileSync(SMALL_PDF());
    for (let i = 0; i < 4; i++) {
      const res = await page.request.post('/api/compress', {
        multipart: {
          file: {
            name: 'text-2pages.pdf',
            mimeType: 'application/pdf',
            buffer: pdf
          },
          quality: 'high'
        }
      });
      expect(res.status(), `compress #${i + 1}`).toBe(200);
      expect((await res.json()).success).toBe(true);
    }
    await context.close();
  });

  test('gratuit: OCR / translate / summarize exigent Pro', async ({ page }) => {
    test.skip(!(await growthModeEnabled(page)), 'GROWTH_MODE disabled');
    const pdf = fs.readFileSync(SMALL_PDF());
    for (const path of ['/api/ocr', '/api/translate', '/api/summarize'] as const) {
      const res = await page.request.post(path, {
        multipart: {
          file: {
            name: 'text-2pages.pdf',
            mimeType: 'application/pdf',
            buffer: pdf
          },
          ...(path === '/api/translate' ? { target: 'en', source: 'auto' } : {}),
          ...(path === '/api/summarize' ? { mode: 'detailed', language: 'same' } : {}),
          ...(path === '/api/ocr' ? { lang: 'fr' } : {})
        }
      });
      expect(res.status(), path).toBe(402);
      const body = await res.json();
      expect(body.code).toBe('PRO_REQUIRED');
    }
  });
});

test.describe('Quota gratuit (freemium classique)', () => {
  test('après 3 traitements, le 4e est refusé', async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      locale: 'fr-FR',
      baseURL,
      extraHTTPHeaders: {
        'X-Forwarded-For': nextE2eIp()
      }
    });
    const page = await context.newPage();
    if (await growthModeEnabled(page)) {
      await context.close();
      test.skip(true, 'Skipped while GROWTH_MODE is on — free daily quota is disabled');
      return;
    }

    const pdf = fs.readFileSync(SMALL_PDF());

    for (let i = 0; i < 3; i++) {
      const res = await page.request.post('/api/compress', {
        multipart: {
          file: {
            name: 'text-2pages.pdf',
            mimeType: 'application/pdf',
            buffer: pdf
          },
          quality: 'high'
        }
      });
      expect(res.status(), `compress #${i + 1}`).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    }

    await openToolLanding(page, '/compress');
    await pickStudioFile(page, SMALL_PDF());
    await waitForStudioRun(page);
    await page.getByRole('button', { name: /élevée|high|alta|hoch|elevata|yüksek|عالية/i }).first().click();
    await page.locator('.studio-run').click();

    await expect
      .poll(async () => page.locator('body').innerText(), { timeout: 60_000 })
      .toMatch(/3 documents|limité|quota|Passez Pro|Upgrade|402/i);

    await expect(page.locator('.studio-done-download')).toHaveCount(0);
    await context.close();
  });
});
