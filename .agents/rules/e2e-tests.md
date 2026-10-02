# E2E test rules (Playwright, apps/web/e2e)

## Waiting
- Never use `page.waitForTimeout()`. Wait for a condition:
  `await expect(locator).toBeVisible()`, `await expect(page).toHaveURL(...)`,
  or `page.waitForResponse(...)`.
- The backend adds random 200–1500 ms latency on purpose, so fixed waits make tests flaky.

## Locators
- Prefer `getByRole`, `getByLabel`, `getByText`.
- Use CSS classes (`.cc_card`, `.dc_card`) only when there is no accessible alternative.

## Test data
- Create customers via API with `registerCustomerViaApi` from `e2e/auth.ts`, not through the UI.
- Use `createAccountAtCheckout` only when the test is about the checkout sign-up flow.

## Environment
- `playwright.config.ts` currently points `baseURL` to https://foodme-lianals.onrender.com.
- The first request may be slow (Render free tier wakes up).

## Do not touch
- `flake-*.spec.ts` are intentionally flaky — do not fix them.
- `happy-path.spec.ts` fails because of the planted checkout bug (SCRUM-6) — do not change the test to make it pass.
