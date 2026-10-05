# API Checklist (`/api/**`, `/admin/**`)

**ISTQB:** CTFL 4.4.3 — checklist-based testing.

Endpoint: ____________ · Build/commit: ____________ · Tester: ____________ · Date: ____________

| # | Check | Yes / No / N/A | Notes |
|---|---|---|---|
| **Functional** | | | |
| API-01 | Valid request returns the documented status (200) and body | | |
| API-02 | Response fields have the right types (numbers are numbers, dates are ISO-8601) | | |
| API-03 | Calculated values (totals, prices) are correct for EP and boundary values | | |
| API-04 | Lists: `count` equals the number of items across all pages | | |
| **Negative** | | | |
| API-05 | Missing required field → 400 with a clear message | | |
| API-06 | Wrong type (string instead of number) → 400, not 500 | | |
| API-07 | Out-of-range values (0, negative, too long) → 400 | | |
| API-08 | Unknown id → 404 | | |
| API-09 | Wrong HTTP method → 405, not 500 | | |
| **Security** | | | |
| API-10 | No token → 401; customer token on admin endpoint → 401/403 | | |
| API-11 | A user cannot read or change another user's data (orders) | | |
| API-12 | 4xx responses contain no stack trace (`trace` is `null`) | | |
| API-13 | Text fields accept HTML/script safely (stored as text, never executed) | | |
| **Non-functional** | | | |
| API-14 | Response time within REQ-NF-01 (p95 ≤ 2000 ms) | | |
| API-15 | Request appears in logs / metrics (`/actuator/prometheus`) | | |
