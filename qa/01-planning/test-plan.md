# FoodMe — Test Plan

**ISTQB:** CTFL 5.1 (test planning, entry/exit criteria, estimation, prioritisation, test pyramid, testing quadrants)
**Template:** ISO/IEC/IEEE 29119-3 — Test Plan
**Plan ID:** TP-FOODME-01 · **Version:** 1.0 · **Date:** 2026-10-05 · **Owner:** QA (LianaLS)
**Status:** Draft — to be reviewed (see [review checklist](../static-testing/review-checklist.md))

---

## 1. Context

### 1.1 Test objectives (CTFL 1.1.1)

1. Find defects in the storefront, back office and API before users do.
2. Give confidence that the main business flow — *browse → cart → checkout → order* — works.
3. Verify that requirements in [requirements.md](../02-analysis/requirements.md) are met, and validate that the app is usable.
4. Provide information for a release decision (test completion report).
5. Train ISTQB practices on a real application.

### 1.2 Test items

| Item | Version | Location |
|---|---|---|
| Storefront (`apps/web`) | `main` branch, deployed build | https://foodme-lianals.onrender.com |
| Back office (`apps/admin`) | `main` branch, deployed build | https://foodme-lianals.onrender.com/backoffice |
| Backend REST API (`apps/backend`) | `main` branch | `/api/**`, `/admin/**` |

### 1.3 Scope

**In scope**

| Feature | Requirements |
|---|---|
| Explore chefs, chef page | REQ-01, REQ-02 |
| Cart | REQ-03 – REQ-06 |
| Delivery price, checkout, orders | REQ-07 – REQ-12 |
| Customer registration and login | REQ-13, REQ-14 |
| Back-office login and order workflow | REQ-15 – REQ-17 |
| Performance, accessibility, access control, responsive layout | REQ-NF-01 – REQ-NF-05 |

**Out of scope**

- Back-office chef/dish image upload (REQ-18 only smoke-tested).
- Card and Idram payments — not implemented; only CASH is accepted.
- Localisation (hy, ru) — only English UI is tested.
- Browsers other than Chromium (risk accepted, see §2).
- Load above 10 concurrent users; security penetration testing.
- The monitoring stack itself (Grafana/Prometheus/Loki).

### 1.4 Assumptions and constraints

- Requirements are reconstructed (PRJ-04). Items marked **[Assumption]** may change after review.
- The app contains **planted defects** for training (marked `FM-BUG-xx` in code, SCRUM-6, simulated latency, flaky heartbeat). Testers report them as normal defects; developers do not fix them without the course owner's approval.
- The test environment is the free Render instance (PRJ-01).

### 1.5 Stakeholders and roles

| Role | Who | Responsibility |
|---|---|---|
| Test manager / tester | LianaLS | Plan, design, execute, report |
| Developer | Course team | Fix defects, component tests |
| Product owner | Course owner | Confirm requirements and [Assumption] items |
| AI assistant | Claude Code | Follows `.agents/rules/`; drafts testware for review |

---

## 2. Risk register

See [risk-register.md](risk-register.md). Test depth and priority follow the risk level (risk-based testing, CTFL 5.2.4).

---

## 3. Test strategy

### 3.1 Test levels (CTFL 2.2.1)

| Level | Objective | Test basis | Tool / location | Who |
|---|---|---|---|---|
| Component | Validation rules, calculations, state machine logic | Code, schemas | Vitest — `apps/web/src/**/*.test.ts`; JUnit — `apps/backend/src/test` | Dev / QA |
| Component integration | Controller ↔ service ↔ DB, REST contracts | API, DTOs | JUnit + H2 (Spring Boot tests); Playwright API tests — `apps/web/e2e/api/` | QA |
| System | End-to-end business flows in a browser | Requirements, use cases | Playwright — `apps/web/e2e`, `apps/admin/e2e` | QA |
| System integration | FoodMe ↔ GlitchTip, Jira | Monitoring config | Manual | QA |
| Acceptance | Acceptance criteria met | [requirements.md](../02-analysis/requirements.md) | Manual test cases + E2E | QA + PO |

### 3.2 Test types (CTFL 2.2.2)

| Type | How |
|---|---|
| Functional | Manual test cases + automated E2E / API tests |
| Non-functional | Performance (k6, `qa/performance/`), accessibility (axe-core, `e2e/a11y.spec.ts`), responsive layout (`layout.spec.ts`) |
| Black-box | EP, BVA, decision tables, state transitions (`03-design/`) |
| White-box | Statement / branch coverage measured with JaCoCo for the backend |
| Confirmation | Re-run the failing test case after a fix; for known defects, remove `test.fail()` and run again |
| Regression | `npm run test:regression` after every change |

### 3.3 Test pyramid and testing quadrants (CTFL 5.1.6, 5.1.7)

```
             /\        E2E (system)        ~25 tests   slow, Render
            /  \
           /----\      API (integration)   ~20 tests   fast
          /      \
         /--------\    Component (unit)    ~50+ tests  very fast, no network
```

| Quadrant | FoodMe examples |
|---|---|
| Q1 — technology facing, support the team | Vitest and JUnit component tests |
| Q2 — business facing, support the team | Manual test cases, E2E acceptance flows, API tests |
| Q3 — business facing, critique the product | Exploratory sessions (`05-execution/exploratory-charters/`), usability |
| Q4 — technology facing, critique the product | k6 performance, axe accessibility, security checks |

### 3.4 Test design techniques (CTFL chapter 4)

| Technique | Applied to | Document |
|---|---|---|
| Equivalence partitioning | Registration, checkout, quantity, auth | [ep-bva.md](../03-design/ep-bva.md) |
| Boundary value analysis (2-value) | Field lengths, free-delivery threshold, quantity, page size | [ep-bva.md](../03-design/ep-bva.md) |
| Decision table testing | Delivery price, checkout validation, checkout access | [decision-tables.md](../03-design/decision-tables.md) |
| State transition testing | Admin order status, cart | [state-transitions.md](../03-design/state-transitions.md) |
| Error guessing | Double submit, XSS, time zones, back button | [error-guessing.md](../03-design/error-guessing.md) |
| Exploratory testing | Checkout, back office | `05-execution/exploratory-charters/` |
| Checklist-based testing | UI, API, accessibility | `03-design/checklists/` |
| Statement / branch coverage | Backend | JaCoCo report |

### 3.5 Test suites and tags

| Tag / command | Content | When |
|---|---|---|
| `@smoke` — `npm run test:smoke` | One happy path per High-risk area | After every deploy; entry check for a test cycle |
| `@regression` — `npm run test:regression` | All stable automated tests | Before a release; after each fix |
| `@api` — `npm run test:api` | API tests only | Every change to the backend |
| `@a11y` | Accessibility scans | Weekly and before a release |
| `@known-defect` | Tests that fail because of a known open defect. Marked `test.fail()` so the suite stays green; when the defect is fixed the test reports "unexpected pass" → confirmation testing | Always included |
| `flake-*.spec.ts` (no tag) | Intentionally flaky tests | Not in smoke or regression |
| `npm run test:unit` | Vitest component tests | Every commit (CI) |
| `./gradlew test jacocoTestReport` | Backend component tests + coverage | Every commit (CI) |

### 3.6 Entry criteria (CTFL 5.1.3)

A test cycle starts when:

1. The build is deployed to Render and `GET /actuator/health` returns `UP`.
2. The `@smoke` suite passes (otherwise the build is rejected — smoke test as entry check).
3. Test data rules are clear (see §3.8) and the admin account `admin/admin123` works.
4. Test cases for the in-scope features are reviewed.

### 3.7 Exit criteria

A test cycle ends when **all** of these are true:

1. 100% of High-priority test cases have been executed; ≥ 90% of all planned test cases executed.
2. No open defects with severity **Critical**; open **Major** defects have an agreed workaround or are accepted by the PO.
3. Every requirement in scope has at least one executed test case (traceability matrix has no gaps for High-risk requirements).
4. Backend branch coverage is reported (no fixed target in v1.0; baseline is recorded).
5. A test completion report is written.

### 3.8 Test data (CTFL 1.4)

- New customers: unique email `api-<timestamp>-<random>@example.com` or `qa-<yyyymmdd>-<nn>@example.com`, password `secret123`.
- Create customers through the API (`registerCustomerViaApi`) unless the test is about the registration UI.
- Do not change seed chefs and dishes from tests. Status-transition tests use orders they create themselves.
- Seed values used in expected results: delivery price 500 AMD, free delivery from 5000 AMD, 6 active chefs.

### 3.9 Test environment

| Component | Value |
|---|---|
| URL | https://foodme-lianals.onrender.com (storefront, API), `/backoffice` (admin) |
| Browser | Chromium (Playwright `Desktop Chrome`), mobile viewport 375 px |
| Local | Backend on `:8081` with PostgreSQL; set `PLAYWRIGHT_BASE_URL` |
| Monitoring | GlitchTip, Grafana |
| Defect tracker | Jira `liana-qa.atlassian.net`, project `SCRUM` (Task + label `bug`) |

### 3.10 Metrics (CTFL 5.3.1)

- Test case execution: planned / executed / passed / failed / blocked.
- Requirements coverage: requirements with ≥ 1 passed test / requirements in scope.
- Defects: found per severity, open vs closed, defect density per feature.
- Automation: automated test cases / total test cases.
- Code coverage: JaCoCo statement and branch %.

### 3.11 Suspension and resumption criteria

- **Suspend** when the app is down for more than 15 minutes, or the smoke suite fails on the checkout flow (all dependent tests would be blocked).
- **Resume** when the cause is fixed and the smoke suite passes again.

### 3.12 Defect management (CTFL 5.5)

See [`.agents/rules/defect-management.md`](../../.agents/rules/defect-management.md) for the defect lifecycle, severity and priority scales. Defects are filed with the `bug-report` skill.

---

## 4. Test deliverables (testware)

| Deliverable | Location |
|---|---|
| Test plan, risk register | `qa/01-planning/` |
| Requirements, test conditions | `qa/02-analysis/` |
| Test design (EP/BVA, decision tables, state transitions, checklists) | `qa/03-design/` |
| Test cases, traceability matrix | [qa/test-cases.md](../test-cases.md), `qa/04-implementation/` |
| Automated tests | `apps/web/e2e/`, `apps/web/src/**/*.test.ts`, `apps/backend/src/test/`, `qa/performance/` |
| Exploratory session sheets, execution logs | `qa/05-execution/` |
| Test progress and completion reports | `qa/06-reporting/` |
| Defect reports | Jira `SCRUM` |

## 5. Schedule and estimation (CTFL 5.1.4)

Estimation techniques: **expert-based estimation** (one tester, so no Wideband Delphi round) checked with an **estimation based on ratios** — test execution ≈ 40% of the total test effort.

| Activity | Estimate |
|---|---|
| Planning and analysis | 1 day |
| Test design and implementation (manual + automated) | 3 days |
| Execution cycle 1 (all test cases) | 1 day |
| Defect reporting and confirmation testing | 1 day |
| Completion report | 0.5 day |

## 6. Approval

| Role | Name | Date | Decision |
|---|---|---|---|
| Test manager | | | |
| Product owner | | | |
