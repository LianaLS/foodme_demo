# Decision Table Testing

**ISTQB:** CTFL 4.2.3
**Input:** [test-conditions.md](../02-analysis/test-conditions.md) · **Output:** test cases in [test-cases.md](../test-cases.md)

## How to read this document

A decision table lists **conditions** (inputs) and **actions** (outputs). Each
column is a **rule** — one combination of conditions. `T` = true, `F` = false,
`–` = "don't care" (the value does not change the outcome, so columns were
merged). `X` = the action happens.

**Coverage** = rules exercised by at least one test / all feasible rules. Target: 100%.

---

## DT-1 — Delivery price (REQ-07 · TCOND-08)

| | R1 | R2 | R3 |
|---|---|---|---|
| **C1** Delivery method = DELIVERY | T | T | F (TAKEAWAY) |
| **C2** Subtotal ≥ free-delivery threshold (5000) | F | T | – |
| **A1** Delivery price = chef delivery price (500) | X | | |
| **A2** Delivery price = 0 | | X | X |
| **A3** Total = subtotal + delivery price | X | X | X |
| Test value (subtotal) | 4999 | 5000 | 1000 and 6000 |
| Test case | TC-20 / TC-19 | TC-20 / TC-19 | TC-20 |

Full table before merging had 4 rules; R3 merges "TAKEAWAY & below" and
"TAKEAWAY & above" because C2 does not matter for takeaway. The test still uses
one value on each side to check that the merge is correct.

**Coverage:** 3/3 rules.

---

## DT-2 — Checkout address validation (REQ-09 · TCOND-10)

Contact fields (name, phone, email) are valid in all rules; their own rules are in [ep-bva.md](ep-bva.md) §3.

| | R1 | R2 | R3 | R4 | R5 |
|---|---|---|---|---|---|
| **C1** Delivery method = DELIVERY | T | T | T | T | F (TAKEAWAY) |
| **C2** City filled | T | F | T | F | – |
| **C3** Street filled | T | T | F | F | – |
| **A1** Order sent | X | | | | X |
| **A2** "City is required" | | X | | X | |
| **A3** "Street is required" | | | X | X | |
| **A4** Address fields visible | X | X | X | X | |
| Test case | TC-09 | TC-11 | TC-11 | TC-11 | TC-10, TC-11 step 5 |

Values containing only spaces count as **not filled** (the schema uses `trim()`) — add one such value to R2 or R3 (error guessing).

**Coverage:** 5/5 rules. Also covered at component level by `checkout-schema.test.ts`.

---

## DT-3 — Access to the checkout page (REQ-08 · TCOND-09)

| | R1 | R2 | R3 |
|---|---|---|---|
| **C1** Cart has items | F | T | T |
| **C2** User signed in | – | F | T |
| **A1** Show "Nothing to check out" + "Browse chefs" | X | | |
| **A2** Show sign-in / create-account panel | | X | |
| **A3** Show checkout form + "Place order" | | | X |
| Test case | TC-08 | TC-09 step 2 | TC-09, TC-10 |

API side: `POST /api/order` without a token → 401 (TC-25).

**Coverage:** 3/3 rules.

---

## DT-4 — Adding a dish to the cart (REQ-03, REQ-06 · TCOND-03, TCOND-06)

| | R1 | R2 | R3 | R4 |
|---|---|---|---|---|
| **C1** Cart empty | T | F | F | F |
| **C2** Dish from the same chef as the cart | – | T | F | F |
| **C3** User chooses "Clear & continue" | – | – | T | F |
| **A1** Dish added | X | X | X | |
| **A2** "Switch kitchens?" dialog shown | | | X | X |
| **A3** Previous cart cleared | | | X | |
| **A4** Cart unchanged | | | | X |
| Test case | TC-03 | TC-04 | TC-07 step 4 | TC-07 step 3 |

**Coverage:** 4/4 rules.
