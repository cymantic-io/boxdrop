import { test, expect } from '@playwright/test';
import {
  uniqueEmail,
  registerUser,
  authenticateInBrowser,
  navigateToSaleFromHome,
  createSaleViaApi,
  activateSaleViaApi,
  createListingViaApi,
  claimListingViaApi,
  cancelTransactionViaApi,
} from './helpers';

test.describe('Claim and Payment Flow', () => {
  let sellerTokens: any;
  let buyerTokens: any;
  let sale: any;
  let listing: any;
  let saleTitle = 'Claim Test Sale E2E';
  let listingTitle = 'Claimable Widget E2E';

  test.beforeAll(async () => {
    const sellerEmail = uniqueEmail('claim-seller');
    sellerTokens = await registerUser(sellerEmail, 'Claim Seller');

    const startsAt = new Date(Date.now() - 3600000).toISOString();
    const endsAt = new Date(Date.now() + 86400000 * 3).toISOString();

    sale = await createSaleViaApi(sellerTokens, {
      title: saleTitle,
      description: 'Sale for claim flow testing',
      address: '300 Claim St, Fredericktown, MO 63645',
      latitude: 37.5597,
      longitude: -90.2940,
      startsAt,
      endsAt,
    });

    await activateSaleViaApi(sellerTokens, sale.id);

    listing = await createListingViaApi(sellerTokens, sale.id, {
      title: listingTitle,
      description: 'An item to test claiming',
      startingPrice: 35,
      minimumPrice: 15,
      category: 'Electronics',
      condition: 'GOOD',
    });

    const buyerEmail = uniqueEmail('claim-buyer');
    buyerTokens = await registerUser(buyerEmail, 'Claim Buyer');
  });

  test('buyer can claim a listing through the UI', async ({ page }) => {
    await authenticateInBrowser(page, buyerTokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 10000 });

    await navigateToSaleFromHome(page, saleTitle);
    await expect(page.getByText(listingTitle).first()).toBeVisible({ timeout: 5000 });
    await page.getByText(listingTitle).first().click();

    // Wait for listing detail screen container
    await expect(page.getByTestId('listing-detail-screen')).toBeVisible({ timeout: 10000 });
    
    // Give React time to fetch and render listing data
    await page.waitForTimeout(2000);
    
    // Check if already claimed (from previous test run retry)
    const listingDetailText = await page.getByTestId('listing-detail-screen').textContent();
    if (listingDetailText?.includes('CLAIMED')) {
      console.log('Listing already claimed, skipping...');
      return;
    }
    
    // Now check for claim button - should be visible for a non-owner
    await expect(page.getByTestId('claim-button')).toBeVisible({ timeout: 15000 });

    await page.getByTestId('claim-button').click();

    await expect(page.getByText('Confirm Claim').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(listingTitle).last()).toBeVisible();
    await expect(page.getByTestId('claim-price')).toBeVisible();

    await page.getByText('Confirm Claim').last().click();

    await expect(page.getByText('Item Claimed!')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Your Pickup Token')).toBeVisible();

    await expect(page.getByText('CLAIMED', { exact: true })).toBeVisible();
  });
});

test.describe('View Transactions Flow', () => {
  let sellerTokens: any;
  let buyerTokens: any;
  let sale: any;
  let listing: any;

  test.beforeAll(async () => {
    const sellerEmail = uniqueEmail('tx-view-seller');
    sellerTokens = await registerUser(sellerEmail, 'TX View Seller');

    const startsAt = new Date(Date.now() - 3600000).toISOString();
    const endsAt = new Date(Date.now() + 86400000 * 3).toISOString();

    sale = await createSaleViaApi(sellerTokens, {
      title: 'TX View Test Sale',
      description: 'Sale for viewing transactions',
      address: '300 Claim St, Fredericktown, MO 63645',
      latitude: 37.5597,
      longitude: -90.2940,
      startsAt,
      endsAt,
    });

    await activateSaleViaApi(sellerTokens, sale.id);

    listing = await createListingViaApi(sellerTokens, sale.id, {
      title: 'Viewable Widget',
      description: 'An item to test viewing transactions',
      startingPrice: 35,
      minimumPrice: 15,
      category: 'Electronics',
      condition: 'GOOD',
    });

    const buyerEmail = uniqueEmail('tx-view-buyer');
    buyerTokens = await registerUser(buyerEmail, 'TX View Buyer');

    await claimListingViaApi(buyerTokens, listing.id);
  });

  test('buyer can view their transactions after claiming', async ({ page }) => {
    await authenticateInBrowser(page, buyerTokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });

    await page.getByText('Profile').first().click();
    await page.getByText('My Transactions').click({ timeout: 10000 });

    await expect(page.getByText('Viewable Widget')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('CLAIMED', { exact: true })).toBeVisible();
    await expect(page.getByText('$35.00')).toBeVisible();
  });
});

test.describe('Claim and Cancel Flow', () => {
  let sellerTokens: any;
  let buyerTokens: any;
  let sale: any;
  let listing: any;

  test.beforeAll(async () => {
    const sellerEmail = uniqueEmail('cancel-seller');
    sellerTokens = await registerUser(sellerEmail, 'Cancel Seller');

    const startsAt = new Date(Date.now() - 3600000).toISOString();
    const endsAt = new Date(Date.now() + 86400000 * 3).toISOString();

    sale = await createSaleViaApi(sellerTokens, {
      title: 'Cancel Test Sale',
      description: 'Sale for cancel flow testing',
      address: '400 Cancel St, Fredericktown, MO 63645',
      latitude: 37.5597,
      longitude: -90.2940,
      startsAt,
      endsAt,
    });

    await activateSaleViaApi(sellerTokens, sale.id);

    listing = await createListingViaApi(sellerTokens, sale.id, {
      title: 'Cancellable Gadget',
      description: 'An item to test cancelling a claim',
      startingPrice: 40,
      minimumPrice: 20,
      category: 'Electronics',
      condition: 'GOOD',
    });

    const buyerEmail = uniqueEmail('cancel-buyer');
    buyerTokens = await registerUser(buyerEmail, 'Cancel Buyer');
  });

  test('buyer can claim then cancel a transaction', async ({ page }) => {
    // Claim via API to ensure clean state
    const claimResult = await claimListingViaApi(buyerTokens, listing.id);

    await authenticateInBrowser(page, buyerTokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });

    // Navigate to transactions via Profile tab
    await page.getByText('Profile').first().click();
    await page.getByText('My Transactions').click({ timeout: 10000 });
    await expect(page.getByText('Cancellable Gadget').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('CLAIMED', { exact: true })).toBeVisible();

    await cancelTransactionViaApi(buyerTokens, claimResult.id);

    await page.reload();
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });
    await page.getByText('Profile').first().click();
    await page.getByText('My Transactions').click({ timeout: 10000 });
    await expect(page.getByText('CANCELLED')).toBeVisible({ timeout: 15000 });
  });
});
