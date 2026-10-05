# Defect Report Drafts — not yet in Jira

**ISTQB:** CTFL 5.5 (defect management) · Rules: [defect-management.md](../../.agents/rules/defect-management.md)
**Target:** `liana-qa.atlassian.net`, project `SCRUM`, issue type **Task**, label **`bug`**
**Found:** 2026-10-05, test cycle 1 ([test-progress-report.md](test-progress-report.md))
**Environment (all):** https://foodme-lianals.onrender.com, commit `ba34c17`, Chrome (Playwright Desktop Chrome) / curl

File these with the `bug-report` skill (check for duplicates first). After each one is created:
1. replace the `NEW-xx` / `OBS-xx` id with the Jira key in the [traceability matrix](../04-implementation/traceability-matrix.md) and the progress report;
2. mark the failing automated test with `test.fail()` + `@known-defect` + the key (see the rules file).

| Draft | Summary | Severity → Priority | Jira key |
|---|---|---|---|
| NEW-02 | Admin API: customer token can read all orders (/admin/order returns 200) | Critical → High | |
| NEW-01 | Chef page: GET /api/chef/32 returns 500 (NullPointerException on dish name) | Major → Medium | |
| NEW-05 | Auth: JWT tokens have no expiry (exp claim missing) | Major → Medium | |
| NEW-03 | Performance: read API p95 4.77 s with 10 users (limit 2 s) | Major → Medium | |
| NEW-04 | Accessibility: text colour contrast below WCAG AA on 5 pages | Major → Medium | |
| NEW-06 | API: 500 responses expose the Java stack trace | Minor → Low | |
| OBS-01 | Checkout: note over 300 characters blocks submit without a message | Minor → Low | |

---

## NEW-02 — Admin API: customer token can read all orders (/admin/order returns 200)

### Steps to reproduce
1. Register a customer: `POST /api/auth/register` with `{"fullName":"QA Probe","email":"<unique>@example.com","phoneNumber":"+37490000000","password":"secret123"}`. Copy `token`.
2. `GET /admin/order` with header `Authorization: Bearer <customer token>`.

### Expected result
`401` or `403`. Only an ADMIN token can use `/admin/**` (REQ-NF-03, AC-NF-03.2).

### Actual result
`200` with the list of **all** orders of all customers (names, phones, emails, addresses).

### Environment
- URL / build: https://foodme-lianals.onrender.com, commit `ba34c17`
- Client: curl, Playwright API test

### Severity
Critical — any registered customer can read every customer's personal data and order details.

### Traceability
- Requirement: REQ-NF-03 · Test case: TC-25 · `apps/web/e2e/api/access-control.api.spec.ts` ("a customer token cannot read admin orders")
- Found during: integration (API) test, scripted run; confirmed by review RV-01-07

### Additional notes
Always reproducible. `SecurityConfig` uses `.requestMatchers("/admin/**").authenticated()` — no role check. Not checked yet: `PATCH /admin/order/{id}/status`, `/admin/chef`, `/admin/dish` with a customer token (exploratory charter EC-03).

---

## NEW-01 — Chef page: GET /api/chef/32 returns 500 (NullPointerException on dish name)

### Steps to reproduce
1. Open https://foodme-lianals.onrender.com/explore and click **Italiano Margarino**, or call `GET /api/chef/32`.

### Expected result
`200` with the chef and the menu; the chef page shows the dishes (REQ-02, AC-02.1).

### Actual result
`500`, message `Cannot invoke "String.trim()" because the return value of "am.foodme.backend.model.Dish.getNameAm()" is null`. The chef page stays empty.

### Console / logs
```
java.lang.NullPointerException: Cannot invoke "String.trim()" because the return value of "am.foodme.backend.model.Dish.getNameAm()" is null
	at am.foodme.backend.dto.DishDto.mapEntityToDto(DishDto.java:42)
```

### Severity
Major — customers cannot order from one of the six chefs; no workaround in the UI.

### Traceability
- Requirement: REQ-02 · Test case: TC-01 · `apps/web/e2e/api/chefs.api.spec.ts` ("every active chef page loads")
- Found during: integration (API) test, scripted run

### Additional notes
Always reproducible. A dish of chef 32 has no Armenian name (`name_am` is null) — probably created or edited in the back office. Two problems: the data allowed it, and `DishDto.mapEntityToDto` does not handle null. Also causes all errors in NEW-03.

---

## NEW-05 — Auth: JWT tokens have no expiry (exp claim missing)

### Steps to reproduce
1. `POST /admin/auth/login` with `admin` / `admin123` (or register a customer).
2. Decode the returned `token` (e.g. jwt.io).

### Expected result
The token has an `exp` claim and stops working after a defined time.

### Actual result
Payload is only `{"sub":"admin","role":"ADMIN","iss":"foodme-backend"}` — no `exp`, no `iat`. A leaked token is valid forever.

### Severity
Major — stolen tokens (admin included) cannot expire; logout cannot invalidate them.

### Traceability
- Requirement: REQ-NF-03 · Test case: — (found by review) · Exploratory charter EC-03
- Found during: static testing, review RV-01-08 (`JwtService` builds the token without `withExpiresAt`)

---

## NEW-03 — Performance: read API p95 4.77 s with 10 users (limit 2 s)

### Steps to reproduce
1. Wake the app (`GET /api/chef/active`).
2. Run `k6 run qa/performance/k6-read-api.js` (10 virtual users, 1 min 45 s; `GET /api/chef/active` and `GET /api/chef/{id}`).

### Expected result
`http_req_duration` p95 < 2000 ms and `http_req_failed` < 1% (REQ-NF-01).

### Actual result
p95 = 4.77 s, median 1.68 s, max 8.25 s; error rate 9.24% (32 of 346 requests — all `GET /api/chef/32`, see NEW-01).

### Severity
Major — pages load slowly under light load. Part of the time is the intentional `SimulatedLatencyConfig` (200–1500 ms) and the Render free tier; the rest needs investigation.

### Traceability
- Requirement: REQ-NF-01 · Test case: TC-33 · `qa/performance/k6-read-api.js`
- Found during: system test, non-functional (performance)

### Additional notes
Re-run after NEW-01 is fixed to separate the error-rate failure from the latency failure.

---

## NEW-04 — Accessibility: text colour contrast below WCAG AA on 5 pages

### Steps to reproduce
1. `cd apps/web && npm run test:a11y` (axe-core, WCAG 2.1 A/AA), or run axe DevTools on the pages below.

### Expected result
No *critical* or *serious* violations (REQ-NF-02); text contrast ≥ 4.5:1 (WCAG 1.4.3).

### Actual result
Rule `color-contrast` (serious) fails on: home (3 elements), explore (2), chef page (44), checkout with empty cart (2), login (2). The JSON with the elements is attached to each test in the Playwright HTML report.

### Severity
Major — low-vision users cannot read parts of the menu and prices.

### Traceability
- Requirement: REQ-NF-02 · Test case: TC-32 · `apps/web/e2e/a11y.spec.ts`
- Found during: system test, non-functional (accessibility)

---

## NEW-06 — API: 500 responses expose the Java stack trace

### Steps to reproduce
1. `GET /api/debug/boom` (or `GET /api/chef/32`).

### Expected result
`500` with a generic message; no internal details.

### Actual result
The body contains a `trace` field with the full Java stack trace (class names, line numbers, library versions).

### Severity
Minor — information disclosure that helps an attacker.

### Traceability
- Requirement: REQ-NF-03 · Test case: TC-34 (related) · Review RV-01-09 (`GlobalExceptionHandler.handleGeneric`)

---

## OBS-01 — Checkout: note over 300 characters blocks submit without a message

### Steps to reproduce
1. Sign in, add a dish, open `/checkout`.
2. Fill valid contact data, choose Takeaway.
3. Enter a Note of 301 characters. Click **Place order**.

### Expected result
Either the textarea stops at 300 characters or a message explains the limit (REQ-09, [Assumption]).

### Actual result
From code review and the component test: the form validation rejects 301 characters, but no message is rendered, so clicking **Place order** does nothing visible. **Confirm in the UI before filing** (not yet reproduced in a browser).

### Severity
Minor — confusing for the user; easy workaround (shorten the note).

### Traceability
- Requirement: REQ-09 · Test case: TC-30 · Component test `checkout-schema.test.ts` ("rejects 301 characters")
- Found during: review RV-01-05; UI step to be confirmed manually

### Additional notes
`checkout-schema.ts` has `note: z.string().max(300)`, but `order-delivery-form.tsx` renders no error for `note` and the textarea has no `maxLength`.
