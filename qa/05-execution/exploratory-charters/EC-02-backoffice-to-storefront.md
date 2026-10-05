# EC-02 — Back-office changes seen from the storefront

**Charter:** Explore **back-office changes** (dish and chef edits, order status changes) to discover **what the storefront and an existing cart do with them**.

| Field | Value |
|---|---|
| Time box | 45 min |
| Priority | Medium (RSK-10) |
| Requirements | REQ-02, REQ-16, REQ-18 |
| Techniques | Error guessing (EG-20), state transition (ST-1), tours |

**Data rule:** do not change the seed chefs and dishes permanently — note the original value and restore it at the end of the session.

## Ideas to start with

- Put a dish in the storefront cart. In the back office set that dish to inactive or change its price. Go to checkout and place the order. Which price is charged? Is an inactive dish accepted?
- Edit a dish and leave the Armenian or Russian name empty. Does the chef page still open? (Compare with `GET /api/chef/32` returning 500.)
- Change a chef's delivery price / free-delivery amount. Does the cart total change without reload?
- Set a chef to inactive. Is the chef still reachable by direct URL `/chef/<id>`? Is the cart with that chef's dishes still usable?
- Change an order status to ACCEPTED / DELIVERED / REJECTED. What does the customer see on `/tracking/<number>` and `/orders`?
- Long texts and special characters in names and descriptions.
