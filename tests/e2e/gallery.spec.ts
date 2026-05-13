import { test, expect } from '@playwright/test';

const SEEDED_SLUGS = [
  'cluster-blush',
  'cluster-cobalt',
  'cluster-coral',
  'cluster-lavender',
  'cluster-saffron',
  'cluster-sage',
];

test.describe('@gallery — Phase 2 SC1/SC3/SC4 smoke', () => {
  test('GET /gallery — 200 + 6 piece anchors', async ({ page }) => {
    const response = await page.goto('/gallery');
    expect(response?.status()).toBe(200);
    for (const slug of SEEDED_SLUGS) {
      const anchor = page.locator(`a[href="/gallery/${slug}"]`);
      await expect(anchor).toHaveCount(1);
    }
  });

  test('GET /gallery/cluster-blush — 200 + h1 + IG CTA + og:image', async ({ page }) => {
    const response = await page.goto('/gallery/cluster-blush');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText('Blush cluster');
    await expect(page.locator('a[href="https://ig.me/m/studiobluemli"]')).toHaveCount(1);
    // REVIEWS.md HIGH-4: og:image must match https?://.+/gallery/cluster-blush/hero-800.webp (any host).
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute('content', /^https?:\/\/.+\/gallery\/cluster-blush\/hero-800\.webp$/);
  });

  test('GET /gallery/cluster-sage — available piece shows no Sold badge text', async ({ page }) => {
    await page.goto('/gallery/cluster-sage');
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/\bSold\b/);
  });
});
