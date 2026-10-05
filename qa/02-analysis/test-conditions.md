# FoodMe — Test Conditions

**ISTQB:** CTFL 1.4.2 — test analysis answers *"what to test"*.
**Input:** [requirements.md](requirements.md) (test basis), [risk-register.md](../01-planning/risk-register.md) (risk level → depth).
**Output:** test conditions, used in `03-design/` to derive test cases.

A **test condition** is a testable aspect of the system. One requirement gives
one or more conditions. Each condition names the design technique planned for
it (CTFL chapter 4).

| ID | Condition | Source | Risk | Planned technique |
|---|---|---|---|---|
| TCOND-01 | All `ACTIVE` chefs are listed; count of cards = API `count` | REQ-01 | RSK-07 | EP (active / inactive), BVA (last page) |
| TCOND-02 | Unknown chef id shows "Chef not found" / `404` | REQ-02 | RSK-10 | EP (existing / non-existing id) |
| TCOND-03 | Line price includes additions | REQ-03 | RSK-01 | EP (with / without additions) |
| TCOND-04 | Quantity +/− by exactly one; removal only at minimum | REQ-04 | RSK-06 | BVA (min, min+1), state transition (cart) |
| TCOND-05 | Cart survives reload | REQ-05 | RSK-11 | Error guessing |
| TCOND-06 | Cross-chef add shows the "Switch kitchens?" dialog | REQ-06 | RSK-06 | State transition (cart) |
| TCOND-07 | Delivery price below / at / above the free-delivery threshold | REQ-07 | RSK-02 | BVA (4999 / 5000 / 5001) |
| TCOND-08 | Delivery price for DELIVERY vs TAKEAWAY | REQ-07 | RSK-02 | Decision table |
| TCOND-09 | Empty cart / signed-out checkout | REQ-08 | RSK-05 | Decision table |
| TCOND-10 | Checkout field rules (name, phone, email, note, city, street) | REQ-09 | RSK-04 | EP + BVA, decision table (delivery method × address) |
| TCOND-11 | Successful order: number, status `NEW`, cart cleared | REQ-10 | RSK-03 | Use case / scenario |
| TCOND-12 | Order total = Σ((price + additions) × qty) + delivery | REQ-10 | RSK-01 | EP + BVA on quantity, additions |
| TCOND-13 | Invalid quantity (0, negative, missing) rejected | REQ-11 | RSK-01 | EP (invalid partitions) |
| TCOND-14 | Dish from another chef or inactive dish rejected | REQ-11 | RSK-01 | EP, error guessing |
| TCOND-15 | Order history sorted newest first; tracking page | REQ-12 | RSK-12 | Scenario |
| TCOND-16 | Order creation time is correct | REQ-12 | RSK-12 | Error guessing (time zones) |
| TCOND-17 | Registration field lengths | REQ-13 | RSK-04 | EP + 2-value BVA |
| TCOND-18 | Duplicate email (case-insensitive) | REQ-13 | RSK-04 | EP |
| TCOND-19 | Login error is identical for wrong password / unknown email | REQ-14 | RSK-08 | EP |
| TCOND-20 | Admin login valid / invalid | REQ-15 | RSK-08 | EP |
| TCOND-21 | Order status transitions valid / invalid | REQ-16 | RSK-09 | State transition (all transitions + invalid ones) |
| TCOND-22 | Customer text is not rendered as HTML in back office | REQ-17 | RSK-08 | Error guessing (XSS), checklist |
| TCOND-23 | Back-office edits appear in storefront | REQ-18 | RSK-10 | Scenario |
| TCOND-24 | p95 response time ≤ 2000 ms, error rate < 1% | REQ-NF-01 | RSK-13 | Performance (load) test |
| TCOND-25 | No critical/serious axe violations | REQ-NF-02 | RSK-14 | Checklist-based (WCAG), tool-supported |
| TCOND-26 | Protected endpoints return 401 without token | REQ-NF-03 | RSK-08 | EP (no token / customer token / admin token) |
| TCOND-27 | Server errors reported to GlitchTip | REQ-NF-04 | RSK-15 | Scenario |
| TCOND-28 | No horizontal scroll at 375 px | REQ-NF-05 | RSK-14 | Checklist-based |
