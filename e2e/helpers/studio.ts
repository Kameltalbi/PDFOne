import type { Page, Download, Browser, BrowserContext } from '@playwright/test';
import { expect } from '@playwright/test';
import fs from 'node:fs';
import { nextE2eIp } from '../fixtures';

export async function openToolLanding(page: Page, toolPath: string, fileInput = '.studio-file-input') {
  // BillingProvider starts with loading=true and allowFile short-circuits until /api/billing/me
  // finishes. React Strict Mode remounts once, so wait for two successful me responses when
  // possible before file picks (free >20MB upsell + Pro cookie recognition).
  const billingMe: number[] = [];
  const onResp = (response: { url: () => string; ok: () => boolean }) => {
    if (response.url().includes('/api/billing/me') && response.ok()) billingMe.push(Date.now());
  };
  page.on('response', onResp);
  try {
    await page.goto(`${toolPath}?lang=fr`);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator(fileInput).first()).toBeAttached();
    await expect.poll(() => billingMe.length, { timeout: 30_000 }).toBeGreaterThanOrEqual(1);
    try {
      await expect.poll(() => billingMe.length, { timeout: 3_000 }).toBeGreaterThanOrEqual(2);
    } catch {
      /* single-fetch environments still OK after a settle tick */
    }
    await page.waitForTimeout(250);
  } finally {
    page.off('response', onResp);
  }
}

export async function pickStudioFile(page: Page, filePath: string | string[], fileInput = '.studio-file-input') {
  await page.locator(fileInput).first().setInputFiles(filePath);
}

export async function waitForStudioRun(page: Page) {
  await expect(page.locator('.studio-run')).toBeVisible({ timeout: 60_000 });
}

export async function runStudioTool(page: Page, timeout = 180_000) {
  await page.locator('.studio-run').click();
  await expect(page.locator('.studio-done-download')).toBeVisible({ timeout });
}

export async function downloadStudioResult(page: Page): Promise<{ download: Download; bytes: Buffer; suggestedName: string }> {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('.studio-done-download').click()
  ]);
  const filePath = await download.path();
  if (!filePath) throw new Error('Download path missing');
  const bytes = fs.readFileSync(filePath);
  expect(bytes.byteLength).toBeGreaterThan(64);
  return { download, bytes, suggestedName: download.suggestedFilename() };
}

export async function runToolAndDownload(
  page: Page,
  toolPath: string,
  filePath: string | string[],
  opts: { beforeRun?: (page: Page) => Promise<void>; timeout?: number; fileInput?: string } = {}
) {
  await openToolLanding(page, toolPath, opts.fileInput);
  await pickStudioFile(page, filePath, opts.fileInput);
  await waitForStudioRun(page);
  if (opts.beforeRun) await opts.beforeRun(page);
  await runStudioTool(page, opts.timeout ?? 180_000);
  return downloadStudioResult(page);
}

export async function resetStudio(page: Page) {
  const resetBtn = page.getByRole('button', { name: /autre fichier|another|otro|andere|altro|başka|آخر/i });
  if (await resetBtn.count()) {
    await resetBtn.first().click();
    return;
  }
  await page.goto(`${page.url().split('?')[0]}?lang=fr`);
}

export async function newQuotaIsolatedContext(
  browser: Browser,
  baseURL: string | undefined,
  extra?: Parameters<Browser['newContext']>[0]
): Promise<BrowserContext> {
  return browser.newContext({
    locale: 'fr-FR',
    baseURL,
    extraHTTPHeaders: {
      'X-Forwarded-For': nextE2eIp(),
      ...(extra?.extraHTTPHeaders || {})
    },
    ...extra
  });
}
