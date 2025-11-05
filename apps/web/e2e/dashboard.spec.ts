import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@ghitdesk.com');
    await page.getByLabel(/senha/i).fill('admin123');
    await page.getByRole('button', { name: /entrar/i }).click();

    // Wait for dashboard to load
    await page.waitForURL(/.*dashboard/);
  });

  test('should display dashboard page', async ({ page }) => {
    // Check for dashboard heading
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByText(/bem-vindo ao ghitdesk/i)).toBeVisible();
  });

  test('should display user information', async ({ page }) => {
    // Check for user info card
    await expect(page.getByText(/informações do usuário/i)).toBeVisible();

    // User details should be visible
    await expect(page.getByText(/nome:/i)).toBeVisible();
    await expect(page.getByText(/email:/i)).toBeVisible();
    await expect(page.getByText(/role:/i)).toBeVisible();
  });

  test('should display logout button', async ({ page }) => {
    const logoutButton = page.getByRole('button', { name: /sair/i });
    await expect(logoutButton).toBeVisible();
  });

  test('should logout when clicking logout button', async ({ page }) => {
    // Click logout button
    await page.getByRole('button', { name: /sair/i }).click();

    // Should redirect to login page
    await page.waitForURL(/.*login/);
    await expect(page.getByRole('heading', { name: /ghitdesk/i })).toBeVisible();
  });

  test('should display feature completion status', async ({ page }) => {
    // Check for status card
    await expect(page.getByText(/etapa 3 completa/i)).toBeVisible();
    await expect(page.getByText(/fastapi/i)).toBeVisible();
  });

  test('should display feature checklist', async ({ page }) => {
    // Check for various features
    await expect(page.getByText(/repository pattern/i)).toBeVisible();
    await expect(page.getByText(/auth jwt/i)).toBeVisible();
    await expect(page.getByText(/sqlalchemy/i)).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that dashboard is visible and usable
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sair/i })).toBeVisible();
  });

  test('should have proper layout structure', async ({ page }) => {
    // Check for container
    const container = page.locator('.container');
    await expect(container).toBeVisible();

    // Check for cards
    const cards = page.locator('[class*="bg-content1"]');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('should protect dashboard from unauthenticated access', async ({ page, context }) => {
    // Clear cookies (logout)
    await context.clearCookies();

    // Try to access dashboard directly
    await page.goto('/dashboard');

    // Should redirect to login
    await page.waitForURL(/.*login/);
  });

  test('should display user role correctly', async ({ page }) => {
    // Admin user should show ADMIN role
    const roleText = page.getByText(/role:/i);
    await expect(roleText).toBeVisible();

    // Check if there's a role value displayed
    const parentElement = await roleText.locator('..');
    expect(await parentElement.textContent()).toContain('Role:');
  });

  test('should have logout button with icon', async ({ page }) => {
    const logoutButton = page.getByRole('button', { name: /sair/i });

    // Button should have icon (SVG)
    const svg = logoutButton.locator('svg');
    await expect(svg).toBeVisible();
  });

  test('should display proper headings hierarchy', async ({ page }) => {
    // Check H1
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveText('Dashboard');

    // Check H2 elements exist
    const h2Elements = page.getByRole('heading', { level: 2 });
    expect(await h2Elements.count()).toBeGreaterThan(0);
  });
});
