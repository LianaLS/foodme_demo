# Requirements Traceability Matrix (RTM)

**ISTQB:** CTFL 1.4.4 (traceability between the test basis, testware and results), 5.3.1 (coverage metrics)
**Version:** 1.0 · 2026-10-05 · Execution results: [test-progress-report.md](../06-reporting/test-progress-report.md)

Traceability lets us answer:
- **Forward:** is every requirement covered by at least one test? (coverage, gaps)
- **Backward:** why does this test exist? which requirement breaks if it fails? (impact analysis)
- **Defects:** which requirement and risk does a defect affect?

Status legend: ✅ passed · ❌ failed (open defect) · ⚠️ known defect (test marked `test.fail()` / `@Disabled`) · ⏸ not run / manual · — none

## Matrix

| Requirement | Risk | Test conditions | Test cases | Automated tests (component · API · E2E) | Last result | Defects |
|---|---|---|---|---|---|---|
| REQ-01 Browse active chefs | RSK-07 (4) | TCOND-01 | TC-01, TC-26 | — · `chefs.api` · `storefront-flows`, `layout` | ⚠️ | FM-BUG-02 |
| REQ-02 Chef page and menu | RSK-10 (2) | TCOND-02 | TC-01, TC-02 | — · `chefs.api` · `storefront-flows` | ❌ | NEW-01 (chef 32 → 500) |
| REQ-03 Add dish to cart | RSK-01 (9) | TCOND-03 | TC-03 | `useCart.test` · — · `happy-path`, `layout`, `flake-dish-modal` | ✅ | — |
| REQ-04 Quantity / remove | RSK-06 (4) | TCOND-04 | TC-04, TC-05 | `useCart.test` · — · `cart-decrement`, `storefront-flows` | ✅ | — |
| REQ-05 Cart persists | RSK-11 (2) | TCOND-05 | TC-06 | — · — · `flake-cart-persistence` (flaky on purpose) | ⏸ | — |
| REQ-06 One chef per cart | RSK-06 (4) | TCOND-06 | TC-02, TC-07 | `useCart.test` · — · `storefront-flows` | ✅ | — |
| REQ-07 Delivery price | RSK-02 (6) | TCOND-07, TCOND-08 | TC-19, TC-20 | `OrderServiceDeliveryPriceTest` · `delivery-price.api` · — | ⚠️ | FM-BUG-03 |
| REQ-08 Checkout needs account | RSK-05 (3) | TCOND-09 | TC-08, TC-09, TC-25 | — · `access-control.api` · `storefront-flows` | ✅ | — |
| REQ-09 Checkout validation | RSK-04 (4) | TCOND-10 | TC-10, TC-11, TC-30 | `checkout-schema.test` · — · `storefront-flows` | ✅ / ⏸ | OBS-01 (note > 300 silent) |
| REQ-10 Place an order | RSK-01 (9), RSK-03 (6) | TCOND-11, TCOND-12 | TC-09, TC-10, TC-21, TC-24 | — · `orders.api` · `happy-path`, `storefront-flows`, `alans-kitchen-soup-order` | ⚠️ | FM-BUG-01 |
| REQ-11 Order content validation | RSK-01 (9) | TCOND-13, TCOND-14 | TC-22, TC-23 | — · `orders.api` · — | ⚠️ | FM-BUG-04, FM-BUG-05 |
| REQ-12 History and tracking | RSK-12 (2) | TCOND-15, TCOND-16 | TC-09, TC-31 | — · — · `storefront-flows` | ✅ / ⏸ | FM-BUG-06 (to confirm with TC-31) |
| REQ-13 Registration | RSK-04 (4) | TCOND-17, TCOND-18 | TC-12, TC-13, TC-16, TC-17 | `auth-schema.test`, `CustomerAuthControllerTest` · `auth.api` · `storefront-flows` | ✅ | — |
| REQ-14 Login | RSK-08 (6) | TCOND-19 | TC-14, TC-18 | `auth-schema.test`, `CustomerAuthControllerTest` · `auth.api` · — | ✅ | — |
| REQ-15 Admin login | RSK-08 (6) | TCOND-20 | TC-15 | — · — · `admin-flows`, `happy-path` | ✅ | — |
| REQ-16 Order status workflow | RSK-09 (2) | TCOND-21 | TC-27, TC-28 | `AdminOrderServiceTransitionTest` · `admin-order-status.api` · `admin-flows` | ✅ | — |
| REQ-17 Safe order details | RSK-08 (6) | TCOND-22 | TC-29 | — · — · — | ⏸ | FM-BUG-08 (to confirm with TC-29) |
| REQ-18 Manage chefs/dishes | RSK-10 (2) | TCOND-23 | — (exploratory EC-02) | — · — · `admin-flows` | ⏸ | — |
| REQ-NF-01 Performance | RSK-13 (3) | TCOND-24 | TC-33 | — · k6 `k6-read-api.js` · — | ❌ | NEW-03 (p95 4.77 s) |
| REQ-NF-02 Accessibility | RSK-14 (4) | TCOND-25 | TC-32 | — · — · `a11y` | ❌ | NEW-04 (color contrast) |
| REQ-NF-03 Access control | RSK-08 (6) | TCOND-26 | TC-25 | `CustomerAuthControllerTest`, `OrderControllerTest` · `access-control.api` · — | ❌ | NEW-02 (customer token on /admin), NEW-05 (JWT without expiry), NEW-06 (stack trace in 500) |
| REQ-NF-04 Observability | RSK-15 (2) | TCOND-27 | TC-34 | — · — · — | ⏸ | — |
| REQ-NF-05 Responsive | RSK-14 (4) | TCOND-28 | — (checklist UI-17) | — · — · `layout` | ✅ | — |

Defect IDs `NEW-xx` / `OBS-xx` are findings of 2026-10-05 that are **not yet in Jira** — see the progress report. Replace them with `SCRUM-xx` keys after they are filed.

## Coverage summary

| Metric | Value |
|---|---|
| Requirements in scope | 23 |
| Requirements with ≥ 1 test case | 21 / 23 (REQ-18 and REQ-NF-05 are covered by an exploratory charter and a checklist only) |
| Requirements with ≥ 1 automated test | 21 / 23 (REQ-17 and REQ-NF-04 are manual only) |
| High-risk requirements (score ≥ 6) without a test | 0 |
| Test cases | 34 (automated fully or partly: 31; manual only: TC-29, TC-31, TC-34) |

## How to keep this matrix up to date

- A new requirement → add a row before writing tests.
- A new test → add the TC id here and an `annotation: [{ type: "testCase", … }]` in the Playwright test.
- A new defect → put its Jira key in the "Defects" column of every affected row.
- Search the code for a test case: `grep -rn '"TC-19"' apps/web/e2e`.
