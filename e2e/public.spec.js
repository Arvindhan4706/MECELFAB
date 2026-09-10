import { test, expect } from '@playwright/test';

test.describe('Public Website', () => {
  test('Home page loads', async ({ page }) => {
    const response = await page.goto('/');
    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle(/MECELFAB/i);
  });

  test('Navigation links work', async ({ page }) => {
    await page.goto('/');
    await page.click('nav a[href="/about"]');
    await expect(page).toHaveURL(/.*about/);
    
    await page.click('nav a[href="/services"]');
    await expect(page).toHaveURL(/.*services/);

    await page.click('nav a[href="/projects"]');
    await expect(page).toHaveURL(/.*projects/);

    await page.click('nav a[href="/industries"]');
    await expect(page).toHaveURL(/.*industries/);

    await page.click('nav a[href="/contact"]');
    await expect(page).toHaveURL(/.*contact/);
  });
});
