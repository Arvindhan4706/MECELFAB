import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Portal IDOR Tests', () => {
  let eqB_id;

  test.beforeAll(async () => {
    // Find or create Customer B
    let userB = await prisma.user.findUnique({ where: { email: 'customerB@test.com' } });
    if (!userB) {
      userB = await prisma.user.create({
        data: { name: 'Customer B', email: 'customerB@test.com', role: 'CUSTOMER' }
      });
    }

    let customerB = await prisma.customer.findFirst({ where: { email: 'customerB@test.com' } });
    if (!customerB) {
      customerB = await prisma.customer.create({
        data: { userId: userB.id, companyName: 'Customer B Corp', contactPerson: 'Customer B', email: 'customerB@test.com' }
      });
    }

    // Find or create Equipment B
    let eqB = await prisma.equipment.findFirst({ where: { serialNumber: 'SN-B' } });
    if (!eqB) {
      eqB = await prisma.equipment.create({
        data: { customerId: customerB.id, type: 'M-200', serialNumber: 'SN-B' }
      });
    }
    eqB_id = eqB.id;
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Customer A cannot view Customer B equipment details', async ({ page }) => {
    expect(eqB_id).toBeDefined();

    // Login as Customer A
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'customerA@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Customers are redirected to /portal usually. Let's wait for any navigation
    await page.waitForURL(url => url.pathname.startsWith('/portal') || url.pathname === '/');

    // Test 1: Try to navigate directly to Customer B's equipment page
    await page.goto(`/portal/equipment/${eqB_id}`);
    
    // We expect this to either be a 404 or redirect back to portal dashboard
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('SN-B');
    expect(bodyText).not.toContain('M-200');

    // Test 2: Customer A cannot access /admin/dashboard
    await page.goto('/admin/dashboard');
    const adminBody = await page.locator('body').innerText();
    // Middleware or layout should redirect or show unauthorized
    // If it renders the dashboard, it will have "Admin Dashboard"
    expect(adminBody).not.toContain('Revenue');
    expect(adminBody).not.toContain('Active Work Orders');
  });
});
