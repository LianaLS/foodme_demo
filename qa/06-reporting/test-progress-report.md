# Test Progress Report — TPR-01

**ISTQB:** CTFL 5.3.2 (test monitoring, control, progress reporting)
**Template:** ISO/IEC/IEEE 29119-3 — Test Status Report
**Test plan:** [TP-FOODME-01](../01-planning/test-plan.md) · **Cycle:** 1 · **Reporting period:** 2026-10-05
**Test object:** https://foodme-lianals.onrender.com, code at commit `ba34c17` + new testware (not yet committed)
**Author:** QA (prepared with Claude Code)

---

## 1. Summary

Cycle 1 is **in progress**. All automated suites were executed once against Render. The core flow
(browse → cart → checkout → order) **works**. Testing confirmed 5 planted defects
and found **4 new product defects**, one of them **critical** (customers can use the
back-office API). The exit criteria are **not met yet** (see §6).

## 2. Progress against the plan

| Activity | Planned | Status |
|---|---|---|
| Test planning, risk analysis | Day 1 | ✅ Done |
| Test analysis (requirements, conditions) | Day 1 | ✅ Done (23 requirements, 28 conditions) |
| Test design and implementation | Days 2–4 | ✅ Done (34 test cases; 116 new automated tests: 47 Playwright, 44 Vitest, 25 JUnit) |
| Execution cycle 1 | Day 5 | 🟡 82% of test cases executed |
| Defect reporting | Day 6 | 🔴 Not started — new defects are not in Jira yet |
| Confirmation testing | Day 6 | ⏸ Waiting for fixes |

## 3. Test execution

### 3.1 Test cases ([test-cases.md](../test-cases.md))

| Status | Count | Test cases |
|---|---|---|
| ✅ Passed | 19 | TC-02, 03, 04, 05, 07, 08, 09, 10, 11, 12, 13, 14, 16, 17, 18, 20, 24, 27, 28 |
| ❌ Failed — known (planted) defect | 5 | TC-19, 21, 22, 23, 26 |
| ❌ Failed — new defect | 4 | TC-01, 25, 32, 33 |
| ⏸ Not run | 6 | TC-06 (flaky on purpose), TC-15 (blocked by testware defect RV-01-01), TC-29, 30 (UI), 31, 34 (manual) |
| **Total** | **34** | Executed 28 / 34 = **82%** · High priority executed 15 / 17 = **88%** |

### 3.2 Automated suites

| Suite | Command | Level | Result |
|---|---|---|---|
| Web component tests | `npm run test:unit` | Component | **44 / 44 passed** (4 files) |
| Backend tests | `gradle test` (JDK 17) | Component + integration | **39 passed, 1 skipped** (known defect FM-BUG-03) |
| Regression (UI + API) | `npm run test:regression` (`--workers=2`) | Integration + system | **63 tests: 58 passed** (incl. 7 expected failures of known defects), **5 failed**, 3.8 min |
| Accessibility | `npm run test:a11y` | System, non-functional | **0 / 5 passed** — `color-contrast` (serious) on every page |
| Performance | `k6 run qa/performance/k6-read-api.js` | System, non-functional | **Failed** — p95 4.77 s (limit 2 s), errors 9.24% (limit 1%) |
| Admin E2E | `apps/admin npm run test:e2e` | System | Not run (needs local admin dev server + backend) |

Failures in the regression run, classified:

| Test | Class | Reference |
|---|---|---|
| `access-control.api` — customer token cannot read admin orders | Product defect (new) | NEW-02 |
| `chefs.api` — every active chef page loads | Product defect (new) | NEW-01 |
| `happy-path` — dish modal additions raise cart line price | Testware defect | RV-01-01 |
| `happy-path` — admin can login and list orders | Testware defect | RV-01-01 |
| `layout` — cart and checkout item details stay aligned | Testware defect | RV-01-01 |

A first run with 8 parallel workers produced 5 extra timeouts. A serial re-run passed them →
classified as **environment** (Render free tier under load), not product defects.
The npm scripts now use `--workers=2`.

### 3.3 Coverage

| Metric | Value |
|---|---|
| Requirements with ≥ 1 executed test | 18 / 23 (78%) — not executed: REQ-05, REQ-15, REQ-17, REQ-18, REQ-NF-04 |
| Requirements fully passed | 10 / 23 |
| High-risk requirements (RSK ≥ 6) with failures | REQ-07, REQ-10, REQ-11, REQ-NF-03 |
| Backend statement (line) coverage, JaCoCo | **51.4%** (462 / 899 lines) — baseline |
| Backend branch coverage, JaCoCo | **27.8%** (75 / 270 branches) — baseline |
| `OrderService` line / branch | 78.7% / 50.0% |
| `AdminOrderService` line / branch | 64.0% / 60.0% |

## 4. Defects

### 4.1 New defects (not yet in Jira)

| ID | Summary | Severity | Requirement | Found by |
|---|---|---|---|---|
| NEW-02 | Admin API: a **customer** token can read all orders (`GET /admin/order` → 200); `/admin/**` checks authentication only, not the ADMIN role | **Critical** | REQ-NF-03 | TC-25 (API), review RV-01-07 |
| NEW-01 | Chef page: `GET /api/chef/32` (Italiano Margarino) returns 500 — NullPointerException on a dish without an Armenian name; the storefront page cannot load | Major | REQ-02 | TC-01 (API) |
| NEW-05 | JWTs (customer and admin) have no expiry (`exp` claim) — tokens are valid forever | Major | REQ-NF-03 | Review RV-01-08 |
| NEW-03 | Read API p95 = 4.77 s with 10 users (limit 2 s); 9.24% errors (all from NEW-01) | Major | REQ-NF-01 | TC-33 (k6) |
| NEW-04 | Text colour contrast below WCAG AA on home, explore, chef (44 elements), checkout, login | Major | REQ-NF-02 | TC-32 (axe) |
| NEW-06 | 500 responses include the full Java stack trace | Minor | REQ-NF-03 | Review RV-01-09 |
| OBS-01 | Checkout note over 300 characters: form does not submit and shows no message | Minor | REQ-09 | Review RV-01-05, TC-30 |

### 4.2 Known (planted) defects confirmed

| ID | Summary | Severity | Test |
|---|---|---|---|
| FM-BUG-04 | Order quantity not validated — `0` creates a 0 AMD order, `−1` creates a **negative** total (−3500 AMD), `null` → 500 | Critical | TC-22 |
| FM-BUG-01 | Order total: additions not multiplied by quantity | Major | TC-21 |
| FM-BUG-03 | Free delivery not applied at exactly 5000 AMD (`>` instead of `>=`) | Major | TC-19 |
| FM-BUG-05 | Order accepts a dish of another chef | Major | TC-23 |
| FM-BUG-02 | Explore API drops the last chef of the last page (5 of 6) | Major | TC-26 |
| FM-BUG-06, FM-BUG-08 | Time zone of order time; HTML in note rendered in back office | — | Not yet tested (TC-31, TC-29) |

### 4.3 Testware and build defects

| ID | Summary | Impact |
|---|---|---|
| RV-01-01 | `localhost:8081` hard-coded in `happy-path.spec.ts` and `layout.spec.ts` | 3 regression tests fail against Render; TC-15 blocked |
| RV-01-02 | CI e2e job needs a missing `infra/docker-compose.yml` | No E2E in CI |
| RV-01-03 | `gradle-wrapper.jar` missing → `./gradlew` fails | Backend build/tests cannot run with the wrapper (CI included) |

## 5. Risks and issues

| Risk | Change | Reason |
|---|---|---|
| RSK-08 Security | **Likelihood 2 → 3** (score 9) | NEW-02, NEW-05, NEW-06 |
| RSK-01 Wrong total | stays 9 | FM-BUG-01, FM-BUG-04 confirmed |
| RSK-10 Chef page errors | **Likelihood 1 → 2** (score 4) | NEW-01 |
| PRJ-01 Render free tier | confirmed | timeouts with parallel workers |

## 6. Exit criteria (test plan §3.7)

| # | Criterion | Status |
|---|---|---|
| 1 | 100% High-priority test cases executed; ≥ 90% of all | ❌ 88% High, 82% all |
| 2 | No open Critical defects | ❌ NEW-02, FM-BUG-04 |
| 3 | Every High-risk requirement has an executed test | ❌ REQ-17 (TC-29) not executed |
| 4 | Backend branch coverage reported | ✅ 27.8% baseline |
| 5 | Completion report written | ⏸ |

## 7. Next steps

1. File NEW-01 … NEW-06 and OBS-01 in Jira — drafts are ready in [defect-report-drafts.md](defect-report-drafts.md) (the Jira connector was not loaded in this session); then mark NEW-01/NEW-02 tests with `test.fail()` + Jira key.
2. Execute TC-29 (XSS in back-office note) and TC-31 (order time) — High/Low risk, manual.
3. ~~Fix testware defect RV-01-01~~ — done, see §8.
4. Run exploratory sessions EC-01 and EC-03.
5. Commit the missing `gradle-wrapper.jar` so backend tests run in CI.

## 8. Update — 2026-10-05, after fixing RV-01-01

Testware defect RV-01-01 (`localhost:8081` hard-coded) was fixed in `happy-path.spec.ts` and `layout.spec.ts`.
Confirmation run: `npx playwright test happy-path layout --workers=2`.

| Test | Before | After |
|---|---|---|
| `happy-path` — dish modal additions raise cart line price | ❌ ECONNREFUSED | ✅ |
| `happy-path` — admin can login and list orders (TC-15) | ❌ ECONNREFUSED | ✅ |
| `layout` — cart and checkout item details stay aligned | ❌ ECONNREFUSED | ✅ |

Regression check of the same files: 7 / 8 passed. The 8th (`happy-path` — explore → checkout) timed out
waiting 5 s for the chef page; a serial re-run passed 2 / 2 → **environment** (Render latency), not a regression.

Updated figures: TC-15 → passed. Test cases passed 20, not run 5; executed 29 / 34 = **85%**;
High priority executed 16 / 17 = **94%**.

Full regression re-run (`npm run test:regression`, 3.7 min): **61 / 63 passed**; the 2 failures are the new
product defects NEW-01 and NEW-02. No testware or environment failures.
