import { test, expect } from '../fixtures';
import fs from 'node:fs';
import {
  FORM_PDF,
  IMAGE_JPG,
  PROTECTED_PASSWORD,
  PROTECTED_PDF,
  SCAN_PDF,
  SHEET_CSV,
  SMALL_PDF,
  WORD_DOC
} from '../helpers/fixtures';
import {
  assertDocx,
  assertEncryptedPdf,
  assertJpegOrZipOfJpegs,
  assertPdf,
  assertXlsx,
  assertZipWithEntries,
  pdfContainsText
} from '../helpers/assertFile';
import {
  downloadStudioResult,
  openToolLanding,
  pickStudioFile,
  runStudioTool,
  runToolAndDownload,
  waitForStudioRun
} from '../helpers/studio';

// Pro cookie bypasses free daily quota (Office/OCR burn many units).
test.use({ useProAccess: true });

test.describe('Parcours critiques — conversion & PDF', () => {
  test('PDF → Word produit un DOCX valide', async ({ page }) => {
    const { bytes } = await runToolAndDownload(page, '/pdf-to-word', SMALL_PDF(), { timeout: 300_000 });
    assertDocx(bytes);
  });

  test('Word → PDF produit un PDF lisible', async ({ page }) => {
    const { bytes } = await runToolAndDownload(page, '/word-to-pdf', WORD_DOC(), { timeout: 300_000 });
    await assertPdf(bytes, { minPages: 1 });
  });

  test('PDF → Excel produit un XLSX valide', async ({ page }) => {
    const { bytes } = await runToolAndDownload(page, '/pdf-to-excel', SMALL_PDF(), { timeout: 300_000 });
    assertXlsx(bytes);
  });

  test('Excel/CSV → PDF produit un PDF lisible', async ({ page }) => {
    const { bytes } = await runToolAndDownload(page, '/excel-to-pdf', SHEET_CSV(), { timeout: 300_000 });
    await assertPdf(bytes, { minPages: 1 });
  });

  test('PDF → JPG produit JPEG ou ZIP d’images', async ({ page }) => {
    const { bytes } = await runToolAndDownload(page, '/to-jpg', SMALL_PDF());
    const kind = assertJpegOrZipOfJpegs(bytes);
    if (kind === 'zip') await assertZipWithEntries(bytes, { minFiles: 2, ext: '.jpg' });
  });

  test('JPG → PDF produit un PDF d’une page', async ({ page }) => {
    const { bytes } = await runToolAndDownload(page, '/jpg-to-pdf', IMAGE_JPG());
    await assertPdf(bytes, { minPages: 1, maxPages: 1 });
  });

  test('OCR sur scan produit un PDF valide', async ({ page }) => {
    const { bytes } = await runToolAndDownload(page, '/ocr', SCAN_PDF(), { timeout: 300_000 });
    await assertPdf(bytes, { minPages: 2 });
  });

  test('Merge fusionne 2 PDF', async ({ page }) => {
    await openToolLanding(page, '/merge', '.merge-file-input');
    await pickStudioFile(page, [SMALL_PDF(), SCAN_PDF()], '.merge-file-input');
    await expect(page.locator('.merge-run')).toBeEnabled({ timeout: 60_000 });
    await page.locator('.merge-run').click();
    await expect(page.locator('.studio-done-download')).toBeVisible({ timeout: 180_000 });
    const { bytes } = await downloadStudioResult(page);
    await assertPdf(bytes, { minPages: 4 });
  });

  test('Split extract produit un PDF cohérent', async ({ page }) => {
    await openToolLanding(page, '/split');
    await pickStudioFile(page, SMALL_PDF());
    await waitForStudioRun(page);
    await expect(page.locator('.studio-thumb.clickable')).toHaveCount(2, { timeout: 60_000 });
    await page.getByRole('button', { name: /^Aucun$|^None$|^Ninguno$|^Keine$|^Nessuno$|^Hiçbiri$|^لا شيء$/i }).click();
    await page.locator('.studio-thumb.clickable').first().click();
    await expect(page.locator('.studio-thumb.selected')).toHaveCount(1);
    await runStudioTool(page);
    const { bytes } = await downloadStudioResult(page);
    await assertPdf(bytes, { minPages: 1, maxPages: 1 });
  });

  test('Protect puis Unlock round-trip', async ({ page }) => {
    const password = 'e2e-protect-ok';
    const protectedResult = await runToolAndDownload(page, '/protect', SMALL_PDF(), {
      beforeRun: async (p) => {
        await p.locator('#password').fill(password);
        await p.locator('#confirm-password').fill(password);
      }
    });
    await assertEncryptedPdf(protectedResult.bytes);

    const tmpPath = test.info().outputPath('protected-roundtrip.pdf');
    fs.writeFileSync(tmpPath, protectedResult.bytes);

    await openToolLanding(page, '/unlock');
    await pickStudioFile(page, tmpPath);
    await waitForStudioRun(page);
    await page.locator('#unlock-password').fill(password);
    await runStudioTool(page);
    const unlocked = await downloadStudioResult(page);
    await assertPdf(unlocked.bytes, { minPages: 2 });
  });

  test('Unlock du fixture protected.pdf', async ({ page }) => {
    const { bytes } = await runToolAndDownload(page, '/unlock', PROTECTED_PDF(), {
      beforeRun: async (p) => {
        await p.locator('#unlock-password').fill(PROTECTED_PASSWORD);
      }
    });
    await assertPdf(bytes, { minPages: 1 });
  });

  test('Fill & Sign remplit le champ puis exporte un PDF', async ({ page }) => {
    await openToolLanding(page, '/fill-sign-pdf');
    await pickStudioFile(page, FORM_PDF());
    await expect(page.locator('.fs-app')).toBeVisible({ timeout: 60_000 });

    const field = page.locator('input.fs-widget[aria-label="test_value"]');
    await expect(field).toBeVisible({ timeout: 60_000 });
    await field.fill('E2E-OK');
    await expect(field).toHaveValue('E2E-OK');

    // Place a drawn text annotation (survives as Helvetica hex Tj in content stream).
    await page.locator('.fs-tools button').filter({ hasText: /texte|text|texto|metin/i }).click();
    const layer = page.locator('.fs-layer').first();
    await expect(layer).toBeVisible();
    await layer.click({ position: { x: 120, y: 280 } });
    const note = page.locator('.fs-item.text textarea').first();
    await expect(note).toBeVisible({ timeout: 10_000 });
    await note.fill('E2E-MARK');

    await page.locator('.fs-download').click();
    await expect(page.locator('.studio-done-download')).toBeVisible({ timeout: 180_000 });
    const { bytes } = await downloadStudioResult(page);
    const original = fs.readFileSync(FORM_PDF());
    await assertPdf(bytes, { minPages: 1 });
    expect(bytes.byteLength).toBeGreaterThan(original.byteLength);
    expect(pdfContainsText(bytes, 'E2E-MARK')).toBe(true);
  });
});
