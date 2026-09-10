import { test, expect } from '@playwright/test';

test.describe('Admin Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'mecelfab@gmail.com');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  const routes = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Inquiries', path: '/admin/inquiries' },
    { name: 'Quotations', path: '/admin/quotations' },
    { name: 'Work Orders', path: '/admin/work-orders' },
    { name: 'Inventory', path: '/admin/inventory' },
    { name: 'Field Service', path: '/admin/field-service' },
    { name: 'AMCs', path: '/admin/amcs' },
    { name: 'Billing', path: '/admin/billing' },
    { name: 'Clients', path: '/admin/clients' },
    { name: 'Projects', path: '/admin/projects' },
    { name: 'Services', path: '/admin/services' },
    { name: 'Certifications', path: '/admin/certifications' },
    { name: 'Testimonials', path: '/admin/testimonials' },
    { name: 'Content', path: '/admin/content' },
    { name: 'Settings', path: '/admin/settings' }
  ];

  for (const route of routes) {
    test(`Navigates to ${route.name}`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page).toHaveURL(route.path);
      const text = await page.locator('body').innerText();
      expect(text).not.toContain('Application Error boundary caught an exception');
    });
  }
});
