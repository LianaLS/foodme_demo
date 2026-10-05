# FoodMe — QA Documentation

This folder holds the test documentation (testware) for FoodMe. It follows the
**ISTQB® Certified Tester Foundation Level (CTFL) v4.0** syllabus and uses
**ISO/IEC/IEEE 29119-3** as the template for test documents and
**ISO/IEC 25010** for quality characteristics.

FoodMe is a QA training project. It contains planted defects and flakiness on
purpose (see "Planted defects" below). Do not fix them without asking.

Terms used in these documents are defined in [glossary.md](glossary.md)
(English / Հայերեն / Русский).

**Start here:** [test plan](01-planning/test-plan.md) → [latest progress report](06-reporting/test-progress-report.md).

---

## Test process map (CTFL 1.4)

Each document belongs to one activity of the ISTQB test process.

| # | Test activity | What it answers | Document | Status |
|---|---|---|---|---|
| 1 | Test planning | Why, what, how, when, with what are we testing? | [test-plan.md](01-planning/test-plan.md) | Done (draft, to review) |
| 1 | Test planning | What can go wrong and how bad is it? | [risk-register.md](01-planning/risk-register.md) | Done |
| 2 | Test monitoring and control | Are we on track? | [test-progress-report.md](06-reporting/test-progress-report.md) | Done (TPR-01) |
| 3 | Test analysis | What do we test? (test basis → test conditions) | [requirements.md](02-analysis/requirements.md), [test-conditions.md](02-analysis/test-conditions.md) | Done |
| 4 | Test design | How do we test it? (techniques → test cases) | [ep-bva.md](03-design/ep-bva.md), [decision-tables.md](03-design/decision-tables.md), [state-transitions.md](03-design/state-transitions.md), [error-guessing.md](03-design/error-guessing.md), [checklists/](03-design/checklists/) | Done |
| 5 | Test implementation | Is everything ready to run? (test cases, data, suites, traceability) | [test-cases.md](test-cases.md), [traceability-matrix.md](04-implementation/traceability-matrix.md), automated tests | Done |
| 6 | Test execution | Run, compare, log, report defects | [exploratory charters](05-execution/exploratory-charters/), Playwright HTML report, Jira `SCRUM` | Cycle 1 in progress |
| 7 | Test completion | What did we learn? | [test-completion-report.md](06-reporting/test-completion-report.md) | Template |
| — | Static testing | Defects found without running the code | [review-checklist.md](static-testing/review-checklist.md), [review-log.md](static-testing/review-log.md) | Done (RV-01) |

[test-cases.xlsx](test-cases.xlsx) is the Excel copy of the **first version** (TC-01 … TC-15). The Markdown file is the source of truth.

---

## Syllabus coverage

| Chapter | Topic | Where in FoodMe |
|---|---|---|
| 1 | Fundamentals of Testing | This file, [glossary.md](glossary.md), test process map above |
| 2 | Testing Throughout the SDLC | Test levels and types (below, [test-plan §3](01-planning/test-plan.md)), confirmation / regression testing (`@known-defect`, `npm run test:regression`), CI |
| 3 | Static Testing | [static-testing/](static-testing/), `oxlint`, `eslint`, `tsc`, `claude-pr-review.yml` |
| 4 | Test Analysis and Design | [03-design/](03-design/), [test-cases.md](test-cases.md), exploratory charters |
| 5 | Managing the Test Activities | Test plan, risk register, traceability matrix, progress report, [defect management rules](../.agents/rules/defect-management.md) |
| 6 | Test Tools | See "Tools" below |

### Test levels (CTFL 2.2.1)

| Test level | Test object | Tool / location | Command |
|---|---|---|---|
| Component | Zod schemas, cart logic, utils; backend services | Vitest `apps/web/src/**/*.test.ts`; JUnit `apps/backend/src/test` | `npm run test:unit` · `./gradlew test` |
| Component integration | REST API contracts, server rules, access control | Playwright API tests `apps/web/e2e/api/`; Spring Boot tests (H2) | `npm run test:api` |
| System | Storefront + back office + backend | Playwright `apps/web/e2e`, `apps/admin/e2e` | `npm run test:regression` |
| System (non-functional) | Accessibility, performance | `apps/web/e2e/a11y.spec.ts`, [performance/k6-read-api.js](performance/k6-read-api.js) | `npm run test:a11y` · `k6 run …` |
| System integration | FoodMe ↔ GlitchTip, Jira | Manual (TC-34) | — |
| Acceptance | Acceptance criteria in [requirements.md](02-analysis/requirements.md) | Manual test cases + E2E | — |

### Playwright tags

| Tag | Meaning |
|---|---|
| `@smoke` | One happy path per High-risk area — entry check of a test cycle |
| `@regression` | All stable automated tests |
| `@api` | API (integration) tests |
| `@a11y` | Accessibility scans |
| `@known-defect` | Test fails because of a logged defect; marked `test.fail()` — an "unexpected pass" means the defect is fixed → confirmation testing |

---

## The seven testing principles (CTFL 1.3) — FoodMe examples

| # | Principle | FoodMe example |
|---|---|---|
| 1 | Testing shows the presence, not the absence, of defects | The whole UI regression suite passed while a customer token could read all orders in the admin API (found only by an API test). |
| 2 | Exhaustive testing is impossible | Password length can be 8–72 characters. We test boundaries (7, 8, 72, 73), not every length. |
| 3 | Early testing saves time and money | Reading `calculateDeliveryPrice` in a review shows the `>` vs `>=` problem before any test runs. |
| 4 | Defects cluster together | `OrderService` alone holds FM-BUG-01, -03, -04, -05 and -06. |
| 5 | Tests wear out (pesticide paradox) | Re-running the same E2E tests stops finding new defects. Exploratory sessions and new test data are needed. |
| 6 | Testing is context dependent | A food-ordering storefront needs strong checkout and usability testing. A banking app would focus more on security. |
| 7 | Absence-of-defects fallacy | A bug-free checkout is still useless if users cannot find the dish they want or cannot read low-contrast text. |

---

## Planted defects and flakiness

These exist on purpose for training. They are good examples for the syllabus.

| Planted item | Location | Syllabus link |
|---|---|---|
| Checkout threw `Simulated bug: Order processing failed!` (Jira **SCRUM-6**). The line is now commented out (fixed in commit `0e50e00`). | `apps/web/src/pages/Checkout/index.tsx` | Error → defect → failure (1.2.3), defect report (5.5), confirmation testing after the fix (2.2.3) |
| `FM-BUG-01` … `FM-BUG-08` comments | Backend services/DTOs, admin `OrderShow.jsx` | Detected by TC-19, 21, 22, 23, 26 (tests marked `@known-defect`) |
| Random 200–1500 ms latency | `config/SimulatedLatencyConfig` | Non-functional testing — performance efficiency (ISO/IEC 25010), why fixed waits make tests flaky |
| `GET .../boom` throws on purpose | `controller/api/DebugController` | Monitoring failures in operation (GlitchTip), TC-34 |
| Heartbeat fails ~1 in 10 ticks | `apps/web/src/lib/flakyHeartbeat.ts` | Intermittent failures, monitoring |
| Flaky Playwright tests | `apps/web/e2e/flake-*.spec.ts` | Risks of test automation (6.1) |

---

## Tools (CTFL 6.1)

| Tool category | Tool used in FoodMe |
|---|---|
| Test management and defect management | Jira (`liana-qa.atlassian.net`, project `SCRUM`); Qase (optional) |
| Static testing | oxlint, eslint, TypeScript compiler (`tsc -b`), AI PR review |
| Test design and implementation | Markdown testware in this folder; Claude Code skills `test-design`, `exploratory-session` |
| Test execution and coverage | Playwright, Vitest, JUnit 5 + Mockito, JaCoCo |
| Non-functional testing | axe-core (`@axe-core/playwright`), k6 |
| DevOps / CI | GitHub Actions, Docker, Render |
| Monitoring | GlitchTip (Sentry SDK), Prometheus, Grafana, Loki |
| Reporting | Playwright HTML report, JaCoCo HTML report, Claude Code skill `test-report` |

---

## Conventions

- **IDs:** `REQ-xx` requirement · `RSK-xx` / `PRJ-xx` risk · `TCOND-xx` test condition · `TC-xx` test case · `EG-xx` error guess · `EC-xx` exploratory charter · `RV-xx-yy` review finding · `SCRUM-xx` defect in Jira · `NEW-xx` / `OBS-xx` finding not yet in Jira.
- **Language:** test documents are written in English. The glossary is in English, Armenian and Russian.
- **Rules for AI agents:** see `.agents/rules/` and `AGENTS.md`.
