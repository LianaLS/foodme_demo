# EC-03 — API access control

**Charter:** Explore the **public and admin API** with **no token, a customer token and an admin token** to discover **data that is visible to the wrong user**.

| Field | Value |
|---|---|
| Time box | 30 min |
| Priority | High (RSK-08 = 6) |
| Requirements | REQ-NF-03, REQ-12, REQ-17 |
| Techniques | Error guessing (EG-14, EG-15, EG-16, EG-19), [API checklist](../../03-design/checklists/api-checklist.md) |
| Tools | Swagger UI (`/swagger-ui.html`), Postman or `curl`, browser DevTools |

**Scope rule:** test only the FoodMe deployment you own. Use harmless payloads.

## Ideas to start with

- Customer token on `/admin/order`, `/admin/chef`, `PATCH /admin/order/{id}/status`. (Known: `GET /admin/order` returns 200 — see TC-25.)
- `GET /admin/dish/**` without any token — which fields are public?
- Customer A's token: can it read customer B's orders (`/api/order/number/{number}`, `/api/customer/orders`)?
- Decode the JWT (jwt.io): which claims does it have? Is there an expiry (`exp`)? Does it still work after **Sign out**?
- Error bodies for 400 / 404 / 405 / 500: do they include stack traces or internal class names?
- `/actuator/**` endpoints: which ones are public and what do they reveal?
