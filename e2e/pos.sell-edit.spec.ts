import { expect, test, type Page } from '@playwright/test';
import {
  authenticatePage,
  getE2eApiUrl,
  getE2eCredentials,
} from './helpers/auth';

const hasE2eCredentials = () => {
  try {
    getE2eCredentials();
    return true;
  } catch {
    return false;
  }
};

async function fillPromptMoney(page: Page, amount: string) {
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toBeVisible();
  const input = dialog.locator('input').first();
  await input.fill(amount);
  await dialog.getByRole('button', { name: /Valider/i }).click();
}

test.describe('POS sell & edit', () => {
  test.beforeEach(async ({ page, request }) => {
    test.skip(
      !hasE2eCredentials(),
      'E2E_USER_EMAIL / E2E_USER_PASSWORD not set',
    );

    try {
      await request.post(`${getE2eApiUrl()}/api/auth/login`, {
        data: { email: 'probe@invalid', password: 'x' },
        failOnStatusCode: false,
        timeout: 5_000,
      });
    } catch {
      test.skip(true, `API not reachable at ${getE2eApiUrl()}`);
    }

    await authenticatePage(page, request);
  });

  test('sell with global promo then edit keeps totals', async ({ page }) => {
    await page.goto('/pos');

    const noSession = page.getByText(/Aucune session de caisse active/i);
    if (await noSession.isVisible().catch(() => false)) {
      test.skip(true, 'No open cash session for E2E user');
    }

    await expect(page.getByText('Ajouter Article')).toBeVisible({
      timeout: 30_000,
    });

    await page.getByRole('button', { name: /Article Manuel/i }).click();
    await expect(
      page.getByRole('heading', { name: /Ajouter un Article Manuel/i }),
    ).toBeVisible();

    // Category (MUI select)
    await page.getByLabel(/Cat[eé]gorie/i).click();
    await page.getByRole('option').nth(1).click();

    // Price via numeric prompt (field opens Prompt on click)
    await page.getByLabel(/Prix de vente/i).click();
    await fillPromptMoney(page, '7.77');

    // Weight may also be required
    const weightField = page.getByLabel(/Poids/i);
    if (await weightField.isVisible().catch(() => false)) {
      await weightField.click();
      await fillPromptMoney(page, '0.5');
    }

    await page.getByRole('button', { name: /Ajouter au Panier/i }).click();

    // Bump quantity to 3 in cart table
    const plusButtons = page.getByRole('button', { name: /^\+$|^Increase/i });
    // Cart uses IconButton with Add icon — click the + next to quantity twice
    const qtyPlus = page.locator('table').getByRole('button').filter({
      has: page.locator('svg[data-testid="AddIcon"]'),
    });
    if ((await qtyPlus.count()) > 0) {
      await qtyPlus.first().click();
      await qtyPlus.first().click();
    }

    // Global promo 10%
    const promoValue = page.getByLabel(/^Valeur$/i);
    await expect(promoValue).toBeVisible({ timeout: 15_000 });
    await promoValue.fill('10');

    // due = round(7.77 * 3 * 0.9) = 20.98
    await expect(page.getByText(/20[,.]98/)).toBeVisible({ timeout: 10_000 });

    const amountInput = page.getByLabel(/Montant/i).first();
    await amountInput.fill('20.98');

    const encaisser = page.getByRole('button', { name: /Encaisser/i });
    await expect(encaisser).toBeEnabled();
    await encaisser.click();

    await expect(page.getByText(/succ[eè]s/i).first()).toBeVisible({
      timeout: 30_000,
    });

    await page.getByRole('button', { name: /Voir Historique/i }).click();
    await expect(
      page.getByText(/Historique des transactions/i),
    ).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: /Modifier/i }).first().click();

    await expect(
      page.getByText(/Modifier la Transaction/i),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Promotion globale \(10%\)/)).toBeVisible();
    await expect(page.getByText(/20[,.]98/)).toBeVisible();

    const save = page.getByRole('button', { name: /Enregistrer/i });
    await expect(save).toBeEnabled();
    await save.click();

    await expect(page.getByText(/mise à jour|succ[eè]s/i).first()).toBeVisible({
      timeout: 30_000,
    });
  });
});
