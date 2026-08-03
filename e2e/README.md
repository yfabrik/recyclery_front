# E2E tests (Playwright)

Real-stack UI tests: Vite frontend + backend on `:5000` + database.

## Prerequisites

1. Backend running on `http://localhost:5000` with a valid `JWT_SECRET`
2. At least one active user (typically created on first boot via `DEFAULT_USERNAME`, `DEFAULT_MAIL`, `DEFAULT_PASS`)
3. Credentials for that user in env:

```bash
cp .env.e2e.example .env.e2e
# edit E2E_USER_EMAIL / E2E_USER_PASSWORD
```

4. Playwright browsers (once per machine / after upgrading `@playwright/test`):

```bash
npx playwright install chromium
```

## Run

```bash
npm run test:e2e
# or interactive:
npm run test:e2e:ui
```

Playwright starts Vite (`npm run dev`) unless something is already listening on `E2E_BASE_URL` (default `http://localhost:5173`).

## Auth strategy

- **Login page tests** use the UI (`#email` / `#password` → « Se connecter »).
- **Other specs** call `POST /api/auth/login`, then set `localStorage.token` (same key as the app).

## Selectors / smoke markers

| Spec | Assertion |
|------|-----------|
| Login UI | `#email`, `#password`, button « Se connecter », URL `/dashboard`, `localStorage.token` |
| Unauth redirect | `/dashboard` → `/login` |
| Dashboard smoke | URL stays `/dashboard`, text matching `/^Bonjour,/` (greeting in `Dashboard.tsx`) |
