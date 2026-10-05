# FoodMe — Risk Register

**ISTQB:** CTFL 5.2 — risk management (risk identification, risk assessment, risk mitigation, risk monitoring).
**Version:** 1.0 · 2026-10-05

## Method

- **Likelihood (L):** 1 = low, 2 = medium, 3 = high — how likely the problem is to exist or to happen.
- **Impact (I):** 1 = low, 2 = medium, 3 = high — how bad it is for users or the business if it happens.
- **Risk level = L × I:**

| Level | Score | Test depth (risk-based testing) |
|---|---|---|
| **High** | 6–9 | Several techniques, positive + negative + boundary tests, automated at API **and** UI level, in `@smoke` or `@regression` suite |
| **Medium** | 3–4 | EP + BVA or decision table, automated at one level, in `@regression` |
| **Low** | 1–2 | Checklist or exploratory session, manual |

```
            Impact →
            1        2        3
L    3  |  3 Med  |  6 High |  9 High |
i    2  |  2 Low  |  4 Med  |  6 High |
k    1  |  1 Low  |  2 Low  |  3 Med  |
```

---

## Product risks (quality risks)

| ID | Risk | Quality characteristic (ISO 25010) | L | I | Level | Mitigation (test approach) | Related |
|---|---|---|---|---|---|---|---|
| RSK-01 | Customer is charged a wrong order total (quantity, additions, rounding) | Functional correctness | 3 | 3 | **9 High** | EP + BVA on quantity and additions; API tests compare total with expected formula; unit test of cart subtotal | REQ-03, REQ-10, REQ-11 |
| RSK-02 | Wrong delivery price (threshold, takeaway) | Functional correctness | 3 | 2 | **6 High** | BVA 4999 / 5000 / 5001; decision table DELIVERY × TAKEAWAY; API + component tests | REQ-07 |
| RSK-03 | Order cannot be placed (checkout broken) | Functional completeness | 2 | 3 | **6 High** | `@smoke` E2E for delivery and takeaway checkout; confirmation test after SCRUM-6 | REQ-10 |
| RSK-04 | Invalid data accepted at registration or checkout | Functional correctness | 2 | 2 | **4 Medium** | EP + 2-value BVA on every field; component tests of the zod schemas; API tests | REQ-09, REQ-13 |
| RSK-05 | Signed-out user can place an order, or sign-in at checkout fails | Security / functional | 1 | 3 | **3 Medium** | Decision table (auth × cart); API 401 tests | REQ-08 |
| RSK-06 | Cart quantity or cross-chef logic is wrong | Functional correctness | 2 | 2 | **4 Medium** | State transition (cart); BVA on minimum quantity; E2E | REQ-04, REQ-06 |
| RSK-07 | Some active chefs are missing from Explore (lost sales) | Functional completeness | 2 | 2 | **4 Medium** | API test: listed items = `count`; BVA on page size | REQ-01 |
| RSK-08 | Security: XSS in back office, missing access control, user enumeration | Security | 2 | 3 | **6 High** | Error guessing (HTML/script in note), API 401 tests, login message EP | REQ-14, REQ-17, REQ-NF-03 |
| RSK-09 | Admin sets an invalid order status | Functional correctness | 1 | 2 | **2 Low** → tested as Medium because it is cheap to automate | State transition testing (valid + invalid transitions), unit tests | REQ-16 |
| RSK-10 | Chef page errors or back-office edits not visible | Functional correctness | 1 | 2 | **2 Low** | Scenario tests, exploratory | REQ-02, REQ-18 |
| RSK-11 | Cart lost after reload | Reliability | 1 | 2 | **2 Low** | E2E (flaky on purpose — see PRJ-03), exploratory | REQ-05 |
| RSK-12 | Order history wrong order or wrong time | Functional correctness | 2 | 1 | **2 Low** | Scenario + error guessing (time zones) | REQ-12 |
| RSK-13 | Slow responses make users leave | Performance efficiency | 3 | 1 | **3 Medium** | k6 load test, p95 threshold | REQ-NF-01 |
| RSK-14 | Pages not usable with assistive technology or on mobile | Usability / compatibility | 2 | 2 | **4 Medium** | axe-core scan, 375 px layout test, UI checklist | REQ-NF-02, REQ-NF-05 |
| RSK-15 | Failures in production are not noticed | Maintainability | 1 | 2 | **2 Low** | Check `/api/debug/boom` reaches GlitchTip; Grafana dashboards | REQ-NF-04 |

## Project risks

| ID | Risk | L | I | Level | Mitigation / contingency |
|---|---|---|---|---|---|
| PRJ-01 | Render free tier sleeps; the first request takes 1–3 minutes, so test runs are slow and may time out | 3 | 2 | **6 High** | Wake the app (`curl /api/chef/active`) before a run; `keepalive.yml` workflow; longer timeouts only where needed |
| PRJ-02 | CI e2e job cannot boot the backend (`infra/docker-compose.yml` is missing) | 3 | 2 | **6 High** | Run E2E against the Render deployment; fix the CI job when the compose file is added |
| PRJ-03 | Intentionally flaky tests reduce trust in results | 3 | 1 | **3 Medium** | Keep `flake-*.spec.ts` out of `@smoke` / `@regression`; report them separately |
| PRJ-04 | No written specification; requirements are reconstructed | 3 | 2 | **6 High** | [Assumption] markers in `requirements.md`; review with the product owner |
| PRJ-05 | One tester; no independent review | 2 | 2 | **4 Medium** | Use the review checklist (`static-testing/`) and AI PR review |
| PRJ-06 | Tests write to the shared Render database (customers, orders) | 3 | 1 | **3 Medium** | Unique test data (`api-<timestamp>@example.com`); never edit seed chefs/dishes from tests |

## Risk monitoring

Review this register at the start of every test cycle and when a new defect is
found. When a defect is found in an area, raise its **likelihood** (defects
cluster together — CTFL 1.3, principle 4).
