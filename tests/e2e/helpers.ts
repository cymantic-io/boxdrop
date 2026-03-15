import { Page, expect } from '@playwright/test';
import { execSync } from 'child_process';

const API_BASE = 'http://localhost:8080/api';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`;
}

export async function registerUser(email: string, displayName: string): Promise<AuthTokens> {
  const regRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, displayName }),
  });
  if (!regRes.ok) throw new Error(`Register failed: ${regRes.status} ${await regRes.text()}`);
  const { data: { challengeId } } = await regRes.json();

  const otp = getOtpFromRedis(challengeId);

  const verifyRes = await fetch(`${API_BASE}/auth/register/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challengeId, code: otp }),
  });
  if (!verifyRes.ok) throw new Error(`Verify failed: ${verifyRes.status} ${await verifyRes.text()}`);
  const { data } = await verifyRes.json();
  return data as AuthTokens;
}

export async function loginUser(email: string): Promise<AuthTokens> {
  const startRes = await fetch(`${API_BASE}/auth/login/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!startRes.ok) throw new Error(`Login start failed: ${startRes.status}`);
  const { data: { challengeId, methods } } = await startRes.json();

  const method = methods[0];
  if (method !== 'TOTP') {
    await fetch(`${API_BASE}/auth/login/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, method }),
    });
  }

  const otp = getOtpFromRedis(challengeId);

  const verifyRes = await fetch(`${API_BASE}/auth/login/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challengeId, method, code: otp }),
  });
  if (!verifyRes.ok) throw new Error(`Login verify failed: ${verifyRes.status}`);
  const { data } = await verifyRes.json();
  return data as AuthTokens;
}

function getOtpFromRedis(challengeId: string): string {
  const result = execSync(
    `docker exec boxdrop-redis-1 redis-cli GET "auth_otp:${challengeId}"`,
    { encoding: 'utf-8' }
  ).trim();
  if (!result || result === '(nil)') {
    throw new Error(`OTP not found in Redis for challenge ${challengeId}`);
  }
  return result;
}

export async function dismissMapPopups(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.querySelectorAll('.leaflet-popup-close-button').forEach((btn: any) => btn.click());
  });
}

export async function setTestLocation(page: Page): Promise<void> {
  await page.evaluate(() => {
    const store = (window as any).__boxdropLocationStore;
    if (store && store.getState && store.setTestLocation) {
      store.setTestLocation(37.5597, -90.2940);
    }
  });
  await page.waitForTimeout(200);
}

export async function navigateToSaleFromHome(page: Page, saleTitle: string): Promise<void> {
  await dismissMapPopups(page);
  await setTestLocation(page);
  await page.waitForTimeout(3000);
  const listPanel = page.locator('[data-testid="sale-list-panel"]');
  
  // Scroll to top to ensure sales load from beginning
  await listPanel.evaluate((el) => el.scrollTop = 0);
  await page.waitForTimeout(500);
  
  await expect(listPanel.getByText(saleTitle).first()).toBeVisible({ timeout: 10000 });
  await listPanel.getByText(saleTitle).first()
    .locator('..').locator('..').getByText('View details →').click({ timeout: 5000 });
}

export async function authenticateInBrowser(page: Page, tokens: AuthTokens): Promise<void> {
  await page.goto('/');
  await page.evaluate((t) => {
    localStorage.setItem('auth_access_token', t.accessToken);
    localStorage.setItem('auth_refresh_token', t.refreshToken);
    localStorage.setItem('auth_user_id', t.userId);
  }, tokens);
  await page.evaluate(() => {
    const store = (window as any).__boxdropLocationStore;
    if (store && store.getState && store.setTestLocation) {
      store.setTestLocation(37.5597, -90.2940);
    }
  });
  // Navigate to home instead of reload to avoid connection issues
  await page.goto('/');
  await page.waitForTimeout(1000);
}

export async function createSaleViaApi(tokens: AuthTokens, sale: {
  title: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  startsAt: string;
  endsAt: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/sales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokens.accessToken}`,
    },
    body: JSON.stringify(sale),
  });
  if (!res.ok) throw new Error(`Create sale failed: ${res.status}`);
  const { data } = await res.json();
  return data;
}

export async function activateSaleViaApi(tokens: AuthTokens, saleId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/sales/${saleId}/activate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokens.accessToken}` },
  });
  if (!res.ok) throw new Error(`Activate sale failed: ${res.status}`);
  const { data } = await res.json();
  return data;
}

export async function createListingViaApi(tokens: AuthTokens, saleId: string, listing: {
  title: string;
  description?: string;
  startingPrice: number;
  minimumPrice: number;
  category: string;
  condition?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/sales/${saleId}/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokens.accessToken}`,
    },
    body: JSON.stringify(listing),
  });
  if (!res.ok) throw new Error(`Create listing failed: ${res.status}`);
  const { data } = await res.json();
  return data;
}

export async function claimListingViaApi(tokens: AuthTokens, listingId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/transactions/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokens.accessToken}`,
    },
    body: JSON.stringify({ listingId }),
  });
  if (!res.ok) throw new Error(`Claim listing failed: ${res.status}`);
  const { data } = await res.json();
  return data;
}

export async function cancelTransactionViaApi(tokens: AuthTokens, transactionId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/transactions/${transactionId}/cancel`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokens.accessToken}` },
  });
  if (!res.ok) throw new Error(`Cancel transaction failed: ${res.status}`);
  const { data } = await res.json();
  return data;
}

export async function createOfferViaApi(tokens: AuthTokens, listingId: string, amount: number): Promise<any> {
  const res = await fetch(`${API_BASE}/offers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokens.accessToken}`,
    },
    body: JSON.stringify({ listingId, amount }),
  });
  if (!res.ok) throw new Error(`Create offer failed: ${res.status} ${await res.text()}`);
  const { data } = await res.json();
  return data;
}

export async function acceptOfferViaApi(tokens: AuthTokens, offerId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/offers/${offerId}/accept`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokens.accessToken}` },
  });
  if (!res.ok) throw new Error(`Accept offer failed: ${res.status} ${await res.text()}`);
  const { data } = await res.json();
  return data;
}

export async function counterOfferViaApi(tokens: AuthTokens, offerId: string, amount: number): Promise<any> {
  const res = await fetch(`${API_BASE}/offers/${offerId}/counter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokens.accessToken}`,
    },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) throw new Error(`Counter offer failed: ${res.status} ${await res.text()}`);
  const { data } = await res.json();
  return data;
}

export async function getTransactionsViaApi(tokens: AuthTokens): Promise<any[]> {
  const res = await fetch(`${API_BASE}/transactions`, {
    headers: { 'Authorization': `Bearer ${tokens.accessToken}` },
  });
  if (!res.ok) throw new Error(`Get transactions failed: ${res.status}`);
  const { data } = await res.json();
  return data;
}

export async function getThreadViaApi(tokens: AuthTokens, threadId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/messages/threads/${threadId}`, {
    headers: { 'Authorization': `Bearer ${tokens.accessToken}` },
  });
  if (!res.ok) throw new Error(`Get thread failed: ${res.status}`);
  const { data } = await res.json();
  return data;
}
