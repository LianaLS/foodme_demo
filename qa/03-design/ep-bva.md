# Equivalence Partitioning and Boundary Value Analysis

**ISTQB:** CTFL 4.2.1 (EP), 4.2.2 (BVA)
**Input:** [test-conditions.md](../02-analysis/test-conditions.md) · **Output:** test cases in [test-cases.md](../test-cases.md)

## How to read this document

- **EP:** split the input domain into **partitions** that the system should treat the same way. One value from each partition is enough. Invalid partitions are tested **one at a time**, so one failure does not hide another.
- **BVA:** defects hide at the edges of ordered partitions. This project uses **2-value BVA**: for each boundary, the boundary value and its closest neighbour in the next partition (CTFL v4.0).
- **Coverage:** EP coverage = partitions tested / partitions identified. BVA coverage = boundary values tested / boundary values identified.

Legend: ✔ valid partition · ✘ invalid partition

---

## 1. Customer registration (REQ-13 · TCOND-17, TCOND-18)

Source of rules: `CustomerRegisterRequestDto.java` (backend), `auth-schema.ts` (UI).

### 1.1 Password length — rule 8–72

| Partition | Range | Valid? |
|---|---|---|
| P1 | 0–7 | ✘ too short |
| P2 | 8–72 | ✔ |
| P3 | ≥ 73 | ✘ too long |

| Boundary values (2-value BVA) | 7 | 8 | 72 | 73 |
|---|---|---|---|---|
| Expected (API) | 400 | 200 | 200 | 400 |
| Expected (UI) | "Password must be at least 8 characters" | account created | account created | error shown **[Assumption]** — the UI has no max rule |

### 1.2 Full name length — rule 2–120

| Boundary values | 1 | 2 | 120 | 121 |
|---|---|---|---|---|
| Expected (API) | 400 | 200 | 200 | 400 |

### 1.3 Phone length — rule 8–32

| Boundary values | 7 | 8 | 32 | 33 |
|---|---|---|---|---|
| Expected (API) | 400 | 200 | 200 | 400 |

### 1.4 Email

| Partition | Example | Valid? | Expected |
|---|---|---|---|
| E1 valid, new | `api-<ts>@example.com` | ✔ | 200 |
| E2 no `@` | `abc` | ✘ | 400 / "Enter a valid email" |
| E3 no domain | `test@` | ✘ | 400 / "Enter a valid email" |
| E4 already registered, same case | `X` | ✘ | 400 "Email already registered" |
| E5 already registered, different letter case | `X.toUpperCase()` | ✘ | 400 "Email already registered" |
| E6 already registered, surrounding spaces | `" " + X + " "` | ✘ | 400 (rejected as invalid format — no duplicate created) |
| E7 empty | `""` | ✘ | 400 / "Enter a valid email" |

**Test cases:** TC-13 (UI), TC-16 (API boundaries), TC-17 (E4, E5, E6).
**Coverage:** EP 7/7 email partitions, 3/3 length partitions per field. BVA 12/12 values.

---

## 2. Customer login (REQ-14 · TCOND-19)

| Partition | Email | Password | Expected |
|---|---|---|---|
| L1 | registered | correct | 200, token |
| L2 | registered | wrong (≥ 8 chars) | 400 "Invalid email or password" |
| L3 | not registered | any (≥ 8 chars) | 400 "Invalid email or password" — **same** as L2 |
| L4 | empty | empty | UI validation, no request |

**Test cases:** TC-14 (UI), TC-18 (API).

---

## 3. Checkout form (REQ-09 · TCOND-10)

Source: `checkout-schema.ts`.

| Field | Partitions | Boundary values | Expected |
|---|---|---|---|
| Full name | ✘ 0–1 · ✔ ≥ 2 | 1, 2 | 1 → "Enter your name"; 2 → accepted |
| Phone | ✘ 0–7 · ✔ ≥ 8 | 7, 8 | 7 → "Enter a valid phone number"; 8 → accepted |
| Email | ✔ valid · ✘ no `@` · ✘ empty | — | invalid → "Enter a valid email" |
| Note | ✔ 0–300 · ✘ ≥ 301 | 300, 301 | 300 → order placed; 301 → visible error or input stops at 300 **[Assumption]** |
| City / Street | depends on delivery method — see [decision-tables.md](decision-tables.md) §2 | — | — |

**Test cases:** TC-11 (UI), TC-30 (note boundary), Vitest `checkout-schema.test.ts` (component level).

---

## 4. Free delivery threshold (REQ-07 · TCOND-07) — High risk RSK-02

Seed data: delivery price **500 AMD**, free delivery from **5000 AMD**.
Rule (AC-07.1, AC-07.2): subtotal **< 5000** → 500; subtotal **≥ 5000** → 0.

| Partition | Subtotal | Delivery price |
|---|---|---|
| D1 | 0 – 4999 | 500 |
| D2 | ≥ 5000 | 0 |

| Boundary values (2-value BVA) | 4999 | 5000 |
|---|---|---|
| Expected `deliveryPrice` | 500 | 0 |

Plus one extra value inside D2 (5001) as a sanity check.

**Test cases:** TC-19 (API), JUnit `OrderServiceDeliveryPriceTest` (component).
**Why this matters:** an off-by-one comparison (`>` instead of `>=`) is the classic defect that BVA finds and EP alone does not.

---

## 5. Order item quantity (REQ-10, REQ-11 · TCOND-12, TCOND-13) — High risk RSK-01

Rule (AC-11.1): quantity is a whole number ≥ max(1, dish minimum order count).

| Partition | Values | Valid? | Expected (API `POST /api/order`) |
|---|---|---|---|
| Q1 | ≤ −1 | ✘ negative | 400 |
| Q2 | 0 | ✘ zero | 400 |
| Q3 | missing (`null`) | ✘ | 400 |
| Q4 | ≥ 1 | ✔ | 200, total = (price + additions) × quantity |

| Boundary values | 0 | 1 |
|---|---|---|
| Expected | 400 | 200 |

**Test cases:** TC-21 (Q4 with and without additions), TC-22 (Q1, Q2, Q3).

## 6. Cart minimum quantity (REQ-04 · TCOND-04)

Rule: **−** decreases by 1; at quantity = minimum (usually 1) the item is removed.

| Boundary values | min + 1 → click − | min → click − |
|---|---|---|
| Expected | quantity = min, item stays | item removed |

**Test cases:** TC-04, `cart-decrement.spec.ts`.

## 7. Active chefs list paging (REQ-01 · TCOND-01)

Rule: all `ACTIVE` chefs are returned over all pages; total items = `count` (6 in seed data).

| Page size | 1 | 5 | 6 | 12 |
|---|---|---|---|---|
| Why | smallest page | `count − 1` → 2 pages, last page has 1 item | exactly `count` → 1 full page | larger than `count` (the default UI page) |
| Expected | items over all pages = 6 | 6 | 6 | 6 |

**Test cases:** TC-01, TC-26 (API).

## 8. Customer order history page size (REQ-12 · AC-12.4)

Rule: `size` is clamped to 1–50.

| Requested `size` | 0 | 1 | 50 | 51 |
|---|---|---|---|---|
| Effective size | 1 | 1 | 50 | 50 |

**Test cases:** exploratory (low risk, RSK-12).
