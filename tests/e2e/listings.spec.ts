import { test, expect } from '@playwright/test';
import {
  uniqueEmail,
  registerUser,
  authenticateInBrowser,
  navigateToSaleFromHome,
  createSaleViaApi,
  activateSaleViaApi,
  createListingViaApi,
} from './helpers';

test.describe('Listings', () => {
  let buyerTokens: any;
  let sale: any;
  let listing: any;

  test.beforeAll(async () => {
    const sellerEmail = uniqueEmail('listing-seller');
    const sellerTokens = await registerUser(sellerEmail, 'Listing Seller');

    const startsAt = new Date(Date.now() - 3600000).toISOString();
    const endsAt = new Date(Date.now() + 86400000 * 3).toISOString();

    sale = await createSaleViaApi(sellerTokens, {
      title: 'Listing Detail Test Sale',
      description: 'Testing listing details',
      address: '500 Listing St, Fredericktown, MO 63645',
      latitude: 37.5597,
      longitude: -90.2940,
      startsAt,
      endsAt,
    });

    await activateSaleViaApi(sellerTokens, sale.id);

    listing = await createListingViaApi(sellerTokens, sale.id, {
      title: 'Detail Test Item',
      description: 'An item with full details for testing',
      startingPrice: 99.99,
      minimumPrice: 40,
      category: 'Electronics',
      condition: 'LIKE_NEW',
    });

    const buyerEmail = uniqueEmail('listing-buyer');
    buyerTokens = await registerUser(buyerEmail, 'Listing Buyer');
  });

  test('listing detail shows all information', async ({ page }) => {
    await authenticateInBrowser(page, buyerTokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 10000 });

    await navigateToSaleFromHome(page, 'Listing Detail Test Sale');
    await expect(page.getByText('Detail Test Item').first()).toBeVisible({ timeout: 5000 });
    await page.getByText('Detail Test Item').first().click();

    await expect(page.getByText('Detail Test Item').last()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('$99.99').last()).toBeVisible();
    await expect(page.getByText('Electronics').last()).toBeVisible();
    await expect(page.getByText('LIKE NEW').last()).toBeVisible();
    await expect(page.getByText('AVAILABLE').last()).toBeVisible();
    await expect(page.getByText('An item with full details for testing')).toBeVisible();
  });

  test('listing shows no photos placeholder when no images', async ({ page }) => {
    await authenticateInBrowser(page, buyerTokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 10000 });

    await navigateToSaleFromHome(page, 'Listing Detail Test Sale');
    await expect(page.getByText('Detail Test Item').first()).toBeVisible({ timeout: 5000 });
    await page.getByText('Detail Test Item').first().click();

    await expect(page.getByText('No Photos')).toBeVisible({ timeout: 5000 });
  });

  test('listing save button toggles between Save and Saved', async ({ page }) => {
    await authenticateInBrowser(page, buyerTokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 10000 });

    await navigateToSaleFromHome(page, 'Listing Detail Test Sale');
    await expect(page.getByText('Detail Test Item').first()).toBeVisible({ timeout: 5000 });
    await page.getByText('Detail Test Item').first().click();
    await expect(page.getByText('$99.99').last()).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: 'Saved' }).click();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible({ timeout: 5000 });
  });
});
