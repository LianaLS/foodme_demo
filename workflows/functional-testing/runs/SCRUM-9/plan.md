# Test plan — SCRUM-9 Cancel an order before the kitchen accepts it

**ISTQB:** CTFL 5.1 (test planning), 5.2 (risk-based testing) · **Template:** ISO/IEC/IEEE 29119-3 Test Plan (feature level)
**Plan ID:** TP-SCRUM-9 · **Version:** 1.0 · **Date:** 2026-10-14 · **Owner:** QA (Liana Sarajyan)
**Parent plan:** [qa/01-planning/test-plan.md](../../../../qa/01-planning/test-plan.md) (TP-FOODME-01). This plan adds only what is specific to SCRUM-9; everything not stated here follows the parent plan.

---

## 1. Context

| Item | Value |
|---|---|
| Feature | SCRUM-9 — customers cancel their own order while it is still Received (subtasks KAN-12 backend, KAN-13 storefront, KAN-14 admin) |
| Test basis | [spec.yaml](spec.yaml) — 27 approved requirements, AC-1…AC-5, 15 approved changes (CHG-01…CHG-15); commit `f6616ab` |
| Test object | Storefront https://foodme-lianals.onrender.com, admin `/backoffice`, API `/api/**`, `/admin/**` — `main` at commit `fb452d5` (PR #7), deployed on Render 2026-10-14 |
| Test approach | Black-box only; the code is not used to derive expected results |

**Test objectives**
1. Verify that every approved requirement REQ-SCRUM-9-01…27 (except the out-of-scope ones) is met.
2. Find defects in access control and status rules before customers do: someone else's order, cancelling after the kitchen accepted, changing a cancelled order.
3. Confirm that the main flow works on the phone and desktop sizes in common use (REQ-SCRUM-9-27).
4. Give the information for the release decision (test completion report, step 10).

## 2. Scope

**In scope (26 requirements):** REQ-SCRUM-9-01 … 08 and 10 … 27.

| Area | Requirements |
|---|---|
| Status rules and access control (API) | 01, 02, 03, 04, 05, 06, 07, 08, 26 |
| Storefront: My Orders, tracking, confirmation | 10, 11, 12, 13, 14, 15, 16, 17, 18, 19 |
| Admin panel | 20, 21, 22, 23, 24, 25 |
| Devices | 27 |

**Out of scope**

| Item | Reason |
|---|---|
| REQ-SCRUM-9-09 Monitoring counts cancelled orders | Technical, not visible in the UI (CHG-12). Not part of black-box functional testing; at most one technical check of the metrics endpoint, not planned in this cycle (see Open question 4). |
| Cancelling after the kitchen accepts | Not in this release (spec out of scope). Only the refusal is tested (REQ-SCRUM-9-03). |
| Asking for a cancellation reason | Not in this release. |
| Refunds | Orders are cash on delivery. |
| Cancelling a Declined order when the order time was violated | Proposal for a later task (CHG-10). Only the refusal is tested (REQ-SCRUM-9-26). |
| Non-functional testing (performance, security penetration, accessibility audit) | Covered by the parent plan, not specific to this feature. |

## 3. Risks

Level = likelihood (1–3) × impact (1–3): 6–9 High, 3–4 Medium, 1–2 Low.

| Risk ID | Description | Requirements | Likelihood | Impact | Level |
|---|---|---|---|---|---|
| RSK-SCRUM-9-01 | A customer or visitor cancels, or sees a cancel option on, someone else's order (access control) | 04, 05, 11 | 2 | 3 | **High (6)** |
| RSK-SCRUM-9-02 | An order is cancelled after the kitchen accepted it (food already cooked), including the race "accepted just before confirm" and Declined orders | 03, 12, 17, 26 | 2 | 3 | **High (6)** |
| RSK-SCRUM-9-03 | A cancelled order is changed again (by the customer or the admin team), or the admin team sets Cancelled | 06, 07, 08, 23 | 2 | 3 | **High (6)** |
| RSK-SCRUM-9-04 | The customer cannot cancel their own new order, or cancels it by mistake (main flow, confirmation) | 02, 10, 13, 14, 15 | 2 | 3 | **High (6)** |
| RSK-SCRUM-9-05 | Revenue figure includes cancelled or declined orders | 24, 25 | 2 | 2 | Medium (4) |
| RSK-SCRUM-9-06 | Cancelled orders are not clearly labelled (label, colour, progress bar) | 01, 16, 18, 19, 20 | 2 | 2 | Medium (4) |
| RSK-SCRUM-9-07 | Operations cannot find or recognise cancelled orders (filter, note) | 21, 22 | 2 | 2 | Medium (4) |
| RSK-SCRUM-9-08 | The cancel flow is broken on some phone or desktop sizes | 27 | 2 | 2 | Medium (4) |
| RSK-SCRUM-9-09 | Monitoring miscounts cancelled orders | 09 | 1 | 1 | Low (1) — out of scope |

## 4. Test approach

Level: **API** = integration level (requests to `/api/**`, `/admin/**`); **UI** = system level (browser). High-risk requirements are tested at both levels; where a requirement is UI-only, its server rule is covered by the API test of the linked requirement.

| Requirement | Risk level | Level | Technique | Priority |
|---|---|---|---|---|
| REQ-SCRUM-9-01 Cancelled status exists | Medium (RSK-06) | API + UI | Checklist | Medium |
| REQ-SCRUM-9-02 Owner cancels a Received order | High (RSK-04) | API + UI | State transition (valid Received → Cancelled) | High |
| REQ-SCRUM-9-03 Accepted or later refused, 400 + message on screen | High (RSK-02) | API + UI | State transition (invalid transitions) | High |
| REQ-SCRUM-9-04 Someone else's order → 404 as unknown | High (RSK-01) | API + UI | Decision table (signed in × owner × status) | High |
| REQ-SCRUM-9-05 Not signed in → 401 | High (RSK-01) | API + UI | Decision table (same table as 04) | High |
| REQ-SCRUM-9-06 Already Cancelled cannot be cancelled again | High (RSK-03) | API + UI | State transition (invalid Cancelled → Cancelled) | High |
| REQ-SCRUM-9-07 Cancelled is final for everyone | High (RSK-03) | API + UI | State transition (all transitions out of Cancelled) | High |
| REQ-SCRUM-9-08 Admin still changes other statuses, cannot set Cancelled | High (RSK-03) | API + UI | State transition + decision table (role × target status) | High |
| REQ-SCRUM-9-09 Monitoring | Low (RSK-09) | — | Out of scope (see §2) | — |
| REQ-SCRUM-9-10 My Orders: button for Received orders | High (RSK-04) | UI (server rule: REQ-02) | State transition (button per status) | High |
| REQ-SCRUM-9-11 Tracking: button only for the signed-in owner [Assumption] | High (RSK-01) | UI (server rule: REQ-04, 05) | Decision table (signed in × owner × status) | High |
| REQ-SCRUM-9-12 No cancel option for Accepted or later | High (RSK-02) | UI (server rule: REQ-03) | State transition (button per status) | High |
| REQ-SCRUM-9-13 Confirmation question and choices | High (RSK-04) | UI | Checklist (exact texts) | High |
| REQ-SCRUM-9-14 Keep order leaves the order unchanged | High (RSK-04) | UI | State transition (no transition) + error guessing (close by Esc / outside click) | High |
| REQ-SCRUM-9-15 Cancel order → shows "Cancelled" | High (RSK-04) | UI (server rule: REQ-02) | State transition | High |
| REQ-SCRUM-9-16 Neutral grey, different from red Declined | Medium (RSK-06) | UI | Checklist (visual comparison) | Medium |
| REQ-SCRUM-9-17 Accepted just before confirm → reason + refresh | High (RSK-02) | API + UI | Error guessing (race: two sessions, admin accepts while the dialog is open) | High |
| REQ-SCRUM-9-18 Progress bar not "in progress" | Medium (RSK-06) | UI | Checklist | Medium |
| REQ-SCRUM-9-19 "Cancelled" on My Orders, tracking, admin | Medium (RSK-06) | UI | Checklist (exact label in three places) | Medium |
| REQ-SCRUM-9-20 Admin: own status, exact spelling, own colour | Medium (RSK-06) | UI | Checklist | Medium |
| REQ-SCRUM-9-21 Admin list filter: only cancelled | Medium (RSK-07) | API + UI | Equivalence partitioning (one partition per status value of the filter) | Medium |
| REQ-SCRUM-9-22 Note "Cancelled by customer" in list and details | Medium (RSK-07) | UI | Checklist | Medium |
| REQ-SCRUM-9-23 No Accept / Deliver / Reject buttons | High (RSK-03) | UI (server rule: REQ-07) | State transition (buttons per status) | High |
| REQ-SCRUM-9-24 Recent revenue excludes cancelled | Medium (RSK-05) | UI | Equivalence partitioning (status counts / does not count) — compare the figure before and after | Medium |
| REQ-SCRUM-9-25 Recent revenue excludes declined | Medium (RSK-05) | UI | Equivalence partitioning (same as 24) | Medium |
| REQ-SCRUM-9-26 Declined cannot be cancelled | High (RSK-02) | API + UI | State transition (invalid Declined → Cancelled) | High |
| REQ-SCRUM-9-27 Main flow on common phones and desktops | Medium (RSK-08) | UI | Checklist (one run of the main flow per device in §6) | Medium |

No input fields with ranges or lengths are added by this feature, so EP/BVA is used only for the filter and revenue partitions.

## 5. Test types

- **Functional black-box testing** of all in-scope requirements (manual execution in step 05, automation in step 06).
- **Confirmation testing:** after a defect is fixed, the test case that found it is run again before the defect is closed.
- **Regression testing:** after a fix, the SCRUM-9 test cases and the project regression suite (`npm run test:regression`) run again; existing order flows (place order, admin accept/deliver/reject, ratings) must still work (REQ-SCRUM-9-08).

## 6. Environment and devices

| Component | Value |
|---|---|
| Storefront and API | https://foodme-lianals.onrender.com |
| Admin panel | https://foodme-lianals.onrender.com/backoffice (admin / admin123) |
| Build | `main` at `fb452d5` |
| Known environment behaviour | Free Render instance (slow first request); simulated latency 200–1500 ms on every request — waits are on conditions, never fixed times |

**Device list — approved 2026-10-14 (REQ-SCRUM-9-27)**

| Device | Viewport (CSS px) | Browser engine |
|---|---|---|
| iPhone 15 | 393 × 852 | WebKit (Safari) |
| Samsung Galaxy S24 | 360 × 780 | Chromium (Chrome) |
| Google Pixel 7 | 412 × 915 | Chromium (Chrome) |
| iPad (10th gen) | 820 × 1180 | WebKit (Safari) |
| Laptop | 1366 × 768 | Chromium (Chrome) |
| Desktop | 1920 × 1080 | Chromium (Chrome) |

The full main flow (REQ-SCRUM-9-27) runs on every device in the list; WebKit is in scope for this flow only (exception to the parent plan, decision 1 in §13). All other test cases run on Desktop 1920 × 1080 (Chromium) unless the test case says otherwise.

## 7. Test data

- Every test creates its own customer (unique email, for example `qa-<yyyymmdd>-<nn>@example.com`, password `secret123`) and its own orders; registration goes through the API unless the test is about the sign-up UI.
- Orders in Accepted, Delivered or Declined status are created by placing a new order and moving it with the admin account.
- A second customer is created for the "someone else's order" cases.
- Seed chefs, dishes and the admin account are never changed.
- The revenue figure (REQ-SCRUM-9-24, 25) depends on all recent orders on the shared environment, so tests compare the figure right before and right after the action instead of expecting a fixed amount.

## 8. Entry criteria

1. `spec.yaml` approved (done 2026-10-14) and this plan approved.
2. Build `fb452d5` (or later) is deployed and the storefront, admin panel and API answer.
3. A customer can register and place an order, and the admin account can sign in (otherwise all SCRUM-9 tests are blocked).
4. Test cases (step 03) are written and passed the case judge (step 04).

## 9. Exit criteria

Testing of SCRUM-9 is done when **all** of these are true:

1. Every in-scope requirement (26) has at least one executed test case; 100% requirement coverage in the traceability from REQ to test case.
2. 100% of High-priority test cases are executed; at least 90% of all test cases are executed.
3. Every requirement has at least one passed test case, or its failure is reported as a defect in Jira.
4. No open Blocker or Critical defect linked to SCRUM-9.
5. The main flow (REQ-SCRUM-9-27) passed on every approved device.
6. Every failed test has a defect in Jira; blocked tests have a reason.
7. The test report (step 10) is written with measured numbers.

## 10. Suspension and resumption criteria

- **Suspend** when the test environment is down for more than 15 minutes, when an order cannot be placed or the admin cannot sign in (all SCRUM-9 tests depend on it), or when a Blocker defect stops the cancel flow.
- **Resume** when the cause is fixed and the entry criteria 2 and 3 are met again.

## 11. Deliverables

All in `workflows/functional-testing/runs/SCRUM-9/` unless stated otherwise.

| Step | Deliverable |
|---|---|
| 01 | `spec.yaml` (done) |
| 02 | `plan.md` (this document) |
| 03 | Test cases (`test_cases`; also in Qase when the Qase MCP is connected) |
| 04 | Case judge verdict (JSON) |
| 05 | `execution.md` — manual execution log |
| 06 | Automated Playwright specs (in `apps/web/e2e/`, `apps/web/e2e/api/`, `apps/admin/e2e/`) |
| 07 | Test judge verdict (JSON) |
| 08 | `results.json` — automated run results |
| 10 | `report.html` — test report |
| 11 | `guide.md` — guide posted to Jira after approval |

## 12. Defect management

- Tracker: Jira `liana-qa.atlassian.net`, project **SCRUM**, issue type **Task** with label **`bug`**, linked to SCRUM-9; filed with the `bug-report` skill; Jira accessed only through the Atlassian MCP.
- Severity (Blocker, Critical, Major, Minor, Trivial) and priority (Highest … Lowest) follow `.agents/rules/defect-management.md`. Guide for this feature: access-control failures (RSK-01) and cancelling an accepted order (RSK-02) are at least **Critical**; wrong labels or colours are **Minor**.
- Lifecycle: New → Open → In Progress → Fixed → Retest (confirmation test) → Closed.

## 13. Open questions — decisions

1. The parent plan has "browsers other than Chromium" out of scope, but the common phones and tablets in §6 include iPhone and iPad, which use Safari (WebKit). Should WebKit be in scope for REQ-SCRUM-9-27? Proposed: yes, only for the main flow on iPhone 15 and iPad.
   **Decision:** yes — WebKit for the main flow on iPhone 15 and iPad.
2. REQ-SCRUM-9-11 is an [Assumption] (button only for the owner) that the product owner has not confirmed. Test cases are designed on the assumption; if the product owner decides otherwise, the requirement and its test cases change.
   **Decision:** agreed — design on the assumption, keep it marked [Assumption].
3. REQ-SCRUM-9-16 "neutral grey": proposed check — visual comparison next to a Declined order (grey, not red, and different from the other status colours). Is a visual check enough, or is an exact colour expected?
   **Decision:** visual check.
4. REQ-SCRUM-9-09 monitoring: skip the technical metrics check in this cycle (proposed), or add one check?
   **Decision:** skip in this cycle.

## 14. Approval

| Role | Name | Date | Decision |
|---|---|---|---|
| Test manager | Liana Sarajyan | 2026-10-14 | **approved** |
