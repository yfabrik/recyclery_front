import { expect, test } from '@playwright/test';
import { getE2eCredentials } from './helpers/auth';

test.describe('Auth — login UI', () => {
  test('logs in via the form and stores the JWT', async ({ page }) => {
    const { email, password } = getE2eCredentials();

    await page.goto('/login');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });


    const token = await page.evaluate(() => window.localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });

  test('redirects unauthenticated /dashboard to /login', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => window.localStorage.removeItem('token'));

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });
});
