import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'iPhone 5/SE', width: 320, height: 568 },
  { name: 'iPhone 8', width: 375, height: 667 },
  { name: 'iPhone 12 Pro', width: 390, height: 844 },
  { name: 'iPhone XR/11', width: 414, height: 896 }
];

test.describe('Mobile Viewport Tests', () => {
  for (const vp of viewports) {
    test.describe(`Viewport: ${vp.name} (${vp.width}x${vp.height})`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      test('Admin Dashboard renders correctly without horizontal overflow', async ({ page }) => {
        // Login as admin
        await page.goto('/auth/login');
        await page.fill('input[type="email"]', 'mecelfab@gmail.com');
        await page.fill('input[type="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');
        await page.goto('/admin/dashboard');

        // Check for horizontal overflow
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        
        expect(hasHorizontalScroll).toBe(false);

        // Ensure key elements are visible and not clipped
        const header = page.locator('h2', { hasText: 'CRM Metrics' });
        await expect(header).toBeVisible();

        // Ensure we can scroll down
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        const hasClippedContent = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        
        expect(hasClippedContent).toBe(false);
      });
    });
  }
});
