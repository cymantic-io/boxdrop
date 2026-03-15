import { test, expect } from '@playwright/test';
import {
  uniqueEmail,
  registerUser,
  loginUser,
  authenticateInBrowser,
} from './helpers';

function toDateTimeLocalString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

test.describe('Seller Flow', () => {
  let sellerTokens: any;
  let sellerEmail: string;

  test.beforeAll(async () => {
    sellerEmail = uniqueEmail('seller');
    sellerTokens = await registerUser(sellerEmail, 'Test Seller');
  });

  test('seller can register and access home screen', async ({ page }) => {
    await authenticateInBrowser(page, sellerTokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });
  });

  test('seller can create a sale via the Create Sale form', async ({ page }) => {
    await authenticateInBrowser(page, sellerTokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });

    await page.getByText('My Sales').first().click();
    await page.getByText('New Sale').click({ timeout: 10000 });
    await expect(page.getByText('Create a Sale')).toBeVisible({ timeout: 10000 });

    await page.getByPlaceholder('e.g., Moving Sale').fill('E2E Test Garage Sale');
    await page.getByPlaceholder('Describe your sale').fill('A test sale created by E2E tests');
    await page.getByPlaceholder('123 Main St').fill('100 Test St, Fredericktown, MO 63645');

    const startDate = new Date(Date.now() + 3600000);
    const endDate = new Date(Date.now() + 86400000);
    const dateInputs = page.locator('input[type="datetime-local"]');
    await dateInputs.nth(0).fill(toDateTimeLocalString(startDate));
    await dateInputs.nth(1).fill(toDateTimeLocalString(endDate));

    await page.getByText('Create Sale & Add Items').click();

    await expect(page.getByText('0 items added')).toBeVisible({ timeout: 10000 });
  });

  test('seller can add items to a sale', async ({ page }) => {
    await authenticateInBrowser(page, sellerTokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });

    await page.getByText('My Sales').first().click();
    await page.getByText('New Sale').click({ timeout: 10000 });
    await expect(page.getByText('Create a Sale')).toBeVisible({ timeout: 10000 });

    await page.getByPlaceholder('e.g., Moving Sale').fill('Sale With Items');
    await page.getByPlaceholder('123 Main St').fill('200 Test St, Fredericktown, MO 63645');
    const startDate = new Date(Date.now() + 3600000);
    const endDate = new Date(Date.now() + 86400000);
    const dateInputs = page.locator('input[type="datetime-local"]');
    await dateInputs.nth(0).fill(toDateTimeLocalString(startDate));
    await dateInputs.nth(1).fill(toDateTimeLocalString(endDate));
    await page.getByText('Create Sale & Add Items').click();
    await expect(page.getByText('0 items added')).toBeVisible({ timeout: 10000 });

    await page.getByPlaceholder('Item title').fill('Vintage Lamp');
    await page.getByPlaceholder('Category').fill('Furniture');
    await page.getByPlaceholder('Starting price').fill('25');
    await page.getByPlaceholder('Min price').fill('10');
    await page.getByRole('button', { name: 'Add Item' }).click();

    await expect(page.getByText('1 item added')).toBeVisible({ timeout: 10000 });

    await page.getByPlaceholder('Item title').fill('Board Game Collection');
    await page.getByPlaceholder('Category').fill('Toys');
    await page.getByPlaceholder('Starting price').fill('15');
    await page.getByPlaceholder('Min price').fill('5');
    await page.getByRole('button', { name: 'Add Item' }).click();

    await expect(page.getByText('2 items added')).toBeVisible({ timeout: 10000 });

    await expect(page.getByText('Vintage Lamp')).toBeVisible();
    await expect(page.getByText('Board Game Collection')).toBeVisible();
  });

  test('seller can log out and log back in', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();

    // After logout, guest sees home screen
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 10000 });

    const freshTokens = await loginUser(sellerEmail);
    await authenticateInBrowser(page, freshTokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });
  });
});
