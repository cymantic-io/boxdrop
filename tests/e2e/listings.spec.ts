import { test, expect } from '@playwright/test';

test.describe('Listings', () => {
  test('login screen prevents unauthenticated access', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('[data-testid="login-email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="login-password"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-submit"]')).toBeVisible();
  });
});
