import { test, expect, nextE2eIp } from '../fixtures';
import fs from 'node:fs';
import { SMALL_PDF } from '../helpers/fixtures';
import { openToolLanding, pickStudioFile, waitForStudioRun } from '../helpers/studio';
import { runToolAndDownload } from '../helpers/studio';
import { assertPdf } from '../helpers/assertFile';

test.describe('Quota gratuit', () => {
  test('gratuit: compress Upload → Process → Download', async ({ page }) => {
    const { bytes } = await runToolAndDownload(page, '/compress', SMALL_PDF());
    await assertPdf(bytes, { minPages: 1 });
  });

  test('après 5 traitements, le 6e est refusé', async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      locale: 'fr-FR',
      baseURL,
      extraHTTPHeaders: { 'X-Forwarded-For': nextE2eIp() }
    });
    const page = await context.newPage();
    const pdf = fs.readFileSync(SMALL_PDF());

    for (let i = 0; i < 5; i++) {
      const res = await page.request.post('/api/compress', {
        multipart: {
          file: { name: 'text-2pages.pdf', mimeType: 'application/pdf', buffer: pdf },
          quality: 'high'
        }
      });
      expect(res.status(), `compress #${i + 1}`).toBe(200);
      expect((await res.json()).success).toBe(true);
    }

    const blocked = await page.request.post('/api/compress', {
      multipart: {
        file: { name: 'text-2pages.pdf', mimeType: 'application/pdf', buffer: pdf },
        quality: 'high'
      }
    });
    expect(blocked.status()).toBe(402);
    const body = await blocked.json();
    expect(body.code).toBe('QUOTA');

    await openToolLanding(page, '/compress');
    await pickStudioFile(page, SMALL_PDF());
    await waitForStudioRun(page);
    await page.getByRole('button', { name: /élevée|high|alta|hoch|elevata|yüksek|عالية/i }).first().click();
    await page.locator('.studio-run').click();
    await expect
      .poll(async () => page.locator('body').innerText(), { timeout: 60_000 })
      .toMatch(/5 documents|limité|quota|Passez Pro|Upgrade|402/i);
    await expect(page.locator('.studio-done-download')).toHaveCount(0);
    await context.close();
  });

  test('gratuit: OCR exige Pro ; translate/summarize passent par les crédits IA', async ({ page }) => {
    const pdf = fs.readFileSync(SMALL_PDF());
    const ocr = await page.request.post('/api/ocr', {
      multipart: {
        file: { name: 'text-2pages.pdf', mimeType: 'application/pdf', buffer: pdf },
        lang: 'fr'
      }
    });
    expect(ocr.status()).toBe(402);
    expect((await ocr.json()).code).toBe('PRO_REQUIRED');

    const me = await page.request.get('/api/billing/me');
    const session = await me.json();
    expect(session.data.dailyLimit).toBe(5);
    expect(session.data.ai.limit).toBe(5);
    expect(session.data.maxFileBytes).toBe(20 * 1024 * 1024);
    expect(session.data.monetization.translateRequiresPro).toBe(false);
    expect(session.data.monetization.aiSummaryRequiresPro).toBe(false);
    expect(session.data.monetization.ocrRequiresPro).toBe(true);
  });

  test('page Tarifs: 3 cartes, pass sans abonnement, toggle Pro', async ({ page }) => {
    await page.goto('/pricing?lang=fr');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.pricing-card')).toHaveCount(3);
    await expect(page.getByText('Paiement unique. Pas d’abonnement.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mensuel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Annuel' })).toBeVisible();
    await expect(page.getByText(/5 crédits IA par mois/i)).toBeVisible();
    await expect(page.getByText(/100 crédits IA pour le pass/i)).toBeVisible();
    await page.getByRole('button', { name: 'Mensuel' }).click();
    await expect(page.getByText(/500 crédits IA par mois/i).first()).toBeVisible();
  });
});
