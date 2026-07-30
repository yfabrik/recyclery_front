import { defineConfig, devices } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Load KEY=VALUE pairs from .env.e2e into process.env (does not override existing). */
function loadEnvE2e() {
  const envPath = resolve(process.cwd(), '.env.e2e');
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvE2e();

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:5173';

/**
 * Prefer full Chromium if headless_shell is missing (sandbox/partial installs).
 * Playwright 1.49+ defaults to chromium_headless_shell for headless runs.
 */
function chromiumLaunchOptions(): { executablePath?: string } {
  const browsersPath =
    process.env.PLAYWRIGHT_BROWSERS_PATH ??
    resolve(process.env.LOCALAPPDATA ?? '', 'ms-playwright');
  const headlessShell = resolve(
    browsersPath,
    'chromium_headless_shell-1200',
    'chrome-headless-shell-win64',
    'chrome-headless-shell.exe',
  );
  if (existsSync(headlessShell)) return {};

  const fullChrome = resolve(
    browsersPath,
    'chromium-1200',
    'chrome-win64',
    'chrome.exe',
  );
  if (existsSync(fullChrome)) {
    return { executablePath: fullChrome };
  }
  return {};
}

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Local API/Vite races (ECONNRESET, connection refused) are common with many workers.
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    navigationTimeout: 30_000,
    // launchOptions: chromiumLaunchOptions(),
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
