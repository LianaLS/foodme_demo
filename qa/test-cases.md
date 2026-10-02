# FoodMe — Manual Test Cases

**Application:** FoodMe storefront (`apps/web`), backend API (`apps/backend`), back office (`apps/admin`)
**Environment:** https://foodme-lianals.onrender.com (storefront) · https://foodme-lianals.onrender.com/backoffice (admin)
**Test data:**
- Use a unique email for every new account, e.g. `qa-20261002-01@example.com`.
- Passwords must be at least 8 characters (e.g. `secret123`).
- Seeded admin account: `admin` / `admin123`.
- The free Render instance may sleep. The first request after idle can take 1–3 minutes.

> TC-09 and TC-10 were blocked by **SCRUM-6** ("Simulated bug: Order processing failed!") until commit `0e50e00`. They pass after that fix.

## Summary

| ID | Title | Priority | Type | Already automated? |
|---|---|---|---|---|
| TC-01 | Explore page lists chefs and opens a chef page | High | Positive | Yes |
| TC-02 | Non-existent chef URL shows "Chef not found" | Low | Negative | Yes |
| TC-03 | Add a dish to the cart | High | Positive | Yes |
| TC-04 | Increase and decrease dish quantity in the cart | High | Positive | Yes |
| TC-05 | Remove a dish from the cart | Medium | Positive | Yes |
| TC-06 | Cart persists after page reload | Medium | Positive | Yes (flaky on purpose) |
| TC-07 | Adding a dish from another chef asks to switch kitchens | Medium | Positive | No |
| TC-08 | Checkout with an empty cart | Medium | Negative | Yes |
| TC-09 | Delivery checkout places an order | High | Positive | Yes |
| TC-10 | Takeaway checkout places an order without an address | High | Positive | Yes |
| TC-11 | Checkout with empty required fields is blocked | High | Negative | No |
| TC-12 | Register a new customer account | High | Positive | Yes |
| TC-13 | Registration with invalid or duplicate data is rejected | Medium | Negative | No |
| TC-14 | Customer login with a wrong password is rejected | High | Negative | No |
| TC-15 | Back-office admin login (valid and wrong password) | High | Positive / Negative | Yes |

---

## TC-01 — Explore page lists chefs and opens a chef page

- **Priority:** High
- **Type:** Positive
- **Preconditions:** At least one active chef exists.
- **Steps:**
  1. Open the home page `/`.
  2. Click **Order now** (hero) or **Explore chefs** (header).
  3. Observe the Explore page.
  4. Click any chef card.
- **Expected result:**
  - Step 2: URL is `/explore` and the heading **Explore chefs** is visible.
  - Step 3: Chef cards show name, delivery time and delivery price. Inactive chefs are not listed.
  - Step 4: URL is `/chef/<id>`. Chef name, rating/status, delivery info and the menu grouped by category are visible.
- **Already automated?** Yes. `storefront-flows.spec.ts` ("home CTA navigates to explore and header Explore chefs works", "chef page from home popular section") and `layout.spec.ts` ("Explore page layout").

## TC-02 — Non-existent chef URL shows "Chef not found"

- **Priority:** Low
- **Type:** Negative
- **Preconditions:** The cart contains a dish from any chef.
- **Steps:**
  1. Open `/chef/999999` directly in the address bar.
- **Expected result:** The page shows **Chef not found**. The **Switch kitchens?** dialog does not appear. The page does not crash or stay blank.
- **Already automated?** Yes. `storefront-flows.spec.ts` ("missing chef does not ask to clear another chef's cart").

## TC-03 — Add a dish to the cart

- **Priority:** High
- **Type:** Positive
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
- **Already automated?** Yes. `flake-dish-modal.spec.ts`, `happy-path.spec.ts` ("dish modal additions raise cart line price").

## TC-04 — Increase and decrease dish quantity in the cart

- **Priority:** High
- **Type:** Positive
- **Preconditions:** The cart contains 1 dish with quantity 1.
- **Steps:**
  1. In the cart panel click **+** (Increase quantity) twice.
  2. Click **−** (Decrease quantity) once.
  3. Click **−** until the quantity is 1, then click **−** once more.
- **Expected result:**
  - Step 1: Quantity is 3. Line price = unit price × 3. Subtotal, Total and header badge update.
  - Step 2: Quantity is 2 and prices recalculate. The item is not removed.
  - Step 3: The item is removed only when decreasing from quantity 1. The cart shows **Your cart is empty**.
- **Already automated?** Yes. `cart-decrement.spec.ts`, `storefront-flows.spec.ts` ("cart quantity increase and remove item").

## TC-05 — Remove a dish from the cart

- **Priority:** Medium
- **Type:** Positive
- **Preconditions:** The cart contains at least one dish with quantity 2 or more.
- **Steps:**
  1. In the cart panel click the trash icon (**Remove item**) next to the dish.
- **Expected result:** The dish is removed regardless of quantity. If it was the only dish, the cart shows **Your cart is empty** and the header badge shows `0`.
- **Already automated?** Yes. `storefront-flows.spec.ts` ("cart quantity increase and remove item").

## TC-06 — Cart persists after page reload

- **Priority:** Medium
- **Type:** Positive
- **Preconditions:** The cart is empty.
- **Steps:**
  1. Add a dish to the cart and set the quantity to 2.
  2. Reload the page (F5).
  3. Close the tab, open the site again in the same browser.
- **Expected result:** After steps 2 and 3 the cart still contains the same dish, quantity 2 and the same total.
- **Already automated?** Yes. `flake-cart-persistence.spec.ts`. That test is flaky on purpose, so a failure there does not prove a product bug.

## TC-07 — Adding a dish from another chef asks to switch kitchens

- **Priority:** Medium
- **Type:** Positive
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
- **Already automated?** No.

## TC-08 — Checkout with an empty cart

- **Priority:** Medium
- **Type:** Negative
- **Preconditions:** The cart is empty.
- **Steps:**
  1. Open `/checkout` directly.
- **Expected result:** The page shows **Your cart is empty. Browse chefs and add something delicious.** The checkout form and the **Place order** button are not shown, and no order can be placed.
- **Already automated?** Yes. `storefront-flows.spec.ts` ("empty checkout shows browse message").

## TC-09 — Delivery checkout places an order

- **Priority:** High
- **Type:** Positive
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
  - Step 5: URL is `/orders/success`. The page shows **Order placed!**, "Your order number is FM-…", and the **Track order** and **Back to explore** links. No error appears in the browser console.
  - Step 6: URL is `/tracking/FM-<number>`.
  - Step 7: URL is `/orders` and the new order number is listed.
- **Already automated?** Yes. `happy-path.spec.ts` ("explore -> chef -> add 2 dishes -> cart total -> cash checkout -> success"), `storefront-flows.spec.ts` ("full delivery checkout shows order number and track link").

## TC-10 — Takeaway checkout places an order without an address

- **Priority:** High
- **Type:** Positive
- **Preconditions:** The cart contains at least one dish. The user is signed in on the checkout page.
- **Steps:**
  1. On `/checkout` select **Delivery**, then select **Takeaway** (Pick up).
  2. Fill in Full name, Phone and Email only.
  3. Click **Place order**.
- **Expected result:**
  - Step 1: City and Street fields are shown for Delivery and hidden for Takeaway.
  - Step 3: The order is placed without an address. **Order placed!** is shown with an order number.
- **Already automated?** Yes. `happy-path.spec.ts` ("takeaway checkout succeeds without address"), `storefront-flows.spec.ts` ("delivery shows address fields; takeaway hides them").

## TC-11 — Checkout with empty required fields is blocked

- **Priority:** High
- **Type:** Negative
- **Preconditions:** The cart contains at least one dish. The user is signed in on the checkout page.
- **Steps:**
  1. Select **Delivery**.
  2. Clear Full name, Phone, Email, City and Street. Leave them empty.
  3. Click **Place order**.
  4. Enter Full name `A` (1 character), Phone `123` (fewer than 8 characters), Email `abc` (no @). Click **Place order**.
  5. Switch to **Takeaway**, fill valid name/phone/email and leave City/Street empty. Click **Place order**.
- **Expected result:**
  - Steps 3–4: The order is not submitted and the URL stays `/checkout`. Field errors are shown: **Enter your name**, **Enter a valid phone number**, **Enter a valid email**, **City is required**, **Street is required**.
  - Step 5: City/Street are not required for Takeaway, and the order is placed.
- **Already automated?** No.

## TC-12 — Register a new customer account

- **Priority:** High
- **Type:** Positive
- **Preconditions:** The user is signed out. The email has never been registered.
- **Steps:**
  1. Click **Sign in** in the header.
  2. Open the **Create account** tab.
  3. Fill in Full name, a unique Email, Phone `+37491111000` and Password `secret123`.
  4. Click **Create account**.
- **Expected result:** The user is redirected to `/orders`. The heading **Your orders** and the text **No orders yet** are visible. The header shows that the user is signed in.
- **Already automated?** Yes. `storefront-flows.spec.ts` ("register from header opens orders history").

## TC-13 — Registration with invalid or duplicate data is rejected

- **Priority:** Medium
- **Type:** Negative
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
- **Already automated?** No (UI). The API is covered by `CustomerAuthControllerTest.java` (backend unit test).

## TC-14 — Customer login with a wrong password is rejected

- **Priority:** High
- **Type:** Negative
- **Preconditions:** A registered customer account exists (email `X`, password `secret123`). The user is signed out.
- **Steps:**
  1. Open `/login` (**Sign in** tab).
  2. Enter Email `X` and Password `wrongpass1`. Click **Sign in**.
  3. Enter an unregistered email and any 8-character password. Click **Sign in**.
  4. Leave both fields empty. Click **Sign in**.
- **Expected result:**
  - Steps 2–3: The user is not signed in and the message **Invalid email or password** is shown. The message is the same in both cases, so it does not reveal whether the email exists.
  - Step 4: Field validation errors are shown (**Enter a valid email**, **Password must be at least 8 characters**). No request is sent.
- **Already automated?** No (UI). The API is covered by `CustomerAuthControllerTest.java` (backend unit test).

## TC-15 — Back-office admin login (valid and wrong password)

- **Priority:** High
- **Type:** Positive / Negative
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
- **Already automated?** Yes. `apps/admin/e2e/admin-flows.spec.ts` ("rejects bad password", "logs in with seeded credentials", "orders list shows rows after API order"), `happy-path.spec.ts` ("admin can login and list orders after a storefront checkout").

---

**Candidates for automation:** TC-07, TC-11, TC-13, TC-14. These have no end-to-end tests yet.
