# Test execution log — SCRUM-9 Cancel order (step 05)

**ISTQB:** CTFL 5.1 (test execution, entry/exit criteria), 5.5 (defect reports) · **Template:** ISO/IEC/IEEE 29119-3 Test Execution Log
**Plan:** [plan.md](plan.md) TP-SCRUM-9 v1.0 · **Test cases:** [test_cases.yaml](test_cases.yaml) revision 3 (case judge PASS 37/0/0)

## 1. Header

| Item | Value |
|---|---|
| Date | 2026-10-15 (UTC 2026-10-14 21:01–21:35) |
| Tester | Liana Sarajyan (QA); executed by Claude through the Playwright MCP browser |
| Test object | https://foodme-lianals.onrender.com (storefront, API), /backoffice (admin) — `main` at `fb452d5` (Render deploy "SCRUM-9 … (#7)") |
| Browser | Playwright MCP, Chromium. Desktop 1920×1080 unless stated; TC-34 also 1366×768, 412×915, 360×780, 393×852, 820×1180 |
| Qase | Project FML, suite 6, **run 1** "SCRUM-9 manual execution 2026-10-15" (completed) — 37 active cases; TC-SCRUM-9-07 is deprecated and not run |
| Evidence | [evidence/](evidence/) — screenshots named by TC ID; 12 of them attached to the Qase results |

**How preconditions were set up.** Customers and orders were created through the public API (`/api/auth/register`, `/api/order`); admin status changes in preconditions used the admin API (`/admin/order/{id}/status`). For "customer is signed in", the API sign-up response was stored in the browser the same way the storefront stores it after a sign-in (`localStorage` key `foodme.customer.auth`); the sign-up UI itself was executed in TC-34. Where several cases have the same precondition and an earlier case leaves the data unchanged, the same customer and order were reused (TC-15 → 17 → 18 → 19 → 20 on FM-100091; TC-16, 21, 23, 26, 35 on one customer with orders in every status; TC-28, 29, 30, 33, 37 on one customer with five orders). Every test customer is new (`qa-20261015-…@example.com`); seed data was not changed.

## 2. Entry criteria

| Criterion (plan §8) | Result |
|---|---|
| 1. `spec.yaml` and plan approved | Met (2026-10-14) |
| 2. Build `fb452d5` deployed, storefront, admin and API answer | Met at 21:17 UTC — the free Render instance answered 503 "Application loading" for about 16 minutes after the first request (spin-down). The Render log showed a normal Spring Boot start; `/actuator/health` then returned `UP`. Not a defect (known environment behaviour, plan §6) |
| 3. A customer can register and place an order; admin can sign in | Met — FM-100076 placed, admin login 200 |
| 4. Test cases written and passed the case judge | Met — `case_verdict.json` PASS 37/0/0 |

## 3. Summary

| Executed | Passed | Failed | Blocked | Skipped | Not run |
|---|---|---|---|---|---|
| 37 (33 completed + 4 blocked) | **26** | **7** | **4** | 0 | 0 (TC-07 deprecated) |

- API cases: 14 / 14 passed. UI cases: 12 passed, 7 failed, 4 blocked of 23.
- **Requirement coverage** (requirements with at least one passed case / in scope): **18 / 26 (69 %)**. Without a passed case: REQ-SCRUM-9-13, 18, 20, 22, 23 (failed cases), REQ-SCRUM-9-24, 25, 27 (blocked cases).

## 4. Results

| TC ID | Qase | Prio | Status | Failed step: expected vs. actual | Evidence | Defect |
|---|---|---|---|---|---|---|
| TC-SCRUM-9-01 | 16 | High | Passed | — | API: FM-100077 200 CANCELLED | — |
| TC-SCRUM-9-02 | 17 | High | Passed | — | FM-100078 400 "Only new orders can be cancelled." | — |
| TC-SCRUM-9-03 | 18 | High | Passed | — | FM-100079 400, stays DELIVERED | — |
| TC-SCRUM-9-04 | 19 | High | Passed | — | FM-100080 400, stays REJECTED | — |
| TC-SCRUM-9-05 | 20 | High | Passed | — | FM-100081 second cancel 400 | — |
| TC-SCRUM-9-06 | 21 | High | Passed | — | FM-100082 404 = FM-999999 404 (same body) | — |
| TC-SCRUM-9-08 | 23 | High | Passed | — | FM-100083 401 | — |
| TC-SCRUM-9-09 | 24 | High | Passed | — | FM-100084 4 × 400 "Cannot transition order from CANCELLED to …" | — |
| TC-SCRUM-9-10 | 25 | High | Passed | — | FM-100085 400, stays NEW | — |
| TC-SCRUM-9-11 | 26 | High | Passed | — | FM-100086/087 200 ACCEPTED, DELIVERED, REJECTED | — |
| TC-SCRUM-9-12 | 27 | High | Passed | — | FM-100088 accept 200, cancel 400, stays ACCEPTED | — |
| TC-SCRUM-9-13 | 28 | Medium | Passed | — | filter CANCELLED: 4 rows, all CANCELLED | — |
| TC-SCRUM-9-14 | 29 | Medium | Passed | — | filter NEW: 50 rows, no cancelled order | — |
| TC-SCRUM-9-36 | 51 | High | Passed | — | FM-100090 (Accepted) by other customer 404, not 400 | — |
| TC-SCRUM-9-15 | 30 | High | Passed | — | FM-100091 Received + "Cancel order" | — |
| TC-SCRUM-9-16 | 31 | High | Passed | — | [statuses](evidence/TC-SCRUM-9-16-21-my-orders-statuses.png) | — |
| TC-SCRUM-9-17 | 32 | High | **Failed** | Step 2: expected exactly two choices "Keep order" / "Cancel order"; actual also a "Close" (×) button | [dialog](evidence/TC-SCRUM-9-17-confirmation.png) | TW-01 (testware) |
| TC-SCRUM-9-18 | 33 | High | Passed | — | — | — |
| TC-SCRUM-9-19 | 34 | High | Passed | — | — | — |
| TC-SCRUM-9-20 | 35 | High | Passed | — | [cancelled](evidence/TC-SCRUM-9-20-my-orders-cancelled.png) | — |
| TC-SCRUM-9-21 | 36 | Medium | Passed | — | [statuses](evidence/TC-SCRUM-9-16-21-my-orders-statuses.png) | — |
| TC-SCRUM-9-22 | 37 | High | **Failed** | Step 3: expected status title "Cancelled"; actual "Order cancelled" + "You cancelled this order." | [tracking](evidence/TC-SCRUM-9-22-tracking-after-cancel.png) | DEF-01 |
| TC-SCRUM-9-23 | 38 | Medium | **Failed** | Step 1: same as TC-22 (step 2 — no current progress step — passed) | [tracking](evidence/TC-SCRUM-9-23-tracking-FM-100095.png) | DEF-01 |
| TC-SCRUM-9-24 | 39 | High | Passed | — | [signed out](evidence/TC-SCRUM-9-24-tracking-signed-out.png) | — |
| TC-SCRUM-9-25 | 40 | High | **Failed** | Step 1: expected no "Cancel order" for another signed-in customer; actual button shown | [other customer](evidence/TC-SCRUM-9-25-tracking-other-customer.png) | DEF-02 |
| TC-SCRUM-9-26 | 41 | High | Passed | — | — | — |
| TC-SCRUM-9-27 | 42 | High | Passed | — | [race](evidence/TC-SCRUM-9-27-race-message.png) | — |
| TC-SCRUM-9-35 | 50 | High | Passed | — | [Delivered](evidence/TC-SCRUM-9-35-tracking-FM-100093.png), [Declined](evidence/TC-SCRUM-9-35-tracking-FM-100094.png) | — |
| TC-SCRUM-9-28 | 43 | Medium | **Failed** | Step 1: expected "Cancelled"; actual "CANCELLED". Step 3: expected note "Cancelled by customer" in the list row; actual no note | [list](evidence/TC-SCRUM-9-28-admin-list.png) | DEF-03, DEF-04 |
| TC-SCRUM-9-29 | 44 | High | **Failed** | Step 1: note shown, but status "CANCELLED" not "Cancelled"; step 2 (no Mark as … buttons) passed | [details](evidence/TC-SCRUM-9-29-37-admin-details-cancelled.png) | DEF-03 |
| TC-SCRUM-9-37 | 52 | Medium | **Failed** | Step 1: "CANCELLED" not "Cancelled"; step 2 (own colour) passed | [details](evidence/TC-SCRUM-9-29-37-admin-details-cancelled.png) | DEF-03 |
| TC-SCRUM-9-30 | 45 | Medium | Passed | — | [filter](evidence/TC-SCRUM-9-30-admin-filter.png) | — |
| TC-SCRUM-9-33 | 48 | High | Passed | — | — | — |
| TC-SCRUM-9-31 | 46 | Medium | Blocked | see §5 | [dashboard](evidence/TC-SCRUM-9-31-32-38-dashboard.png) | TW-02 |
| TC-SCRUM-9-32 | 47 | Medium | Blocked | see §5 | same | TW-02 |
| TC-SCRUM-9-38 | 53 | Medium | Blocked | see §5 | same | TW-02 |
| TC-SCRUM-9-34 | 49 | Medium | Blocked (partly) | see §5 | [Pixel 7](evidence/TC-SCRUM-9-34-Pixel-7.png) and 5 more | — |

## 5. Blocked and skipped

- **TC-SCRUM-9-31, 32, 38 — "Recent revenue" (REQ-SCRUM-9-24, 25).** The dashboard figure is the sum over the **latest 100 orders** only. Each new order pushes the oldest one out of the window, so "R2 = R1" or "R2 = R1 + T" cannot be observed on a database with more than 100 orders (measured: 464,450 → 458,950 after a new 6,000 AMD order pushed out FM-100005 of 11,500). The first readings (474,250) came from a cached page and are not used. Supporting observation, not a pass: at every reading the dashboard value equalled the sum of the latest 100 orders without Cancelled and Declined, computed from the admin API. See TW-02.
- **TC-SCRUM-9-34 — main flow on devices (REQ-SCRUM-9-27).** Passed on Desktop 1920×1080, Laptop 1366×768, Pixel 7, Galaxy S24 (Chromium), and on the iPhone 15 and iPad viewport sizes in Chromium (FM-100109…114, all TAKEAWAY / CANCELLED). **Blocked part:** iPhone 15 and iPad require WebKit (plan §6), which the Playwright MCP browser does not provide → to be covered by the automated run (step 08).

## 6. Defects

Filed 2026-10-15 after the human's approval as **one subtask** of SCRUM-9: [SCRUM-10](https://liana-qa.atlassian.net/browse/SCRUM-10) (Subtask, label `bug`, priority Low) — contains DEF-01 … DEF-04 below.

### DEF-01 — Tracking page shows "Order cancelled" and extra text instead of the status title "Cancelled"
- **Severity / priority:** Minor / Low
- **Requirement / test cases:** REQ-SCRUM-9-19 (CHG-01), REQ-SCRUM-9-18 (CHG-16) · TC-SCRUM-9-22, TC-SCRUM-9-23
- **Environment:** https://foodme-lianals.onrender.com, build fb452d5, Chromium 1920×1080
- **Steps:** 1. Sign in as a customer with a Received order. 2. Open `/tracking/{number}`. 3. Click "Cancel order", then "Cancel order" in the confirmation.
- **Expected:** the status title of the order is "Cancelled", with no other text (CHG-01).
- **Actual:** the title is "Order cancelled" and a second line "You cancelled this order." is shown (FM-100095, FM-100096).
- **Evidence:** evidence/TC-SCRUM-9-22-tracking-after-cancel.png, evidence/TC-SCRUM-9-23-tracking-FM-100095.png

### DEF-02 — Tracking page shows "Cancel order" to a signed-in customer who does not own the order
- **Severity / priority:** Minor / Low — the server still refuses with 404 (TC-SCRUM-9-06 passed), so no data is changed; the requirement is an **[Assumption]** that the product owner must confirm before the fix.
- **Requirement / test case:** REQ-SCRUM-9-11 (CHG-11, [Assumption]) · TC-SCRUM-9-25
- **Environment:** as DEF-01
- **Steps:** 1. Customer A places an order (Received). 2. Sign in as customer B. 3. Open `/tracking/{A's order number}`.
- **Expected:** no "Cancel order" button (only the owner sees it).
- **Actual:** the "Cancel order" button is shown to customer B (FM-100097).
- **Evidence:** evidence/TC-SCRUM-9-25-tracking-other-customer.png

### DEF-03 — Admin panel shows the status as "CANCELLED" instead of "Cancelled"
- **Severity / priority:** Minor / Low
- **Requirement / test cases:** REQ-SCRUM-9-20 (CHG-02 "spelled exactly Cancelled"), REQ-SCRUM-9-19 · TC-SCRUM-9-28, 29, 37 (also the filter option in TC-30)
- **Environment:** /backoffice, build fb452d5, Chromium 1920×1080
- **Steps:** 1. A customer cancels an order. 2. Admin opens Orders, then the order details.
- **Expected:** the status reads exactly "Cancelled".
- **Actual:** "CANCELLED" in the list chip, the details chip and the status filter option (FM-100100).
- **Evidence:** evidence/TC-SCRUM-9-28-admin-list.png, evidence/TC-SCRUM-9-29-37-admin-details-cancelled.png

### DEF-04 — Admin order list has no "Cancelled by customer" note
- **Severity / priority:** Minor / Low
- **Requirement / test case:** REQ-SCRUM-9-22 (CHG-05: list and details) · TC-SCRUM-9-28
- **Environment:** as DEF-03
- **Steps:** 1. A customer cancels an order. 2. Admin opens Orders and finds the order.
- **Expected:** the row shows the note "Cancelled by customer".
- **Actual:** no note in the list row; the note is shown only in the order details (FM-100100).
- **Evidence:** evidence/TC-SCRUM-9-28-admin-list.png

Duplicate check: Jira SCRUM has no open `bug` issue about cancel / tracking / CANCELLED. None of these is a planted `FM-BUG-xx` defect.

## 7. Testware issues

- **TW-01 (TC-SCRUM-9-17).** "Exactly two choices" is stricter than REQ-SCRUM-9-13, which names the two choices but does not forbid a close (×) icon. Either the requirement should say "no other controls" (requirement change) or the case should check only the two named choices.
- **TW-02 (TC-SCRUM-9-31, 32, 38).** The revenue cases assume the figure is a total over all orders. It is a rolling sum over the latest 100 orders, and the spec does not say what "Recent" means (possible requirement gap). The cases need another oracle, for example comparing the figure with the sum over the same 100 orders, or a check that a cancelled / declined order in the window is left out.

## 8. Exit criteria (plan §9)

| Criterion | Status |
|---|---|
| 1. Every in-scope requirement has at least one executed test case | **Not met** — REQ-24, 25 only have blocked cases; REQ-27 partly blocked (WebKit) |
| 2. 100 % High-priority executed; ≥ 90 % of all executed | High: **met** (26/26 completed). All: **not met** — 33 of 37 completed (89 %), 4 blocked |
| 3. Every requirement has a passed case or a reported defect | **Not met yet** — needs the defects filed (DEF-01…04), TW-01 for REQ-13, and TW-02 for REQ-24/25 |
| 4. No open Blocker or Critical defect | **Met** — the proposed defects are Minor |
| 5. Main flow passed on every approved device | **Not met** — WebKit part of iPhone 15 and iPad blocked (step 08) |
| 6. Every failed test has a Jira defect; blocked tests have a reason | **Not met yet** — waiting for the decision on DEF-01…04; blocked reasons recorded |
| 7. Test report (step 10) written | Not yet |
