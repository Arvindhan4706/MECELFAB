import { test, expect } from '@playwright/test';

test.describe('Customer Portal', () => {
  test('Unauthenticated user cannot access portal dashboard', async ({ page }) => {
    await page.goto('/portal');
    await expect(page).toHaveURL(/.*login/);
  });
  
  test('Unauthenticated user cannot access portal equipment', async ({ page }) => {
    await page.goto('/portal/equipment');
    await expect(page).toHaveURL(/.*login/);
  });

  test('Unauthenticated user cannot access portal work orders', async ({ page }) => {
    await page.goto('/portal/work-orders');
    await expect(page).toHaveURL(/.*login/);
  });
});
