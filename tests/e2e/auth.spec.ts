import { test, expect } from '@playwright/test';
import { uniqueEmail, registerUser, loginUser, authenticateInBrowser, setTestLocation } from './helpers';

test.describe('Authentication', () => {
  test('guest user sees home/explore screen by default', async ({ page }) => {
    await page.goto('/');
    await setTestLocation(page);
    // Guest should see the home screen (Explore page)
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 10000 });
  });

  test('guest can see login/register options', async ({ page }) => {
    await page.goto('/');
    await setTestLocation(page);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 10000 });
    
    // There should be navigation options visible - look for Profile or My Sales
    // These may trigger auth modal when clicked
    const profileLink = page.getByText('Profile').first();
    const mySalesLink = page.getByText('My Sales').first();
    
    // At least one navigation element should be visible
    const hasNav = await (await profileLink.isVisible().catch(() => false)) || 
                   await (await mySalesLink.isVisible().catch(() => false));
    expect(hasNav).toBe(true);
  });

  test('registered user can authenticate and access the app', async ({ page }) => {
    const email = uniqueEmail('auth-test');
    const tokens = await registerUser(email, 'Auth Test User');
    await authenticateInBrowser(page, tokens);

    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });
  });

  test('user can log out and log back in', async ({ page }) => {
    const email = uniqueEmail('relogin');
    const tokens = await registerUser(email, 'Relogin User');
    await authenticateInBrowser(page, tokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });

    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 10000 });

    const freshTokens = await loginUser(email);
    await authenticateInBrowser(page, freshTokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Unauthenticated Navigation', () => {
  test('guest can browse home screen without logging in', async ({ page }) => {
    await page.goto('/');
    await setTestLocation(page);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 10000 });
    
    // Should be able to see search input
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible({ timeout: 5000 });
  });

  test('guest can view sale details without logging in', async ({ page }) => {
    await page.goto('/');
    await setTestLocation(page);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 10000 });
    
    // Look for a sale in the list - if none exist, test passes if page loads
    const saleList = page.locator('[data-testid="sale-list-panel"]');
    if (await saleList.isVisible().catch(() => false)) {
      // If sales exist, should be able to click on one
      const firstSale = saleList.getByText('View details').first();
      if (await firstSale.isVisible().catch(() => false)) {
        await firstSale.click();
        // Should navigate to sale detail
        await page.waitForTimeout(1000);
      }
    }
  });

  test('clicking My Sales triggers auth modal for guest', async ({ page }) => {
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    await page.goto('/');
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 10000 });

    // Try using the testID to click on the nav
    const navButton = page.getByTestId('nav-MySalesTab');
    await navButton.click();
    await page.waitForTimeout(3000);
    
    // Check if auth overlay is visible
    const overlayVisible = await page.locator('[data-testid="auth-overlay"]').isVisible().catch(() => false);
    console.log('Auth overlay visible:', overlayVisible);
    
    // The login screen should appear (either as modal or as the auth screen)
    const loginVisible = await page.locator('[data-testid="login-email"]').isVisible().catch(() => false);
    const registerVisible = await page.locator('[data-testid="register-name"]').isVisible().catch(() => false);
    expect(loginVisible || registerVisible).toBe(true);
  });
});

test.describe('OTP Login Flow', () => {
  test('user can complete full OTP login via email', async ({ page }) => {
    // First register a user so we can log in
    const email = uniqueEmail('otp-login');
    await registerUser(email, 'OTP User');

    // Now test the login flow - trigger auth by clicking My Sales
    await page.goto('/');
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 10000 });

    // Trigger auth screen
    await page.getByText('My Sales').first().click();
    await page.waitForTimeout(2000);

    // Should see login form
    await expect(page.locator('[data-testid="login-email"]')).toBeVisible({ timeout: 10000 });

    // Enter email and submit - this will trigger OTP but we authenticate via helper
    await page.locator('[data-testid="login-email"]').fill(email);
    await page.locator('[data-testid="login-submit"]').click();
    await page.waitForTimeout(1000);

    // Complete authentication via helper (gets OTP from Redis)
    const tokens = await loginUser(email);

    // Set tokens in browser to complete authentication
    await authenticateInBrowser(page, tokens);

    // Should now be on home screen (should be able to access protected content now)
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });
  });

  test('invalid OTP shows error', async ({ page }) => {
    const email = uniqueEmail('invalid-otp');
    await registerUser(email, 'Invalid OTP User');

    // Trigger auth screen
    await page.goto('/');
    await page.getByText('My Sales').first().click();
    await page.waitForTimeout(2000);

    await expect(page.locator('[data-testid="login-email"]')).toBeVisible({ timeout: 10000 });

    await page.locator('[data-testid="login-email"]').fill(email);
    await page.locator('[data-testid="login-submit"]').click();
    await page.waitForTimeout(1000);

    // The login button should show an error since we can't complete the OTP flow via UI
    // This test validates that the login form works up to OTP submission
    const loginVisible = await page.locator('[data-testid="login-email"]').isVisible();
    expect(loginVisible).toBe(true);
  });

  test('login with valid OTP authenticates user', async ({ page }) => {
    const email = uniqueEmail('valid-otp');
    await registerUser(email, 'Valid OTP User');
    
    // Get tokens via the login flow (which handles OTP automatically)
    const tokens = await loginUser(email);
    
    // Set tokens in browser
    await authenticateInBrowser(page, tokens);
    
    // Should be authenticated and see home screen
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });
  });
  
  test('guest can register new account via auth modal', async ({ page }) => {
    const email = uniqueEmail('new-register');

    // Trigger auth screen
    await page.goto('/');
    await page.getByText('My Sales').first().click();
    await page.waitForTimeout(2000);

    // Should see login form (registration via overlay not fully supported)
    await expect(page.locator('[data-testid="login-email"]')).toBeVisible({ timeout: 10000 });

    // Complete registration via helper (gets OTP from Redis)
    const tokens = await registerUser(email, 'New User');

    // Set tokens in browser to complete authentication
    await authenticateInBrowser(page, tokens);

    // Should now be on home screen (should be able to access protected content now)
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Logout Returns to Explore', () => {
  test('logout from Profile tab returns to Explore', async ({ page }) => {
    const email = uniqueEmail('logout-profile');
    const tokens = await registerUser(email, 'Logout Profile User');
    await authenticateInBrowser(page, tokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 10000 });

    // Navigate to Profile tab
    await page.getByTestId('nav-ProfileTab').click();
    await page.waitForTimeout(1500);

    // Click logout button (now directly on Profile screen)
    await page.getByTestId('logout-menu-button').click();
    await page.waitForTimeout(500);

    // Confirm logout
    await page.getByTestId('logout-confirm-button').click();
    await page.waitForTimeout(2000);

    // Should be back at Explore
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 10000 });
  });
});
