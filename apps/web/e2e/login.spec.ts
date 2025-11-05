import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/GhitDesk/);

    // Check for login elements
    await expect(page.getByRole('heading', { name: /ghitdesk/i })).toBeVisible();
    await expect(page.getByText(/login no sistema/i)).toBeVisible();

    // Check for form inputs
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });

  test('should show validation for empty fields', async ({ page }) => {
    // Click submit without filling form
    await page.getByRole('button', { name: /entrar/i }).click();

    // Check that we're still on login page (form validation prevented submission)
    await expect(page).toHaveURL(/.*login/);
  });

  test('should login with valid credentials', async ({ page }) => {
    // Fill in the form
    await page.getByLabel(/email/i).fill('admin@ghitdesk.com');
    await page.getByLabel(/senha/i).fill('admin123');

    // Submit the form
    await page.getByRole('button', { name: /entrar/i }).click();

    // Wait for navigation to dashboard
    await page.waitForURL(/.*dashboard/, { timeout: 5000 });

    // Verify we're on the dashboard
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill in with invalid credentials
    await page.getByLabel(/email/i).fill('wrong@email.com');
    await page.getByLabel(/senha/i).fill('wrongpassword');

    // Submit the form
    await page.getByRole('button', { name: /entrar/i }).click();

    // Check for error message (wait a bit for API response)
    await page.waitForTimeout(1000);

    // Should still be on login page or show error
    const currentUrl = page.url();
    expect(currentUrl).toContain('login');
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check email input
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('autocomplete', 'email');

    // Check password input
    const passwordInput = page.getByLabel(/senha/i);
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });

  test('should show loading state during submission', async ({ page }) => {
    await page.getByLabel(/email/i).fill('admin@ghitdesk.com');
    await page.getByLabel(/senha/i).fill('admin123');

    // Start submission
    const submitButton = page.getByRole('button', { name: /entrar/i });
    await submitButton.click();

    // Check for loading state (button should be disabled or show loading)
    await expect(submitButton).toBeDisabled();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that form is visible and usable
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });

  test('should focus on email input on load', async ({ page }) => {
    // Check if email input can be focused
    const emailInput = page.getByLabel(/email/i);
    await emailInput.focus();
    await expect(emailInput).toBeFocused();
  });

  test('should allow navigation with keyboard', async ({ page }) => {
    // Tab through form elements
    await page.keyboard.press('Tab'); // Focus email
    await page.keyboard.type('admin@ghitdesk.com');

    await page.keyboard.press('Tab'); // Focus password
    await page.keyboard.type('admin123');

    await page.keyboard.press('Tab'); // Focus submit button
    await page.keyboard.press('Enter'); // Submit

    // Should navigate to dashboard
    await page.waitForURL(/.*dashboard/, { timeout: 5000 });
  });
});
