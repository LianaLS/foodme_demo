Write a guide in Armenian, short and in plain human language. Two parts: (1) for users — what is new and how to use it; (2) for the IT team — how it works technically. Keep button names, messages, status names, URLs and code in English, exactly as given. Use only the facts below; do not add anything. Maximum about one page.

---

# Facts for the guide — SCRUM-9 Cancel an order before the kitchen accepts it

## What the feature is and who uses it
- New feature: customers can cancel their own order while the kitchen has not accepted it yet (status "Received").
- Users: signed-in customers on the storefront (https://foodme-lianals.onrender.com) and the admin team in the admin panel (https://foodme-lianals.onrender.com/backoffice).
- A new order status "Cancelled" exists. Order statuses: Received, Accepted, Delivered, Declined, Cancelled.
- No refunds are needed: orders are cash on delivery. The customer is not asked for a cancellation reason.

## How a customer cancels an order
- Sign in. Open "My Orders" or the order tracking page of the order.
- An order in status "Received" shows a "Cancel order" button.
- Click "Cancel order". A confirmation asks: "Cancel order FM-xxxxxx? This can't be undone." (FM-xxxxxx is the order number). Choices: "Keep order" and "Cancel order". The dialog also has a close (×) button.
- "Keep order" closes the confirmation; the order does not change.
- "Cancel order" cancels the order. On My Orders it then shows the status "Cancelled", in a neutral grey style, different from the red "Declined" status.
- On the tracking page, no step of the progress bar is shown as the current step for a cancelled order.
- Observed: the full flow (sign up → place an order → cancel from My Orders → "Cancelled") worked on Desktop 1920×1080, Laptop 1366×768, Pixel 7, Galaxy S24, and on iPhone 15 and iPad screen sizes in Chromium. iPhone 15 and iPad in Safari (WebKit) were not yet checked.

## When cancelling is not possible, and what the user sees
- Once the kitchen accepts the order (Accepted, Delivered or Declined), the "Cancel order" button is not shown on My Orders or the tracking page, and cancellation is refused with the message "Only new orders can be cancelled."
- If the kitchen accepted the order just before the customer confirmed, the page shows "Only new orders can be cancelled." and refreshes the order so its real status is shown.
- An order that is already "Cancelled" cannot be cancelled again (same message "Only new orders can be cancelled.").
- "Cancelled" is final: nobody, including the admin team, can move it to another status.
- A visitor who is not signed in cannot cancel an order. Someone else's order cannot be cancelled.

## What the admin team sees (admin panel, /backoffice)
- Cancelled orders are shown as their own status with their own colour in the order list and in the order details.
- The order list can be filtered to show only cancelled orders.
- The order details of a cancelled order show the note "Cancelled by customer".
- A cancelled order has no Accept, Deliver or Reject buttons.
- The admin team can still change the status of other orders as before, but cannot set an order to Cancelled; only the customer who placed it can.
- The dashboard "Recent revenue" figure does not include Cancelled or Declined orders; Received, Accepted and Delivered orders are included. Observed: the figure is the sum over the latest 100 orders only; at every reading it equalled that sum without Cancelled and Declined orders. The before/after revenue test cases are blocked (test design issue), so this is not yet a formal pass.

## For the IT team
- Test object: storefront and API https://foodme-lianals.onrender.com, admin /backoffice, API under /api/** and /admin/**; build `main` at `fb452d5` (PR #7) on Render.
- API answers for a cancel request (all observed in testing, 14 of 14 API test cases passed):
  - owner cancels a Received order: HTTP 200, status becomes CANCELLED;
  - order is Accepted, Delivered or Declined (API status names ACCEPTED, DELIVERED, REJECTED), or already CANCELLED: HTTP 400 with "Only new orders can be cancelled.";
  - someone else's order: HTTP 404, the same answer as for an unknown order number (for example FM-999999);
  - not signed in: HTTP 401.
- In the API the status names are NEW (shown as Received), ACCEPTED, DELIVERED, REJECTED (shown as Declined) and CANCELLED.
- Admin status change endpoint: /admin/order/{id}/status. Any change of a CANCELLED order is refused with HTTP 400 "Cannot transition order from CANCELLED to …". The admin cannot set CANCELLED (HTTP 400, order stays NEW).
- Monitoring counts cancelled orders alongside placed orders. This was not checked in this test cycle (out of scope for functional testing).
- Free Render instance: the first request after idle can answer 503 "Application loading" for several minutes; requests have a simulated latency of 200–1500 ms.
- Automated tests (Playwright), in apps/web:
  - e2e/scrum-9-cancel-order.spec.ts — TC-SCRUM-9-34 (sign up, place an order, cancel from My Orders, Desktop 1920x1080) and TC-SCRUM-9-22 (owner cancels from the tracking page; marked as known defect SCRUM-10);
  - e2e/api/scrum-9-cancel-order.api.spec.ts — TC-SCRUM-9-02 (cancelling an Accepted order is refused) and TC-SCRUM-9-06 (another customer cannot cancel someone else's order).
  - Run from apps/web: `npx playwright test e2e/scrum-9-cancel-order.spec.ts e2e/api/scrum-9-cancel-order.api.spec.ts`
  - Watch mode: add `--ui`. Report: `npx playwright show-report`.
  - Tests run against the Render URL set as baseURL in playwright.config.ts.
- Test results (manual run 2026-10-15): 37 test cases, 26 passed, 7 failed, 4 blocked.

## Known issues (all in Jira SCRUM-10, severity Minor, priority Low)
- SCRUM-10 (DEF-01): after cancelling, the tracking page shows the title "Order cancelled" and the line "You cancelled this order." instead of the status title "Cancelled".
- SCRUM-10 (DEF-02): the tracking page shows the "Cancel order" button also to a signed-in customer who does not own the order; the server still refuses (404), so nothing changes. The rule "only the owner sees the button" is an assumption still to be confirmed by the product owner.
- SCRUM-10 (DEF-03): the admin panel shows the status as "CANCELLED" (in the list, the details and the status filter) instead of "Cancelled".
- SCRUM-10 (DEF-04): the admin order list does not show the note "Cancelled by customer"; the note is shown only in the order details.
