import { type APIRequestContext, type Page, expect } from '@playwright/test';

export type LoginCredentials = {
  email: string;
  password: string;
};

type LoginApiEnvelope = {
  success: boolean;
  data?: {
    token: string;
    user: {
      id: number;
      username: string;
      email: string;
      role: string;
    };
  };
  message?: string;
};

export function getE2eCredentials(): LoginCredentials {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'E2E_USER_EMAIL and E2E_USER_PASSWORD must be set (see .env.e2e.example).',
    );
  }

  return { email, password };
}

export function getE2eApiUrl(): string {
  return process.env.E2E_API_URL ?? 'http://localhost:5000';
}

/** Obtain a JWT via the real backend login endpoint. */
export async function loginViaApi(
  request: APIRequestContext,
  credentials: LoginCredentials = getE2eCredentials(),
): Promise<string> {
  const response = await request.post(`${getE2eApiUrl()}/api/auth/login`, {
    data: {
      email: credentials.email,
      password: credentials.password,
    },
  });

  expect(
    response.ok(),
    `API login failed (${response.status()}): ${await response.text()}`,
  ).toBeTruthy();

  const body = (await response.json()) as LoginApiEnvelope;
  const token = body.data?.token;
  expect(token, 'Login response missing data.token').toBeTruthy();
  return token!;
}

/**
 * Inject JWT into localStorage before any app script runs.
 * Must be called before the first navigation to the app origin.
 */
export async function injectAuthToken(page: Page, token: string): Promise<void> {
  await page.addInitScript((authToken) => {
    window.localStorage.setItem('token', authToken);
  }, token);
}

/** API login + inject token for authenticated UI specs. */
export async function authenticatePage(
  page: Page,
  request: APIRequestContext,
  credentials: LoginCredentials = getE2eCredentials(),
): Promise<string> {
  const token = await loginViaApi(request, credentials);
  await injectAuthToken(page, token);
  return token;
}
