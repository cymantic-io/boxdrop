import { test, expect } from '@playwright/test';
import { uniqueEmail, registerUser, loginUser, authenticateInBrowser, setTestLocation } from './helpers';

test.describe('Multiple Login/Logout Cycles', () => {
  test.skip('user can repeatedly login and logout without errors', async ({ page }) => {
    // TODO: This test depends on RootStack navigation swapping between Auth/Main screens
    // which has architectural issues that need to be resolved
    // This test validates the fix for: "Rendered fewer hooks than expected"
    // which occurred when navigating between Auth and Main screens rapidly

    const email = uniqueEmail('multi-cycle');
    const tokens = await registerUser(email, 'Multi Cycle User');

    // Perform multiple login/logout cycles
    for (let cycle = 1; cycle <= 3; cycle++) {
      console.log(`\n--- Cycle ${cycle} ---`);

      // LOGIN
      console.log(`Logging in (cycle ${cycle})...`);
      await authenticateInBrowser(page, tokens);
      await page.goto('/');
      await setTestLocation(page);

      // Verify authenticated state
      await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({
        timeout: 10000,
      });
      console.log(`✓ Successfully authenticated (cycle ${cycle})`);

      // Wait for navigation to fully settle
      await page.waitForTimeout(1000);

      // Navigate to Profile tab
      console.log(`Navigating to Profile tab (cycle ${cycle})...`);
      await page.getByTestId('nav-ProfileTab').click();
      await page.waitForTimeout(1500);
      console.log(`✓ Profile tab reached (cycle ${cycle})`);

      // LOGOUT - logout button is now directly on Profile screen
      console.log(`Logging out (cycle ${cycle})...`);
      await page.getByTestId('logout-menu-button').click();
      await page.waitForTimeout(500);

      // Confirm logout
      await page.getByTestId('logout-confirm-button').click();
      await page.waitForTimeout(2000);

      // Verify logged out - back at Explore
      await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({
        timeout: 10000,
      });
      console.log(`✓ Successfully logged out and returned to Explore (cycle ${cycle})`);

      // Clear browser state for next cycle
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await page.waitForTimeout(1000);
    }

    console.log('\n✓✓✓ All cycles completed successfully - no React hooks errors!');
  });

  test.skip('rapid auth changes do not cause hook violations', async ({ page }) => {
    // TODO: Depends on RootStack navigation architecture
    // More aggressive test: rapid clicks between authenticated and unauthenticated states

    const email = uniqueEmail('rapid-auth');
    const tokens = await registerUser(email, 'Rapid Auth User');

    for (let i = 0; i < 5; i++) {
      // Authenticate
      await authenticateInBrowser(page, tokens);
      await page.goto('/');
      await setTestLocation(page);
      await page.waitForTimeout(500);

      // Try accessing a protected screen
      await page.getByTestId('nav-MySalesTab').click();
      await page.waitForTimeout(300);

      // Go back to Explore
      await page.getByTestId('nav-HomeTab').click();
      await page.waitForTimeout(300);

      // Logout by clearing tokens
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await page.waitForTimeout(500);

      // Verify back to unauthenticated state
      await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({
        timeout: 5000,
      });
      await page.waitForTimeout(300);
    }

    console.log('✓ Rapid auth changes handled without errors');
  });

  test.skip('login/logout during navigation transitions', async ({ page }) => {
    // TODO: Depends on RootStack navigation architecture
    // Tests the fix by simulating rapid navigation changes during auth state changes

    const email = uniqueEmail('nav-transition');
    const tokens = await registerUser(email, 'Nav Transition User');

    for (let cycle = 1; cycle <= 2; cycle++) {
      // Authenticate
      await authenticateInBrowser(page, tokens);
      await page.goto('/');
      await setTestLocation(page);
      await page.waitForTimeout(800);

      // Multiple tab navigations
      await page.getByTestId('nav-MySalesTab').click();
      await page.waitForTimeout(300);
      await page.getByTestId('nav-MessagesTab').click();
      await page.waitForTimeout(300);
      await page.getByTestId('nav-ProfileTab').click();
      await page.waitForTimeout(300);
      await page.getByTestId('nav-HomeTab').click();
      await page.waitForTimeout(800);

      // Navigate to Profile and logout
      await page.getByTestId('nav-ProfileTab').click();
      await page.waitForTimeout(1000);
      await page.getByTestId('logout-menu-button').click();
      await page.waitForTimeout(300);
      await page.getByTestId('logout-confirm-button').click();
      await page.waitForTimeout(2000);

      // Verify returned to unauthenticated Explore
      await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({
        timeout: 10000,
      });

      // Clear for next cycle
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await page.waitForTimeout(500);
    }

    console.log('✓ Login/logout during navigation transitions handled correctly');
  });
});
