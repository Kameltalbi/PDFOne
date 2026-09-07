import { test, expect } from '../fixtures';
import { LARGE_PDF, SMALL_PDF } from '../helpers/fixtures';
import { assertEncryptedPdf, assertPdf } from '../helpers/assertFile';
import {
  downloadStudioResult,
  openToolLanding,
  pickStudioFile,
  runStudioTool,
  runToolAndDownload,
  waitForStudioRun
} from '../helpers/studio';

test.describe('Visiteur Google → outils PDF', () => {
  test.describe('avec accès Pro (évite le quota)', () => {
    test.use({ useProAccess: true });

    test('compress: ouvrir → fichier → traiter → télécharger', async ({ page }) => {
      const { bytes } = await runToolAndDownload(page, '/compress', SMALL_PDF());
      await assertPdf(bytes, { minPages: 1 });
    });

    test('enchaîner compress puis protect', async ({ page }) => {
      await runToolAndDownload(page, '/compress', SMALL_PDF());
      await openToolLanding(page, '/protect');
      await pickStudioFile(page, SMALL_PDF());
      await waitForStudioRun(page);
      await page.locator('#password').fill('e2e-test-pass');
      await page.locator('#confirm-password').fill('e2e-test-pass');
      await runStudioTool(page);
      const { bytes } = await downloadStudioResult(page);
      await assertEncryptedPdf(bytes);
    });
  });

  test('gratuit: fichier > 20 Mo ouvre l’offre Pro', async ({ page }) => {
    await openToolLanding(page, '/compress');
    await page.locator('.studio-file-input').setInputFiles(LARGE_PDF());
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('.studio-run')).toHaveCount(0);
  });
});
