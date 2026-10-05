# FoodMe — Manual Test Cases

**ISTQB:** CTFL 1.4 (test implementation), chapter 4 (test design techniques)
**Template:** ISO/IEC/IEEE 29119-3 — Test Case Specification
**Application:** FoodMe storefront (`apps/web`), backend API (`apps/backend`), back office (`apps/admin`)
**Environment:** https://foodme-lianals.onrender.com (storefront) · https://foodme-lianals.onrender.com/backoffice (admin)
**Test basis:** [requirements.md](02-analysis/requirements.md) · **Design:** [03-design/](03-design/) · **Traceability:** [traceability-matrix.md](04-implementation/traceability-matrix.md)

**Test data:**
- Use a unique email for every new account, e.g. `qa-20261002-01@example.com`.
- Passwords must be 8–72 characters (e.g. `secret123`).
- Seeded admin account: `admin` / `admin123`.
- Seed values: delivery price 500 AMD, free delivery from 5000 AMD, 6 active chefs.
- The free Render instance may sleep. The first request after idle can take 1–3 minutes.

> TC-09 and TC-10 were blocked by **SCRUM-6** ("Simulated bug: Order processing failed!") until commit `0e50e00`. They pass after that fix.
> The SCRUM-6 line in `Checkout/index.tsx` is a course exercise and may be switched on again — then TC-09/TC-10 fail on purpose.

### Field legend

| Field | Meaning |
|---|---|
| Requirement | Test basis item (REQ-xx) — see the traceability matrix |
| Risk | Risk item (RSK-xx) — risk level drives priority and depth |
| Level | Component · Integration (API) · System · Acceptance (CTFL 2.2.1) |
| Technique | EP, BVA, DT (decision table), ST (state transition), EG (error guessing), Scenario, Checklist, Performance |
| Type | Positive / Negative · Functional / Non-functional |
| Automated? | Spec file and test title, or "No" |

## Summary

| ID | Title | Req. | Risk | Priority | Level | Technique | Type | Automated? |
|---|---|---|---|---|---|---|---|---|
| TC-01 | Explore page lists chefs and opens a chef page | REQ-01, REQ-02 | RSK-07 | High | System | Scenario | Positive | Yes |
| TC-02 | Non-existent chef URL shows "Chef not found" | REQ-02, REQ-06 | RSK-10 | Low | System | EP | Negative | Yes |
| TC-03 | Add a dish to the cart | REQ-03 | RSK-01 | High | System | EP | Positive | Yes |
| TC-04 | Increase and decrease dish quantity in the cart | REQ-04 | RSK-06 | High | System | BVA, ST | Positive | Yes |
| TC-05 | Remove a dish from the cart | REQ-04 | RSK-06 | Medium | System | ST | Positive | Yes |
| TC-06 | Cart persists after page reload | REQ-05 | RSK-11 | Medium | System | ST, EG | Positive | Yes (flaky on purpose) |
| TC-07 | Adding a dish from another chef asks to switch kitchens | REQ-06 | RSK-06 | Medium | System | ST, DT | Positive | Component only |
| TC-08 | Checkout with an empty cart | REQ-08 | RSK-05 | Medium | System | DT | Negative | Yes |
| TC-09 | Delivery checkout places an order | REQ-10, REQ-12 | RSK-03 | High | System | Scenario, DT | Positive | Yes |
| TC-10 | Takeaway checkout places an order without an address | REQ-09, REQ-10 | RSK-03 | High | System | DT | Positive | Yes |
| TC-11 | Checkout with empty required fields is blocked | REQ-09 | RSK-04 | High | System | DT, EP, BVA | Negative | Component only |
| TC-12 | Register a new customer account | REQ-13 | RSK-04 | High | System | Scenario | Positive | Yes |
| TC-13 | Registration with invalid or duplicate data is rejected | REQ-13 | RSK-04 | Medium | System | EP, BVA | Negative | Component + API |
| TC-14 | Customer login with a wrong password is rejected | REQ-14 | RSK-08 | High | System | EP | Negative | API |
| TC-15 | Back-office admin login (valid and wrong password) | REQ-15 | RSK-08 | High | System | EP | Positive / Negative | Yes |
| TC-16 | Registration field length boundaries (API) | REQ-13 | RSK-04 | Medium | Integration | BVA | Negative | Yes |
| TC-17 | Registration rejects an existing email in another case (API) | REQ-13 | RSK-04 | Medium | Integration | EP | Negative | Yes |
| TC-18 | Login error does not reveal whether the email exists (API) | REQ-14 | RSK-08 | High | Integration | EP | Negative | Yes |
| TC-19 | Free delivery at the threshold boundary | REQ-07 | RSK-02 | High | Integration | BVA | Positive | Yes (known defect) |
| TC-20 | Delivery price by delivery method | REQ-07 | RSK-02 | High | Integration | DT | Positive | Yes |
| TC-21 | Order total with quantity and additions | REQ-10 | RSK-01 | High | Integration | EP, EG | Positive | Yes (known defect) |
| TC-22 | Order with an invalid quantity is rejected | REQ-11 | RSK-01 | High | Integration | EP, BVA | Negative | Yes (known defect) |
| TC-23 | Order with a dish from another chef is rejected | REQ-11 | RSK-01 | High | Integration | EP, EG | Negative | Yes (known defect) |
| TC-24 | Order with a non-cash payment type is rejected | REQ-10 | RSK-01 | Medium | Integration | EP | Negative | Yes |
| TC-25 | Protected endpoints require the right token | REQ-08, REQ-NF-03 | RSK-08 | High | Integration | EP, EG | Negative | Yes |
| TC-26 | Explore API returns every active chef | REQ-01 | RSK-07 | Medium | Integration | BVA | Positive | Yes (known defect) |
| TC-27 | Admin order status — valid transitions | REQ-16 | RSK-09 | Medium | Integration | ST | Positive | Yes |
| TC-28 | Admin order status — invalid transitions are rejected | REQ-16 | RSK-09 | Medium | Integration | ST | Negative | Yes |
| TC-29 | Customer note is shown as plain text in the back office | REQ-17 | RSK-08 | High | System | EG | Negative | No |
| TC-30 | Checkout note length boundary (300 / 301) | REQ-09 | RSK-04 | Low | System | BVA | Negative | Component only |
| TC-31 | Order time in history matches the local time | REQ-12 | RSK-12 | Low | System | EG | Positive | No |
| TC-32 | Main pages have no critical/serious accessibility violations | REQ-NF-02 | RSK-14 | Medium | System | Checklist | Non-functional | Yes |
| TC-33 | Read API response time under load | REQ-NF-01 | RSK-13 | Medium | System | Performance | Non-functional | Yes (k6) |
| TC-34 | Unhandled server error is reported to GlitchTip | REQ-NF-04 | RSK-15 | Low | System integration | Scenario | Non-functional | No |

"Known defect" = the automated test is marked `test.fail()` / `@Disabled` because a logged defect makes it fail. When the defect is fixed, the test reports an unexpected pass → run confirmation testing and remove the marker.

---

## TC-01 — Explore page lists chefs and opens a chef page

- **Requirement:** REQ-01, REQ-02 · **Risk:** RSK-07 · **Priority:** High
- **Level:** System · **Technique:** Scenario · **Type:** Positive
- **Preconditions:** At least one active chef exists.
- **Steps:**
  1. Open the home page `/`.
  2. Click **Order now** (hero) or **Explore chefs** (header).
  3. Observe the Explore page.
  4. Click any chef card.
- **Expected result:**
  - Step 2: URL is `/explore` and the heading **Explore chefs** is visible.
  - Step 3: Chef cards show name, delivery time and delivery price. Every active chef is listed (6 in seed data). Inactive chefs are not listed.
  - Step 4: URL is `/chef/<id>`. Chef name, rating/status, delivery info and the menu grouped by category are visible.
- **Automated?** Yes. `storefront-flows.spec.ts` ("home CTA navigates to explore and header Explore chefs works", "chef page from home popular section"), `layout.spec.ts` ("Explore page layout"), `api/chefs.api.spec.ts` ("every active chef page loads").

## TC-02 — Non-existent chef URL shows "Chef not found"

- **Requirement:** REQ-02, REQ-06 · **Risk:** RSK-10 · **Priority:** Low
- **Level:** System · **Technique:** EP (existing / non-existing id) · **Type:** Negative
- **Preconditions:** The cart contains a dish from any chef.
- **Steps:**
  1. Open `/chef/999999` directly in the address bar.
- **Expected result:** The page shows **Chef not found**. The **Switch kitchens?** dialog does not appear. The page does not crash or stay blank.
- **Automated?** Yes. `storefront-flows.spec.ts` ("missing chef does not ask to clear another chef's cart"), `api/chefs.api.spec.ts` ("an unknown chef id returns 404").

## TC-03 — Add a dish to the cart

- **Requirement:** REQ-03 · **Risk:** RSK-01 · **Priority:** High
- **Level:** System · **Technique:** EP (with / without additions) · **Type:** Positive
- **Preconditions:** The cart is empty.
- **Steps:**
  1. Open a chef page from `/explore`.
  2. Click a dish card to open the dish modal.
  3. Click **Add to cart**.
- **Expected result:**
  - The cart panel (**Your order**) shows the dish with quantity 1 and its price.
  - The cart badge in the header shows `1`.
  - Subtotal equals the dish price. Delivery shows the chef's delivery price, or **Free** when the subtotal reaches the chef's "free from" amount. Total = Subtotal + Delivery.
  - The **Go to checkout** button is enabled.
- **Automated?** Yes. `flake-dish-modal.spec.ts`, `happy-path.spec.ts` ("dish modal additions raise cart line price"), `layout.spec.ts` ("cart and checkout item details stay aligned"), component: `useCart.test.ts`.

## TC-04 — Increase and decrease dish quantity in the cart

- **Requirement:** REQ-04 · **Risk:** RSK-06 · **Priority:** High
- **Level:** System · **Technique:** BVA (min, min + 1), ST-2 (C2–C4) · **Type:** Positive
- **Preconditions:** The cart contains 1 dish with quantity 1.
- **Steps:**
  1. In the cart panel click **+** (Increase quantity) twice.
  2. Click **−** (Decrease quantity) once.
  3. Click **−** until the quantity is 1, then click **−** once more.
- **Expected result:**
  - Step 1: Quantity is 3. Line price = unit price × 3. Subtotal, Total and header badge update.
  - Step 2: Quantity is 2 and prices recalculate. The item is not removed.
  - Step 3: The item is removed only when decreasing from quantity 1. The cart shows **Your cart is empty**.
- **Automated?** Yes. `cart-decrement.spec.ts`, `storefront-flows.spec.ts` ("cart quantity increase and remove item"), component: `useCart.test.ts`.

## TC-05 — Remove a dish from the cart

- **Requirement:** REQ-04 · **Risk:** RSK-06 · **Priority:** Medium
- **Level:** System · **Technique:** ST-2 (C5) · **Type:** Positive
- **Preconditions:** The cart contains at least one dish with quantity 2 or more.
- **Steps:**
  1. In the cart panel click the trash icon (**Remove item**) next to the dish.
- **Expected result:** The dish is removed regardless of quantity. If it was the only dish, the cart shows **Your cart is empty** and the header badge shows `0`.
- **Automated?** Yes. `storefront-flows.spec.ts` ("cart quantity increase and remove item"), component: `useCart.test.ts`.

## TC-06 — Cart persists after page reload

- **Requirement:** REQ-05 · **Risk:** RSK-11 · **Priority:** Medium
- **Level:** System · **Technique:** ST-2 (C6), EG · **Type:** Positive
- **Preconditions:** The cart is empty.
- **Steps:**
  1. Add a dish to the cart and set the quantity to 2.
  2. Reload the page (F5).
  3. Close the tab, open the site again in the same browser.
- **Expected result:** After steps 2 and 3 the cart still contains the same dish, quantity 2 and the same total.
- **Automated?** Yes. `flake-cart-persistence.spec.ts`. That test is flaky on purpose, so a failure there does not prove a product bug.

## TC-07 — Adding a dish from another chef asks to switch kitchens

- **Requirement:** REQ-06 · **Risk:** RSK-06 · **Priority:** Medium
- **Level:** System · **Technique:** ST-2 (C7–C9), DT-4 · **Type:** Positive
- **Preconditions:** The cart contains a dish from Chef A.
- **Steps:**
  1. Open the page of a different chef (Chef B).
  2. Open a dish and click **Add to cart**.
  3. In the dialog click **Keep cart & browse**.
  4. Repeat step 2, then click **Clear & continue**.
- **Expected result:**
  - Step 2: The **Switch kitchens?** dialog appears with the text "Your cart has items from another chef. Adding this dish clears that order."
  - Step 3: The dialog closes. The cart still contains only Chef A's dish.
  - Step 4: Chef A's items are removed. The cart contains only the Chef B dish with quantity 1.
- **Automated?** Component level only: `useCart.test.ts` ("C7/C8", "C9"). No E2E yet.

## TC-08 — Checkout with an empty cart

- **Requirement:** REQ-08 · **Risk:** RSK-05 · **Priority:** Medium
- **Level:** System · **Technique:** DT-3 (R1) · **Type:** Negative
- **Preconditions:** The cart is empty.
- **Steps:**
  1. Open `/checkout` directly.
- **Expected result:** The page shows **Nothing to check out** and **Your cart is empty. Browse chefs and add something delicious.** The checkout form and the **Place order** button are not shown, and no order can be placed.
- **Automated?** Yes. `storefront-flows.spec.ts` ("empty checkout shows browse message").

## TC-09 — Delivery checkout places an order

- **Requirement:** REQ-10, REQ-12 · **Risk:** RSK-03 · **Priority:** High
- **Level:** System / Acceptance · **Technique:** Scenario, DT-2 (R1), DT-3 (R2, R3) · **Type:** Positive
- **Preconditions:** The cart contains at least one dish. The user is signed in, or creates an account on the checkout page.
- **Steps:**
  1. Click **Go to checkout**.
  2. If not signed in, open **Create account**, fill it in and submit.
  3. Select **Delivery** (To your door).
  4. Fill in Full name, Phone, Email, City `Yerevan`, Street `Tumanyan`, Building `10`, Apartment `5`.
  5. Click **Place order**.
  6. Click **Track order**.
  7. Click **All orders**.
- **Expected result:**
  - Step 3: City, Street, Building and Apartment fields are shown.
  - Step 5: URL is `/orders/success`. The page shows **Order placed!**, "Your order number is FM-…", and the **Track order** and **Back to explore** links. No error appears in the browser console. The cart is empty.
  - Step 6: URL is `/tracking/FM-<number>`.
  - Step 7: URL is `/orders` and the new order number is listed first.
- **Automated?** Yes. `happy-path.spec.ts` ("explore -> chef -> add 2 dishes -> cart total -> cash checkout -> success"), `storefront-flows.spec.ts` ("full delivery checkout shows order number and track link").

## TC-10 — Takeaway checkout places an order without an address

- **Requirement:** REQ-09, REQ-10 · **Risk:** RSK-03 · **Priority:** High
- **Level:** System · **Technique:** DT-2 (R5) · **Type:** Positive
- **Preconditions:** The cart contains at least one dish. The user is signed in on the checkout page.
- **Steps:**
  1. On `/checkout` select **Delivery**, then select **Takeaway** (Pick up).
  2. Fill in Full name, Phone and Email only.
  3. Click **Place order**.
- **Expected result:**
  - Step 1: City and Street fields are shown for Delivery and hidden for Takeaway.
  - Step 3: The order is placed without an address. **Order placed!** is shown with an order number. Delivery price is 0.
- **Automated?** Yes. `happy-path.spec.ts` ("takeaway checkout succeeds without address"), `storefront-flows.spec.ts` ("delivery shows address fields; takeaway hides them").

## TC-11 — Checkout with empty required fields is blocked

- **Requirement:** REQ-09 · **Risk:** RSK-04 · **Priority:** High
- **Level:** System · **Technique:** DT-2 (R2–R5), EP + BVA (ep-bva.md §3), EG-03 · **Type:** Negative
- **Preconditions:** The cart contains at least one dish. The user is signed in on the checkout page.
- **Steps:**
  1. Select **Delivery**.
  2. Clear Full name, Phone, Email, City and Street. Leave them empty.
  3. Click **Place order**.
  4. Enter Full name `A` (1 character), Phone `1234567` (7 characters), Email `abc` (no @), City `   ` (spaces only). Click **Place order**.
  5. Switch to **Takeaway**, fill valid name/phone/email and leave City/Street empty. Click **Place order**.
- **Expected result:**
  - Steps 3–4: The order is not submitted and the URL stays `/checkout`. Field errors are shown: **Enter your name**, **Enter a valid phone number**, **Enter a valid email**, **City is required**, **Street is required**.
  - Step 5: City/Street are not required for Takeaway, and the order is placed.
- **Automated?** Component level: `checkout-schema.test.ts` (all DT-2 rules and boundaries). No E2E yet.

## TC-12 — Register a new customer account

- **Requirement:** REQ-13 · **Risk:** RSK-04 · **Priority:** High
- **Level:** System · **Technique:** Scenario · **Type:** Positive
- **Preconditions:** The user is signed out. The email has never been registered.
- **Steps:**
  1. Click **Sign in** in the header.
  2. Open the **Create account** tab.
  3. Fill in Full name, a unique Email, Phone `+37491111000` and Password `secret123`.
  4. Click **Create account**.
- **Expected result:** The user is redirected to `/orders`. The heading **Your orders** and the text **No orders yet** are visible. The header shows that the user is signed in.
- **Automated?** Yes. `storefront-flows.spec.ts` ("register from header opens orders history").

## TC-13 — Registration with invalid or duplicate data is rejected

- **Requirement:** REQ-13 · **Risk:** RSK-04 · **Priority:** Medium
- **Level:** System · **Technique:** EP (email partitions E2–E7), BVA (password 7) · **Type:** Negative
- **Preconditions:** The user is signed out. An account with email `X` already exists (for example from TC-12).
- **Steps:**
  1. Open **Sign in → Create account**.
  2. Submit the form with all fields empty.
  3. Enter Email `test@` and Password `1234567` (7 characters). Submit.
  4. Fill in valid data but use the already-registered email `X`. Submit.
- **Expected result:**
  - Step 2: The account is not created. Errors are shown: **Enter your name**, **Enter a valid email**, **Enter a valid phone number**, **Password must be at least 8 characters**.
  - Step 3: **Enter a valid email** and **Password must be at least 8 characters** are shown.
  - Step 4: The account is not created and the message **Email already registered** is shown. The user stays signed out.
- **Automated?** Component: `auth-schema.test.ts`. API: `api/auth.api.spec.ts` (TC-16, TC-17), `CustomerAuthControllerTest.java`. No UI test yet.

## TC-14 — Customer login with a wrong password is rejected

- **Requirement:** REQ-14 · **Risk:** RSK-08 · **Priority:** High
- **Level:** System · **Technique:** EP (L1–L4) · **Type:** Negative
- **Preconditions:** A registered customer account exists (email `X`, password `secret123`). The user is signed out.
- **Steps:**
  1. Open `/login` (**Sign in** tab).
  2. Enter Email `X` and Password `wrongpass1`. Click **Sign in**.
  3. Enter an unregistered email and any 8-character password. Click **Sign in**.
  4. Leave both fields empty. Click **Sign in**.
- **Expected result:**
  - Steps 2–3: The user is not signed in and the message **Invalid email or password** is shown. The message is the same in both cases, so it does not reveal whether the email exists.
  - Step 4: Field validation errors are shown (**Enter a valid email**, **Password must be at least 8 characters**). No request is sent.
- **Automated?** API: `api/auth.api.spec.ts` (TC-18), component: `auth-schema.test.ts`. No UI test yet.

## TC-15 — Back-office admin login (valid and wrong password)

- **Requirement:** REQ-15 · **Risk:** RSK-08 · **Priority:** High
- **Level:** System · **Technique:** EP · **Type:** Positive / Negative
- **Preconditions:** The seeded admin account `admin` / `admin123` exists.
- **Steps:**
  1. Open `/backoffice`. The login page with the heading **FoodMe Admin** is shown.
  2. Enter Username `admin`, Password `wrong`. Click **Sign in**.
  3. Enter Username `admin`, Password `admin123`. Click **Sign in**.
  4. Open **Orders** from the sidebar.
- **Expected result:**
  - Step 2: The admin stays on the login page and sees **Invalid username or password.**
  - Step 3: The back office opens. The sidebar menu shows **Orders**, **Chefs** and **Dishes**.
  - Step 4: The orders list loads and includes orders placed from the storefront (e.g. from TC-09).
- **Automated?** Yes. `apps/admin/e2e/admin-flows.spec.ts` ("rejects bad password", "logs in with seeded credentials", "orders list shows rows after API order"), `happy-path.spec.ts` ("admin can login and list orders after a storefront checkout").

---

## TC-16 — Registration field length boundaries (API)

- **Requirement:** REQ-13 · **Risk:** RSK-04 · **Priority:** Medium
- **Level:** Integration (API) · **Technique:** 2-value BVA ([ep-bva.md](03-design/ep-bva.md) §1.1–1.3) · **Type:** Negative / Positive
- **Preconditions:** None. Each request uses a new unique email.
- **Steps:** Send `POST /api/auth/register` with valid data, changing one field at a time to each boundary value:

  | Field | Values |
  |---|---|
  | password | 7, 8, 72, 73 characters |
  | fullName | 1, 2, 120, 121 characters |
  | phoneNumber | 7, 8, 32, 33 characters |
- **Expected result:** Values inside the range (8, 72 · 2, 120 · 8, 32) → `200` with a token. Values outside (7, 73 · 1, 121 · 7, 33) → `400`, no account created.
- **Automated?** Yes. `api/auth.api.spec.ts` ("Registration API — field boundaries", 12 tests).

## TC-17 — Registration rejects an existing email in another letter case (API)

- **Requirement:** REQ-13 · **Risk:** RSK-04 · **Priority:** Medium
- **Level:** Integration (API) · **Technique:** EP (E4, E5, E6) · **Type:** Negative
- **Preconditions:** An account with email `X` (lower case) exists.
- **Steps:**
  1. Register again with `X`.
  2. Register with `X` in upper case.
  3. Register with `" " + X + " "`.
- **Expected result:** Steps 1–2: `400` "Email already registered". Step 3: `400` (invalid format). No duplicate account is created.
- **Automated?** Yes. `api/auth.api.spec.ts` ("registration rejects an existing email in another letter case").

## TC-18 — Login error does not reveal whether the email exists (API)

- **Requirement:** REQ-14 · **Risk:** RSK-08 · **Priority:** High
- **Level:** Integration (API) · **Technique:** EP (L1–L3) · **Type:** Negative
- **Preconditions:** Account `X` / `secret123` exists.
- **Steps:**
  1. `POST /api/auth/login` with `X` / `secret123`.
  2. `X` / `wrongpass1`.
  3. Unregistered email / `wrongpass1`.
- **Expected result:** Step 1: `200` with a token. Steps 2 and 3: `400` with the identical message "Invalid email or password".
- **Automated?** Yes. `api/auth.api.spec.ts` ("login error is the same for a wrong password and an unknown email").

## TC-19 — Free delivery at the threshold boundary

- **Requirement:** REQ-07 · **Risk:** RSK-02 · **Priority:** High
- **Level:** Integration (API) + System · **Technique:** 2-value BVA ([ep-bva.md](03-design/ep-bva.md) §4), DT-1 R1/R2 · **Type:** Positive
- **Preconditions:** Chef with delivery price 500 and free delivery from 5000.
- **Steps:**
  1. `POST /api/order/delivery-price` with `deliveryMethod: DELIVERY` and subtotal 4999.
  2. Repeat with subtotal 5000.
  3. Repeat with subtotal 5001.
  4. UI: build a cart with subtotal exactly 5000 AMD (e.g. Bento cake, Chef Verona) and open the cart panel.
- **Expected result:** Step 1: `deliveryPrice` 500. Steps 2–3: `deliveryPrice` 0. Step 4: Delivery shows **Free**, Total = 5000 AMD.
- **Automated?** Yes. `api/delivery-price.api.spec.ts`; component: `OrderServiceDeliveryPriceTest.java`. **Known defect FM-BUG-03:** step 2 returns 500 (the threshold is compared with `>`). The step-2 tests are marked `test.fail()` / `@Disabled`.

## TC-20 — Delivery price by delivery method

- **Requirement:** REQ-07 · **Risk:** RSK-02 · **Priority:** High
- **Level:** Integration (API) · **Technique:** DT-1 (R1–R3) · **Type:** Positive
- **Preconditions:** As TC-19.
- **Steps:** `POST /api/order/delivery-price` for: DELIVERY + 4999; DELIVERY + 5001; TAKEAWAY + 1000; TAKEAWAY + 6000.
- **Expected result:** 500; 0; 0; 0.
- **Automated?** Yes. `api/delivery-price.api.spec.ts` ("DT-1 R1", "DT-1 R2", "DT-1 R3").

## TC-21 — Order total with quantity and additions

- **Requirement:** REQ-10 · **Risk:** RSK-01 · **Priority:** High
- **Level:** Integration (API) + System · **Technique:** EP (with / without additions), EG-05, EG-06 · **Type:** Positive
- **Preconditions:** Signed-in customer. A dish without additions (price `P`) and a dish with an addition (price `D`, addition `A`).
- **Steps:**
  1. Place a TAKEAWAY order: dish without additions, quantity 3.
  2. Place a TAKEAWAY order: dish with addition `A` selected, quantity 2.
  3. UI: Alans Kitchen → "Pho Bo soup with beef" × 2 → checkout.
- **Expected result:** Step 1: total = `P × 3`, status `NEW`, number `FM-<digits>`. Step 2: total = `(D + A) × 2`. Step 3: cart, checkout summary and order total = unit price × 2.
- **Automated?** Yes. `api/orders.api.spec.ts`, `alans-kitchen-soup-order.spec.ts`. **Known defect FM-BUG-01:** step 2 returns `D × 2 + A` (additions are not multiplied by quantity) — marked `test.fail()`.

## TC-22 — Order with an invalid quantity is rejected

- **Requirement:** REQ-11 · **Risk:** RSK-01 · **Priority:** High
- **Level:** Integration (API) · **Technique:** EP (Q1–Q3), BVA (0 / 1) · **Type:** Negative
- **Preconditions:** Signed-in customer (token).
- **Steps:** `POST /api/order` with one dish and `quantity` = `0`, then `-1`, then `null`.
- **Expected result:** `400` each time; no order is created.
- **Automated?** Yes. `api/orders.api.spec.ts`. **Known defect FM-BUG-04:** the quantity is not validated — `0` creates an order with total 0, `−1` creates an order with a **negative** total (e.g. −3500 AMD), `null` causes 500. Marked `test.fail()`.

## TC-23 — Order with a dish from another chef is rejected

- **Requirement:** REQ-11 · **Risk:** RSK-01 · **Priority:** High
- **Level:** Integration (API) · **Technique:** EP, EG-08 · **Type:** Negative
- **Preconditions:** Signed-in customer. Chef A and chef B each have a dish.
- **Steps:**
  1. `POST /api/order` with `chefId` = A and a dish of chef B.
  2. `POST /api/order` with `dishId` 999999.
- **Expected result:** Step 1: `400`. Step 2: `404`.
- **Automated?** Yes. `api/orders.api.spec.ts`. **Known defect FM-BUG-05:** step 1 creates the order — marked `test.fail()`.

## TC-24 — Order with a non-cash payment type is rejected

- **Requirement:** REQ-10 (AC-10.6) · **Risk:** RSK-01 · **Priority:** Medium
- **Level:** Integration (API) · **Technique:** EP · **Type:** Negative
- **Steps:** `POST /api/order` with `paymentType: CARD`.
- **Expected result:** `400` "Only CASH payment is supported".
- **Automated?** Yes. `api/orders.api.spec.ts`; `OrderControllerTest.java`.

## TC-25 — Protected endpoints require the right token

- **Requirement:** REQ-08, REQ-NF-03 · **Risk:** RSK-08 · **Priority:** High
- **Level:** Integration (API) · **Technique:** EP (no token / customer token / admin token), EG-14, EG-16 · **Type:** Negative
- **Steps:**
  1. Without a token call `POST /api/order`, `GET /api/customer/me`, `GET /api/customer/orders`, `GET /admin/order`, `GET /admin/chef`.
  2. With a **customer** token call `GET /admin/order`.
  3. Call `GET /api/chef/99999` and inspect the error body.
- **Expected result:** Step 1: `401` for every call. Step 2: `401` or `403`. Step 3: `404`, message "Chef 99999 not found", no stack trace.
- **Automated?** Yes. `api/access-control.api.spec.ts`. **Found 2026-10-05:** step 2 returns `200` — a customer can read all orders in the back-office API (not yet in Jira).

## TC-26 — Explore API returns every active chef

- **Requirement:** REQ-01 (AC-01.4) · **Risk:** RSK-07 · **Priority:** Medium
- **Level:** Integration (API) · **Technique:** BVA on page size ([ep-bva.md](03-design/ep-bva.md) §7) · **Type:** Positive
- **Steps:** Read `count` from `GET /api/chef/active`. Page through the list with page size 1, `count − 1`, `count` and 12.
- **Expected result:** For every page size, the number of chefs over all pages = `count`.
- **Automated?** Yes. `api/chefs.api.spec.ts`. **Known defect FM-BUG-02:** the last chef of the last page is dropped (5 of 6) — marked `test.fail()`.

## TC-27 — Admin order status — valid transitions

- **Requirement:** REQ-16 · **Risk:** RSK-09 · **Priority:** Medium
- **Level:** Integration (API) + Component · **Technique:** ST-1, valid transitions coverage (sequences S1–S3) · **Type:** Positive
- **Preconditions:** A new order (status `NEW`) created for this test. Admin token.
- **Steps:**
  1. S1: `PATCH /admin/order/{id}/status` → ACCEPTED, then → DELIVERED.
  2. S2: new order → REJECTED (with reason).
  3. S3: new order → ACCEPTED → REJECTED.
- **Expected result:** Every call returns `200` and the new status.
- **Automated?** Yes. `api/admin-order-status.api.spec.ts`; component: `AdminOrderServiceTransitionTest.java` (all 16 cells). Manual UI check: `admin-flows.spec.ts` ("order show + mark ACCEPTED").

## TC-28 — Admin order status — invalid transitions are rejected

- **Requirement:** REQ-16 · **Risk:** RSK-09 · **Priority:** Medium
- **Level:** Integration (API) + Component · **Technique:** ST-1, all transitions coverage · **Type:** Negative
- **Steps:**
  1. NEW → DELIVERED.
  2. DELIVERED → REJECTED (after S1).
  3. REJECTED → ACCEPTED (after S2).
- **Expected result:** `400` "Cannot transition order from X to Y" and the status does not change.
- **Automated?** Yes. `api/admin-order-status.api.spec.ts`; `AdminOrderServiceTransitionTest.java`.

## TC-29 — Customer note is shown as plain text in the back office

- **Requirement:** REQ-17 · **Risk:** RSK-08 · **Priority:** High
- **Level:** System · **Technique:** EG-13 (XSS) · **Type:** Negative (security)
- **Preconditions:** Signed-in customer with a dish in the cart. Back-office access.
- **Test data:** Note = `<b>bold</b> <img src=x onerror="document.title='XSS'">`
- **Steps:**
  1. Place a TAKEAWAY order with the note above.
  2. Sign in to `/backoffice`, open **Orders** and open the new order.
- **Expected result:** The note is shown literally as text, including `<b>` and `<img …>`. Nothing is bold, no image is requested, the page title does not change.
- **Automated?** No. Use a harmless payload only; never test with real cookies or external URLs.

## TC-30 — Checkout note length boundary (300 / 301)

- **Requirement:** REQ-09 · **Risk:** RSK-04 · **Priority:** Low
- **Level:** System · **Technique:** 2-value BVA · **Type:** Negative
- **Steps:**
  1. On a valid checkout form enter a Note of exactly 300 characters and click **Place order**.
  2. Repeat with 301 characters.
- **Expected result:** Step 1: order placed. Step 2: the input stops at 300 characters or a visible message explains the limit **[Assumption]**.
- **Automated?** Component only: `checkout-schema.test.ts`. **Observation 2026-10-05:** with 301 characters the form does not submit and shows no message.

## TC-31 — Order time in history matches the local time

- **Requirement:** REQ-12 (AC-12.3) · **Risk:** RSK-12 · **Priority:** Low
- **Level:** System · **Technique:** EG-12 (time zones) · **Type:** Positive
- **Steps:**
  1. Note the current local time (Asia/Yerevan, UTC+4).
  2. Place an order, open `/orders` and the back-office order page.
- **Expected result:** The shown creation time differs from the noted time by at most 1–2 minutes in both places.
- **Automated?** No.

## TC-32 — Main pages have no critical/serious accessibility violations

- **Requirement:** REQ-NF-02 · **Risk:** RSK-14 · **Priority:** Medium
- **Level:** System · **Technique:** Checklist-based ([accessibility-checklist.md](03-design/checklists/accessibility-checklist.md)), tool-supported · **Type:** Non-functional
- **Steps:** Run axe-core (WCAG 2.1 A/AA) on home, explore, chef, checkout (empty) and login. Then do the manual items A11Y-02 … A11Y-11.
- **Expected result:** No violations with impact *critical* or *serious*.
- **Automated?** Yes. `a11y.spec.ts` (`npm run test:a11y`). **Found 2026-10-05:** `color-contrast` (serious) on all 5 pages.

## TC-33 — Read API response time under load

- **Requirement:** REQ-NF-01 · **Risk:** RSK-13 · **Priority:** Medium
- **Level:** System · **Technique:** Performance (load) test · **Type:** Non-functional
- **Steps:** Wake the app, then run `k6 run qa/performance/k6-read-api.js` (10 virtual users, 1 min 45 s).
- **Expected result:** `http_req_duration` p95 < 2000 ms and `http_req_failed` < 1%.
- **Automated?** Yes (k6, manual trigger). **Result 2026-10-05:** p95 = 4.77 s, error rate 9.24% (all errors are `GET /api/chef/32` → 500).

## TC-34 — Unhandled server error is reported to GlitchTip

- **Requirement:** REQ-NF-04 · **Risk:** RSK-15 · **Priority:** Low
- **Level:** System integration · **Technique:** Scenario · **Type:** Non-functional
- **Steps:**
  1. Call `GET /api/debug/boom`.
  2. Open GlitchTip and find the event.
- **Expected result:** Step 1: `500`. Step 2: an event "Boom! This is a test exception for the error tracker." appears within 1 minute with the request URL.
- **Automated?** No.

---

**Candidates for E2E automation:** TC-07, TC-11, TC-13 (UI), TC-14 (UI), TC-29, TC-30.
