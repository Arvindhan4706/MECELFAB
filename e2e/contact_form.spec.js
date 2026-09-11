import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test('Submits contact form successfully', async ({ page }) => {
    await page.goto('/contact');
    
    // Check if the form is present
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Fill the form
    await page.fill('input[name="fullName"]', 'QA Tester');
    await page.fill('input[name="email"]', 'qa@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.fill('input[name="companyName"]', 'QA Corp');
    await page.fill('input[name="projectLocation"]', 'Mumbai');
    await page.fill('input[name="expectedTimeline"]', '3-4 months');
    // For serviceRequired select:
    await page.selectOption('select[name="serviceRequired"]', { index: 1 });
    await page.fill('textarea[name="projectDescription"]', 'This is a test message from Playwright E2E.');

    // Submit
    await page.click('button[type="submit"]');

    // Check for success message
    const successMsg = page.locator('text=/successfully|Thank you|REQUEST RECEIVED/i').first();
    await expect(successMsg).toBeVisible({ timeout: 10000 });
  });
});
