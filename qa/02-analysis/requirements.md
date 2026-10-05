# FoodMe — Requirements (Test Basis)

**ISTQB:** CTFL 1.4.2 (test analysis), 4.5 (collaboration-based test approaches: user stories, acceptance criteria)
**Document type:** Test basis
**Version:** 1.0 · 2026-10-05 · Author: QA

## About this document

FoodMe has no written specification. This document is a **reconstructed test
basis**: user stories and acceptance criteria derived from the running
application, the source code (validation annotations, schemas), the seed data
and common domain knowledge of food-ordering apps.

Where the code and the expected behavior disagree, the acceptance criterion
describes the **expected** behavior. Such points are marked **[Assumption]** and
must be confirmed by the product owner (static testing: review of the test
basis, CTFL 3.2).

Acceptance criteria use the **Given / When / Then** format (CTFL 4.5.2).

**Seed data used in examples:** 6 active chefs; every chef has delivery price
**500 AMD** and free delivery from **5000 AMD**.

---

## Summary

| ID | Title | Area | Priority |
|---|---|---|---|
| REQ-01 | Browse active chefs | Storefront | High |
| REQ-02 | View a chef page and menu | Storefront | High |
| REQ-03 | Add a dish to the cart | Cart | High |
| REQ-04 | Change quantity and remove items | Cart | High |
| REQ-05 | Cart persists in the browser | Cart | Medium |
| REQ-06 | Cart holds dishes from one chef only | Cart | Medium |
| REQ-07 | Delivery price and free delivery | Checkout | High |
| REQ-08 | Checkout requires an account | Checkout | High |
| REQ-09 | Checkout form validation | Checkout | High |
| REQ-10 | Place an order | Checkout / Orders API | High |
| REQ-11 | Order content validation | Orders API | High |
| REQ-12 | Order history and tracking | Orders | Medium |
| REQ-13 | Customer registration | Auth | High |
| REQ-14 | Customer login | Auth | High |
| REQ-15 | Back-office admin login | Back office | High |
| REQ-16 | Admin order status workflow | Back office | High |
| REQ-17 | Admin views order details safely | Back office | High |
| REQ-18 | Admin manages chefs and dishes | Back office | Medium |
| REQ-NF-01 | Performance — response time | Non-functional | Medium |
| REQ-NF-02 | Accessibility | Non-functional | Medium |
| REQ-NF-03 | Security — access control | Non-functional | High |
| REQ-NF-04 | Observability — errors are reported | Non-functional | Low |
| REQ-NF-05 | Responsive layout | Non-functional | Medium |

---

## Functional requirements

### REQ-01 — Browse active chefs

**As a** customer **I want** to see all available chefs **so that** I can choose where to order.

- **AC-01.1** Given there are active chefs, when I open `/explore`, then I see a card for **every** chef with status `ACTIVE`.
- **AC-01.2** Given a chef is not `ACTIVE`, when I open `/explore`, then that chef is not listed.
- **AC-01.3** Each card shows the chef name, delivery time and delivery price.
- **AC-01.4** API: `GET /api/chef/active?page=&size=` returns a list and `count`. The number of items over all pages equals `count`.

### REQ-02 — View a chef page and menu

**As a** customer **I want** to open a chef page **so that** I can see their menu.

- **AC-02.1** Given I click a chef card, then I land on `/chef/<id>` with the chef name, status/rating, delivery info and the menu grouped by category.
- **AC-02.2** Given the chef id does not exist, when I open `/chef/<id>`, then I see **Chef not found** and the page does not crash.
- **AC-02.3** API: `GET /api/chef/<unknown id>` returns `404`.

### REQ-03 — Add a dish to the cart

**As a** customer **I want** to add dishes, optionally with additions, **so that** I can build my order.

- **AC-03.1** Given an empty cart, when I add a dish, then the cart shows it with quantity = max(1, dish minimum order count).
- **AC-03.2** Given I select additions, then the line price = dish price + sum of selected addition prices.
- **AC-03.3** Given the same dish with the same additions is added again, then its quantity increases instead of creating a new line.
- **AC-03.4** Subtotal = Σ (line price × quantity). The header badge shows the total number of items.

### REQ-04 — Change quantity and remove items

- **AC-04.1** **+** increases the quantity by exactly 1.
- **AC-04.2** **−** decreases the quantity by exactly 1. The item is removed only when **−** is clicked at the minimum quantity.
- **AC-04.3** The trash icon removes the line regardless of quantity.
- **AC-04.4** Given the last line is removed, then the cart shows **Your cart is empty**.

### REQ-05 — Cart persists in the browser

- **AC-05.1** Given my cart has items, when I reload the page or reopen the site in the same browser, then the cart content and quantities are unchanged.

### REQ-06 — Cart holds dishes from one chef only

- **AC-06.1** Given my cart has items from chef A, when I add a dish from chef B, then a **Switch kitchens?** dialog appears.
- **AC-06.2** **Keep cart & browse** closes the dialog and keeps the cart unchanged.
- **AC-06.3** **Clear & continue** empties the cart and adds the chef B dish.
- **AC-06.4** Opening a non-existent chef page never shows the dialog.

### REQ-07 — Delivery price and free delivery

**As a** customer **I want** free delivery when my order is large enough **so that** I save money.

- **AC-07.1** Given delivery method `DELIVERY` and subtotal **below** the chef's "free delivery from" amount, then delivery price = chef's delivery price (500 AMD).
- **AC-07.2** Given delivery method `DELIVERY` and subtotal **equal to or above** the "free delivery from" amount, then delivery price = 0. **[Assumption]** "Free delivery from 5000" includes 5000.
- **AC-07.3** Given delivery method `TAKEAWAY`, then delivery price = 0 for any subtotal.
- **AC-07.4** Total = Subtotal + Delivery price.
- **AC-07.5** API: `POST /api/order/delivery-price` with `{chefId, subtotal, deliveryMethod}` returns `deliveryPrice` and `freeDeliveryFrom`.

### REQ-08 — Checkout requires an account

- **AC-08.1** Given the cart is empty, when I open `/checkout`, then I see **Nothing to check out** and a **Browse chefs** link, and no form.
- **AC-08.2** Given I am signed out, when I open `/checkout`, then I can sign in or create an account on the same page before the order form is shown.
- **AC-08.3** API: `POST /api/order` without a valid customer token returns `401`.

### REQ-09 — Checkout form validation

| Field | Rule | Error message |
|---|---|---|
| Full name | at least 2 characters | Enter your name |
| Phone | at least 8 characters | Enter a valid phone number |
| Email | valid email format | Enter a valid email |
| Note | at most 300 characters | A visible message, or the input stops at 300 characters **[Assumption]** — the UI currently has neither |
| City | required for `DELIVERY` only | City is required |
| Street | required for `DELIVERY` only | Street is required |

- **AC-09.1** Given any rule is violated, when I click **Place order**, then no order is sent and the URL stays `/checkout`.
- **AC-09.2** Given `TAKEAWAY`, then address fields are hidden and not required.
- **AC-09.3** Only cash payment is accepted. Other visual payment options still place a `CASH` order.

### REQ-10 — Place an order

- **AC-10.1** Given valid data, when I click **Place order**, then I am redirected to `/orders/success` with **Order placed!** and an order number `FM-<6+ digits>`.
- **AC-10.2** The created order has status `NEW`.
- **AC-10.3** Order subtotal = Σ ((dish price + Σ addition prices) × quantity). Total = subtotal + delivery price (REQ-07). The total is not rounded or truncated.
- **AC-10.4** For `DELIVERY` the address is stored. For `TAKEAWAY` no address is stored.
- **AC-10.5** After a successful order the cart is empty.
- **AC-10.6** API: payment type other than `CASH` returns `400 Only CASH payment is supported`.

### REQ-11 — Order content validation (API)

- **AC-11.1** Quantity must be a whole number ≥ 1 (and ≥ the dish minimum order count). `0`, negative or missing quantity returns `400`. **[Assumption]**
- **AC-11.2** Every dish in the order must belong to the chef in `chefId` and be `ACTIVE`. Otherwise `400`. **[Assumption]**
- **AC-11.3** A non-existent `dishId` or `chefId` returns `404`.

### REQ-12 — Order history and tracking

- **AC-12.1** Given I am signed in, `/orders` lists my orders, newest first.
- **AC-12.2** **Track order** opens `/tracking/<number>` with the order status.
- **AC-12.3** The order creation time shown to the user matches the real local time (Asia/Yerevan) when the order was placed. **[Assumption]**
- **AC-12.4** API: `GET /api/customer/orders` page size is limited to 1–50.

### REQ-13 — Customer registration

| Field | Rule (backend) |
|---|---|
| Full name | 2–120 characters, required |
| Email | valid format, unique (case-insensitive, trimmed) |
| Phone | 8–32 characters, required |
| Password | 8–72 characters, required |

- **AC-13.1** Given valid data, then the account is created, I am signed in and redirected to `/orders`.
- **AC-13.2** Given any rule is violated, then the account is not created and a field error (UI) or `400` (API) is returned.
- **AC-13.3** Given the email is already registered (in any letter case), then **Email already registered** is shown.

### REQ-14 — Customer login

- **AC-14.1** Given correct credentials, then I am signed in.
- **AC-14.2** Given a wrong password **or** an unknown email, then the same message **Invalid email or password** is shown (no user enumeration).
- **AC-14.3** Empty fields show validation errors and no request is sent.

### REQ-15 — Back-office admin login

- **AC-15.1** Given `admin` / `admin123`, then the back office opens with **Orders**, **Chefs**, **Dishes** in the sidebar.
- **AC-15.2** Given a wrong password, then **Invalid username or password.** is shown.

### REQ-16 — Admin order status workflow

| From \ To | ACCEPTED | REJECTED | DELIVERED |
|---|---|---|---|
| NEW | ✔ | ✔ (with reason) | ✘ |
| ACCEPTED | ✘ | ✔ (with reason) | ✔ |
| REJECTED | ✘ | ✘ | ✘ |
| DELIVERED | ✘ | ✘ | ✘ |

- **AC-16.1** Allowed transitions succeed and the new status is shown.
- **AC-16.2** Forbidden transitions return `400 Cannot transition order from X to Y` and the status does not change.
- **AC-16.3** `REJECTED` and `DELIVERED` are final states.

### REQ-17 — Admin views order details safely

- **AC-17.1** Text entered by customers (note, name, address) is shown in the back office **as plain text**. HTML or script in the text is never rendered or executed.

### REQ-18 — Admin manages chefs and dishes

- **AC-18.1** The chef and dish lists load and each row opens an edit form.
- **AC-18.2** Changes saved in the back office are visible in the storefront.

---

## Non-functional requirements (ISO/IEC 25010)

### REQ-NF-01 — Performance efficiency (time behaviour)

- **AC-NF-01.1** With 10 concurrent users, the 95th percentile response time of the public read API (`/api/chef/active`, `/api/chef/<id>`) is **≤ 2000 ms** (the app adds 200–1500 ms of simulated latency on purpose). **[Assumption]**
- **AC-NF-01.2** Error rate under that load is below 1%.

### REQ-NF-02 — Usability (accessibility)

- **AC-NF-02.1** The home, explore, chef, checkout and login pages have **no critical or serious** WCAG 2.1 A/AA violations reported by axe-core.

### REQ-NF-03 — Security (access control, confidentiality)

- **AC-NF-03.1** `/api/customer/**` and `POST /api/order` return `401` without a customer token.
- **AC-NF-03.2** `/admin/**` (except login and public dish previews) returns `401` without an admin token.
- **AC-NF-03.3** Error responses for client errors (4xx) do not expose stack traces.

### REQ-NF-04 — Maintainability (observability)

- **AC-NF-04.1** Unhandled server errors (for example `GET /api/debug/boom`) return `500` and are reported to GlitchTip.

### REQ-NF-05 — Compatibility / usability (responsive layout)

- **AC-NF-05.1** At a 375 px wide viewport, the home, explore and chef pages have no horizontal scrolling and all primary actions are reachable.
