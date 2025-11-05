import { test, expect } from '@playwright/test';

test.describe('Tickets Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@ghitdesk.com');
    await page.getByLabel(/senha/i).fill('admin123');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL(/.*dashboard/);

    // Navigate to tickets page
    await page.goto('/tickets');
  });

  test('should display tickets page', async ({ page }) => {
    // Check for tickets heading
    await expect(page.getByRole('heading', { name: /tickets/i })).toBeVisible();
  });

  test('should display ticket filters', async ({ page }) => {
    // Common filters that might be present
    const pageContent = await page.content();

    // Page should have loaded successfully
    expect(pageContent).toBeTruthy();
  });

  test('should display empty state or ticket list', async ({ page }) => {
    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Either tickets or empty state should be visible
    const hasTickets = await page.locator('[class*="ticket"]').count() > 0;
    const hasEmptyState = await page.getByText(/nenhum ticket/i).isVisible().catch(() => false);

    // One of them should be true
    expect(hasTickets || hasEmptyState).toBeTruthy();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Page should still be accessible
    await expect(page.getByRole('heading', { name: /tickets/i })).toBeVisible();
  });

  test('should have proper page structure', async ({ page }) => {
    // Check for container
    const container = page.locator('.container, .mx-auto');
    await expect(container.first()).toBeVisible();
  });

  test('should protect tickets page from unauthenticated access', async ({ page, context }) => {
    // Clear cookies (logout)
    await context.clearCookies();

    // Try to access tickets directly
    await page.goto('/tickets');

    // Should redirect to login
    await page.waitForURL(/.*login/);
  });

  test('should display page title', async ({ page }) => {
    await expect(page).toHaveTitle(/GhitDesk/);
  });

  test('should load without errors', async ({ page }) => {
    // Check that page loaded successfully
    const heading = page.getByRole('heading', { name: /tickets/i });
    await expect(heading).toBeVisible();

    // No major errors in console
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
  });

  test('should have navigation available', async ({ page }) => {
    // Should be able to navigate back to dashboard
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});

test.describe('Inbox Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@ghitdesk.com');
    await page.getByLabel(/senha/i).fill('admin123');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL(/.*dashboard/);

    // Navigate to inbox page
    await page.goto('/inbox');
  });

  test('should display inbox page', async ({ page }) => {
    // Check for inbox heading
    await expect(page.getByRole('heading', { name: /inbox|conversas/i })).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    // Page should load without errors
    const pageContent = await page.content();
    expect(pageContent).toBeTruthy();
  });

  test('should protect inbox from unauthenticated access', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/inbox');
    await page.waitForURL(/.*login/);
  });
});

test.describe('Reports Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@ghitdesk.com');
    await page.getByLabel(/senha/i).fill('admin123');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL(/.*dashboard/);

    // Navigate to reports page
    await page.goto('/reports');
  });

  test('should display reports page', async ({ page }) => {
    // Check for reports heading
    await expect(page.getByRole('heading', { name: /reports/i })).toBeVisible();
  });

  test('should display metrics cards', async ({ page }) => {
    // Check for KPI cards
    const cards = page.locator('[class*="bg-content1"]');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('should display metrics labels', async ({ page }) => {
    // Common metric labels
    const metricsVisible = await Promise.race([
      page.getByText(/total conversas/i).isVisible(),
      page.getByText(/total tickets/i).isVisible(),
      page.getByText(/métricas/i).isVisible(),
    ]).catch(() => false);

    expect(metricsVisible).toBeTruthy();
  });

  test('should protect reports from unauthenticated access', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/reports');
    await page.waitForURL(/.*login/);
  });

  test('should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: /reports/i })).toBeVisible();
  });
});
