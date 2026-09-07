import { test as base, expect } from '@playwright/test';
import { loadE2eEnv } from './helpers/assertFile';

loadE2eEnv();

let ipSeq = 0;

/** Unique TEST-NET-ish IP so free quota (cookie + IP) does not bleed across tests. */
export function nextE2eIp() {
  ipSeq += 1;
  // Include seq + entropy so reused suite runs never collide in the in-memory IP map.
  return `198.51.100.${(ipSeq % 200) + 1}.${(Date.now() + ipSeq) % 997}`;
}

type Fixtures = {
  /** When true, attach pdfone_access from e2e/.env.local (bypasses free daily quota). */
  useProAccess: boolean;
};

export const test = base.extend<Fixtures>({
  useProAccess: [false, { option: true }],

  context: async ({ browser, useProAccess }, use, testInfo) => {
    const baseURL = testInfo.project.use.baseURL || process.env.E2E_BASE_URL || 'http://127.0.0.1:5173';
    const context = await browser.newContext({
      locale: 'fr-FR',
      baseURL,
      extraHTTPHeaders: {
        'X-Forwarded-For': nextE2eIp()
      }
    });

    if (useProAccess) {
      const cookie = process.env.E2E_ACCESS_COOKIE?.trim();
      if (!cookie) {
        await context.close();
        throw new Error('E2E_ACCESS_COOKIE missing — run: npm run test:e2e:mint-pro');
      }
      const origin = new URL(baseURL);
      await context.addCookies([
        {
          name: 'pdfone_access',
          value: cookie,
          domain: origin.hostname,
          path: '/',
          httpOnly: true,
          secure: origin.protocol === 'https:',
          sameSite: 'Lax'
        }
      ]);
    }

    await use(context);
    await context.close();
  }
});

export { expect };
