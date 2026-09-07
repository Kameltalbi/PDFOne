import { test, expect } from '../fixtures';
import { LARGE_PDF } from '../helpers/fixtures';
import { openToolLanding, pickStudioFile, runStudioTool, downloadStudioResult, waitForStudioRun } from '../helpers/studio';
import { assertPdf } from '../helpers/assertFile';

const accessCookie = process.env.E2E_ACCESS_COOKIE?.trim();

/**
 * Requires e2e/.env.local with E2E_ACCESS_COOKIE (never commit that file).
 * Generate: npm run test:e2e:mint-pro
 */
test.describe('Utilisateur Pro', () => {
  test.skip(!accessCookie, 'Run npm run test:e2e:mint-pro first (writes e2e/.env.local)');
  test.use({ useProAccess: true });

  test('accepte un PDF > 20 Mo et produit un PDF valide', async ({ page }) => {
    await openToolLanding(page, '/compress');
    await pickStudioFile(page, LARGE_PDF());
    await waitForStudioRun(page);
    const high = page.getByRole('button', { name: /élevée|high|alta|hoch|elevata|yüksek|عالية/i });
    if (await high.count()) await high.first().click();
    await runStudioTool(page, 300_000);
    const { bytes } = await downloadStudioResult(page);
    await assertPdf(bytes, { minPages: 1 });
    expect(bytes.byteLength).toBeGreaterThan(64);
  });
});
