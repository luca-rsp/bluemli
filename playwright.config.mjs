// playwright.config.mjs — minimal Playwright 1.x config for the gallery smoke test.
// LOCAL-ONLY per REVIEWS.md MEDIUM-4. CI uses dist/client greps instead to stay within budget.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4321',
  },
  webServer: {
    command: 'pnpm exec astro preview --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
