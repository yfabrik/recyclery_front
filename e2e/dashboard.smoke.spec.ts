import { expect, test } from '@playwright/test';
import { authenticatePage } from './helpers/auth';

test.describe('Dashboard smoke', () => {
  test.beforeEach(async ({ page, request }) => {
    await authenticatePage(page, request);
  });

  test('loads /dashboard when authenticated via API token', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByText(/^Bonjour,/)).toBeVisible({ timeout: 30_000 });
  });
});
