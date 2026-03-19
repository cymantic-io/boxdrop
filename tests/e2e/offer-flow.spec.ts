import { test, expect } from '@playwright/test';
import {
  uniqueEmail,
  registerUser,
  authenticateInBrowser,
  openChatThreadInBrowser,
  createSaleViaApi,
  activateSaleViaApi,
  createListingViaApi,
  createOfferViaApi,
  getTransactionsViaApi,
  getThreadViaApi,
  waitForOfferInThreadViaApi,
} from './helpers';

test.describe('Offer: Buyer offers, Seller accepts', () => {
  let sellerTokens: any;
  let buyerTokens: any;
  let sale: any;
  let listing: any;

  test.beforeAll(async () => {
    const sellerEmail = uniqueEmail('offer-seller');
    sellerTokens = await registerUser(sellerEmail, 'Offer Seller');

    const startsAt = new Date(Date.now() - 3600000).toISOString();
    const endsAt = new Date(Date.now() + 86400000 * 3).toISOString();

    sale = await createSaleViaApi(sellerTokens, {
      title: 'Offer Accept Sale',
      description: 'Sale for offer accept flow testing',
      address: '500 Offer St, Fredericktown, MO 63645',
      latitude: 37.5597,
      longitude: -90.2940,
      startsAt,
      endsAt,
    });

    await activateSaleViaApi(sellerTokens, sale.id);

    listing = await createListingViaApi(sellerTokens, sale.id, {
      title: 'Offer Test Widget',
      description: 'An item to test offer accept flow',
      startingPrice: 50,
      minimumPrice: 15,
      category: 'Electronics',
      condition: 'GOOD',
    });

    const buyerEmail = uniqueEmail('offer-buyer');
    buyerTokens = await registerUser(buyerEmail, 'Offer Buyer');
  });

  test('buyer makes offer, seller accepts in chat, transaction is created', async ({ browser }) => {
    // --- Buyer: create offer via API ---
    const offerResult = await createOfferViaApi(buyerTokens, listing.id, 30);
    const threadId = offerResult.thread.id;
    const offerId = offerResult.offer.id;
    await waitForOfferInThreadViaApi(buyerTokens, threadId, 30);

    // --- Buyer: verify offer appears in chat ---
    const buyerContext = await browser.newContext({
      geolocation: { latitude: 37.5597, longitude: -90.2940 },
      permissions: ['geolocation'],
    });
    const buyerPage = await buyerContext.newPage();
    await authenticateInBrowser(buyerPage, buyerTokens);
    await expect(buyerPage.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });
    await openChatThreadInBrowser(buyerPage, threadId, listing.title);

    // Verify the offer card shows in chat
    await expect(buyerPage.getByText('$30.00')).toBeVisible({ timeout: 10000 });
    await expect(buyerPage.getByText('PENDING', { exact: true }).first()).toBeVisible({ timeout: 5000 });

    await buyerPage.close();
    await buyerContext.close();

    // --- Seller: accept the offer in the chat UI ---
    const sellerContext = await browser.newContext({
      geolocation: { latitude: 37.5597, longitude: -90.2940 },
      permissions: ['geolocation'],
    });
    const sellerPage = await sellerContext.newPage();
    await authenticateInBrowser(sellerPage, sellerTokens);
    await expect(sellerPage.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });
    await openChatThreadInBrowser(sellerPage, threadId, listing.title);

    // Should see the offer card with Accept button
    await expect(sellerPage.getByText('$30.00')).toBeVisible({ timeout: 10000 });
    await sellerPage.getByText('Accept', { exact: true }).click();

    // Offer should become ACCEPTED
    await expect(sellerPage.getByText('ACCEPTED', { exact: true })).toBeVisible({ timeout: 10000 });

    await sellerPage.close();
    await sellerContext.close();

    // --- Verify: transaction exists ---
    const buyerTxns = await getTransactionsViaApi(buyerTokens);
    const offerTxn = buyerTxns.find((t: any) => t.listingId === listing.id);
    expect(offerTxn).toBeTruthy();
    expect(offerTxn.status).toBe('CLAIMED');
    expect(parseFloat(offerTxn.amount)).toBe(30);
  });
});

test.describe('Offer: Seller counteroffers, Buyer accepts', () => {
  let sellerTokens: any;
  let buyerTokens: any;
  let listing: any;

  test.beforeAll(async () => {
    const sellerEmail = uniqueEmail('counter-seller');
    sellerTokens = await registerUser(sellerEmail, 'Counter Seller');

    const startsAt = new Date(Date.now() - 3600000).toISOString();
    const endsAt = new Date(Date.now() + 86400000 * 3).toISOString();

    const sale = await createSaleViaApi(sellerTokens, {
      title: 'Counter Offer Sale',
      description: 'Sale for counter offer flow testing',
      address: '600 Counter St, Fredericktown, MO 63645',
      latitude: 37.5597,
      longitude: -90.2940,
      startsAt,
      endsAt,
    });

    await activateSaleViaApi(sellerTokens, sale.id);

    listing = await createListingViaApi(sellerTokens, sale.id, {
      title: 'Counter Test Gadget',
      description: 'An item to test counter offer flow',
      startingPrice: 80,
      minimumPrice: 20,
      category: 'Electronics',
      condition: 'GOOD',
    });

    const buyerEmail = uniqueEmail('counter-buyer');
    buyerTokens = await registerUser(buyerEmail, 'Counter Buyer');
  });

  test('buyer offers, seller counters via chat, buyer accepts counter, transaction is created', async ({ browser }) => {
    // --- Buyer: create offer via API ---
    const offerResult = await createOfferViaApi(buyerTokens, listing.id, 40);
    const threadId = offerResult.thread.id;
    const initialOfferId = offerResult.offer.id;
    await waitForOfferInThreadViaApi(buyerTokens, threadId, 40);

    // --- Seller: open chat and counter the offer ---
    const sellerContext = await browser.newContext({
      geolocation: { latitude: 37.5597, longitude: -90.2940 },
      permissions: ['geolocation'],
    });
    const sellerPage = await sellerContext.newPage();
    await authenticateInBrowser(sellerPage, sellerTokens);
    await expect(sellerPage.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });
    await openChatThreadInBrowser(sellerPage, threadId, listing.title);

    // See the pending offer
    await expect(sellerPage.getByText('$40.00')).toBeVisible({ timeout: 10000 });

    // Click Counter button (exact match to avoid matching sale title)
    await sellerPage.getByText('Counter', { exact: true }).click();

    // Fill in counter amount — the counter input is inside the offer card
    const counterInput = sellerPage.getByPlaceholder('Amount');
    await counterInput.fill('60');

    // Click the Send button next to the Amount input (inside the counter input row)
    const counterRow = counterInput.locator('..');
    await counterRow.getByText('Send', { exact: true }).click();

    // Original offer should become SUPERSEDED, new counter should appear
    await expect(sellerPage.getByText('SUPERSEDED')).toBeVisible({ timeout: 10000 });
    await expect(sellerPage.getByText('$60.00')).toBeVisible({ timeout: 5000 });

    await sellerPage.close();
    await sellerContext.close();

    // --- Buyer: open chat and accept the counter ---
    const buyerContext = await browser.newContext({
      geolocation: { latitude: 37.5597, longitude: -90.2940 },
      permissions: ['geolocation'],
    });
    const buyerPage = await buyerContext.newPage();
    await authenticateInBrowser(buyerPage, buyerTokens);
    await expect(buyerPage.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });
    await openChatThreadInBrowser(buyerPage, threadId, listing.title);

    // See the counter offer at $60
    await expect(buyerPage.getByText('$60.00')).toBeVisible({ timeout: 10000 });

    // Accept the counter offer
    await buyerPage.getByText('Accept', { exact: true }).click();

    // Should become ACCEPTED
    await expect(buyerPage.getByText('ACCEPTED', { exact: true })).toBeVisible({ timeout: 10000 });

    await buyerPage.close();
    await buyerContext.close();

    // --- Verify: transaction exists at counter price ---
    const buyerTxns = await getTransactionsViaApi(buyerTokens);
    const counterTxn = buyerTxns.find((t: any) => t.listingId === listing.id);
    expect(counterTxn).toBeTruthy();
    expect(counterTxn.status).toBe('CLAIMED');
    expect(parseFloat(counterTxn.amount)).toBe(60);

    // Verify thread shows offer history
    const thread = await getThreadViaApi(buyerTokens, threadId);
    const offerMessages = thread.messages.filter((m: any) => m.offer);
    expect(offerMessages.length).toBeGreaterThanOrEqual(2);

    const statuses = offerMessages.map((m: any) => m.offer.status);
    expect(statuses).toContain('SUPERSEDED');
    expect(statuses).toContain('ACCEPTED');
  });
});
