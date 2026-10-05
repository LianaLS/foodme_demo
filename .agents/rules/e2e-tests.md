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
- Never change seed chefs/dishes from tests. Tests that change state (e.g. order status) create their own order.

## Environment
- `playwright.config.ts` currently points `baseURL` to https://foodme-lianals.onrender.com.
- The first request may be slow (Render free tier wakes up).
- Use relative URLs (`/api/...`) so requests follow `baseURL`. Do not hard-code `http://localhost:8081`.
- Against Render run with `--workers=2` (the npm scripts do this); more parallel workers cause timeouts that are not product defects.

## Traceability and tags (ISTQB — see test-design.md)
Every new test has a details object:
```ts
test("title", {
  tag: ["@regression"],            // + "@smoke" for one happy path per High-risk area, "@api" for API tests
  annotation: [
    { type: "testCase", description: "TC-19" },
    { type: "requirement", description: "REQ-07" },
  ],
}, async ({ page }) => { … });
```
- Suites: `npm run test:smoke`, `test:regression`, `test:api`, `test:a11y`; component tests `npm run test:unit`.
- API tests go to `e2e/api/*.api.spec.ts` and use helpers from `e2e/api/api-helpers.ts`.
- Known (logged) defects: `test.fail(…)` + tag `@known-defect` + `{ type: "issue", description: "<key>" }`. New, unlogged defects stay red. Details: `defect-management.md`.
- Assert what the requirement says, not what the app currently does.

## Do not touch
- `flake-*.spec.ts` are intentionally flaky — do not fix them, and do not add them to `@smoke` / `@regression`.
- `happy-path.spec.ts` fails when the planted checkout bug (SCRUM-6, the commented `throw` in `Checkout/index.tsx`) is switched on — do not change the test to make it pass.
