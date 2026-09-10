import { test, expect } from '@playwright/test';

test.describe('Admin Portal', () => {
  test('Unauthenticated user cannot access admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*auth\/login/);
  });

  test('Admin login succeeds', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'mecelfab@gmail.com');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Now verify we can access the dashboard
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL('/admin/dashboard');
  });
});
