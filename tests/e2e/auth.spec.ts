import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can see login form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('[data-testid="login-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-password"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-submit"]')).toBeVisible();
  });

  test('user can navigate to register', async ({ page }) => {
    await page.goto('/login');

    await page.getByText('Register').click();

    await expect(page.locator('[data-testid="register-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-submit"]')).toBeVisible();
  });

  test('user sees validation errors with empty form', async ({ page }) => {
    await page.goto('/register');

    await page.locator('[data-testid="register-submit"]').click();

    await expect(page.locator('[data-testid="error-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-password"]')).toBeVisible();
  });
});
