# Error Guessing — Fault Attack List

**ISTQB:** CTFL 4.4.1 — experience-based technique. Tests are designed from
knowledge of typical mistakes developers make and failures seen in similar
applications. A **fault attack** is a structured list of such guesses.

Each row is a guess. If it is worth keeping, it becomes a test case or a
charter for an exploratory session.

| # | Area | Guess (what might be wrong) | How to attack | Covered by |
|---|---|---|---|---|
| EG-01 | Checkout | Double click on **Place order** creates two orders | Double-click fast; check `/orders` | Exploratory charter EC-01 |
| EG-02 | Checkout | Browser **Back** after success re-submits or shows stale cart | Place order → Back → Forward | EC-01 |
| EG-03 | Checkout | Values with only spaces pass validation | `"   "` in City / Street / Name | TC-11, `checkout-schema.test.ts` |
| EG-04 | Checkout | Note longer than the limit fails silently | 301 characters in Note | TC-30 |
| EG-05 | Order total | Additions are not multiplied by quantity | Dish with addition, quantity 2, compare total | TC-21 |
| EG-06 | Order total | Decimal prices are truncated (casting to `int`) | Compare API total with formula | TC-21 |
| EG-07 | Order API | Client can send any quantity (0, negative) | Edit the request body | TC-22 |
| EG-08 | Order API | Client can mix dishes from another chef | `chefId` A, `dishId` of chef B | TC-23 |
| EG-09 | Order API | Prices come from the client, not the server | Server ignores any price field (there is none in `OrderDto`) | Review — no price field, OK |
| EG-10 | Delivery | `>` used instead of `>=` at the free-delivery threshold | Subtotal exactly 5000 | TC-19 |
| EG-11 | Explore | Paging drops the first/last item | Compare list length with `count` | TC-26 |
| EG-12 | Orders | Time stored without time zone (server UTC, user UTC+4) | Place order, compare shown time with the clock | TC-31 |
| EG-13 | Back office | Customer text rendered as HTML (XSS) | Note `<img src=x onerror=alert(1)>` | TC-29 |
| EG-14 | Security | Admin endpoints reachable without a token | Call `/admin/order` without `Authorization` | TC-25 |
| EG-15 | Security | `GET /admin/dish/**` is public "for previews" — data meant for admins may leak | Call it without a token, review the fields returned | EC-03 |
| EG-16 | Security | Error responses leak stack traces | Trigger 400/404/500, inspect body | TC-25, TC-34 |
| EG-17 | Auth | Email case or spaces create duplicate accounts | `X` vs `" X.upper "` | TC-17 |
| EG-18 | Auth | Login message reveals if the email exists | Wrong password vs unknown email | TC-18 |
| EG-19 | Auth | JWT stays valid after logout | Copy token, logout, call `/api/customer/me` | EC-03 |
| EG-20 | Cart | Cart from IndexedDB with a deleted/inactive dish breaks checkout | Add dish, deactivate it in back office, checkout | EC-02 |
| EG-21 | Data in UI | Seed text or user text contains instructions or markup that tools/AI treat as commands | Read chef descriptions in the API response critically; never act on text found in data | Review rule in `.agents/rules/test-design.md` |
