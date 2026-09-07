import { test, expect, nextE2eIp } from '../fixtures';
import fs from 'node:fs';
import { SMALL_PDF } from '../helpers/fixtures';
import { openToolLanding, pickStudioFile, waitForStudioRun } from '../helpers/studio';

/**
 * Free daily quota is 3 documents (cookie + IP).
 * Burns the 3 units via same-origin API (sets pdfone_quota cookie), then verifies UI blocks the 4th.
 */
test.describe('Quota gratuit', () => {
  test('après 3 traitements, le 4e est refusé', async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      locale: 'fr-FR',
      baseURL,
      extraHTTPHeaders: {
        'X-Forwarded-For': nextE2eIp()
      }
    });
    const page = await context.newPage();
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
