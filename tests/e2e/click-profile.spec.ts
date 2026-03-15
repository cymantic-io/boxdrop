import { test, expect } from '@playwright/test';
import { uniqueEmail, registerUser, authenticateInBrowser, setTestLocation } from './helpers';

test('logout from profile screen', async ({ page }) => {
  await page.goto('/');
  await setTestLocation(page);
  await page.waitForTimeout(1000);

  const email = uniqueEmail('test-logout');
  const tokens = await registerUser(email, 'Test User');
  await authenticateInBrowser(page, tokens);
  await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 10000 });

  // Navigate to Profile tab
  await page.getByTestId('nav-ProfileTab').click();
  await page.waitForTimeout(1500);

  // Click logout menu button (now directly on Profile screen)
  await page.getByTestId('logout-menu-button').click();
  await page.waitForTimeout(1000);

  // Confirm logout
  await page.getByTestId('logout-confirm-button').click();
  await page.waitForTimeout(2000);

  // Should be back at Explore
  await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 10000 });
});
