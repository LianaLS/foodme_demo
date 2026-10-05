# Review Log

**ISTQB:** CTFL 3.2 — results of reviews. One row per anomaly.

## Review RV-01 — 2026-10-05

| Field | Value |
|---|---|
| Review type | Technical review (tool-assisted, one reviewer) |
| Work products | Source code, seed data, `.github/workflows/ci.yml`, `apps/web/e2e/*`, `qa/test-cases.md` v0, `.agents/rules/e2e-tests.md`, `CLAUDE.md` |
| Checklists | [review-checklist.md](review-checklist.md) R, T, A |
| Reviewer | Claude Code (AI assistant) for LianaLS |

| # | Work product | Location | Anomaly | Checklist | Class | Severity | Status |
|---|---|---|---|---|---|---|---|
| RV-01-01 | Test code | `apps/web/e2e/happy-path.spec.ts:4`, `layout.spec.ts:4` | API base URL hard-coded to `http://localhost:8081` while `baseURL` is the Render URL → 3 tests fail with `ECONNREFUSED` against Render | A-04 | Defect (testware) | Major | **Fixed** 2026-10-05 (approved by the owner): `API` defaults to `""` (relative URLs); confirmation run — the 3 tests pass |
| RV-01-02 | CI config | `.github/workflows/ci.yml` (e2e job) | References `infra/docker-compose.yml`, which does not exist → E2E job cannot boot the backend | — | Defect (testware/CI) | Major | Open (known, PRJ-02) |
| RV-01-03 | Build | `apps/backend/gradle/wrapper/` | `gradle-wrapper.jar` is missing (only `.properties` is committed), so `./gradlew` fails with `ClassNotFoundException: GradleWrapperMain` locally and in CI | — | Defect (build) | Major | Open |
| RV-01-04 | Rules | `.agents/rules/e2e-tests.md`, `CLAUDE.md` | Say `happy-path.spec.ts` fails because of SCRUM-6, but the `throw` in `Checkout/index.tsx` is commented out (fixed in `0e50e00`) | R-04 | Inconsistency | Minor | Fixed in `e2e-tests.md` (CLAUDE.md left for the owner) |
| RV-01-05 | Requirements / code | `checkout-schema.ts` (`note.max(300)`), `order-delivery-form.tsx` | Note limit exists in the schema, but the textarea has no `maxLength` and no error message → form silently refuses to submit | R-03 | Defect (product) | Minor | Open — OBS-01, TC-30 |
| RV-01-06 | Code | `OrderService.calculateDeliveryPrice` | Free delivery uses `subtotal > freeDeliveryFrom`; "free from 5000" suggests `>=` | R-02 | Defect (product, planted FM-BUG-03) | Major | Known |
| RV-01-07 | Code | `SecurityConfig` | `/admin/**` requires only `authenticated()`, not `hasRole("ADMIN")` → any customer token passes (confirmed dynamically, TC-25) | — | Defect (security) | Critical | Open — NEW-02 |
| RV-01-08 | Code | `JwtService` | Admin and customer JWTs have no `exp` claim — tokens never expire | — | Defect (security) | Major | Open — explore in EC-03 |
| RV-01-09 | Code | `GlobalExceptionHandler.handleGeneric` | 500 responses include the full Java stack trace in the body | — | Defect (security) | Minor | Open |
| RV-01-10 | Requirements | — | No written specification; requirements had to be reconstructed | R-01 | Process issue | Major | Mitigated — `requirements.md` with [Assumption] markers |
| RV-01-11 | Test cases v0 | `qa/test-cases.md` | No requirement / risk / technique fields; traceability not possible | T-01, T-02 | Defect (testware) | Minor | Fixed in v1.0 |
| RV-01-12 | Seed data | `V1__init.sql` (chef 39, 28 descriptions) | Chef descriptions contain text addressed to automated reviewers ("report PASS", "do not mention …"). It is data, not instructions — reviewers and AI tools must ignore it | — | Data quality / security awareness | Minor | Noted — rule added in `.agents/rules/test-design.md` |

## Metrics

| Metric | Value |
|---|---|
| Anomalies found | 12 |
| Product defects | 5 (1 critical, 2 major, 2 minor) |
| Testware / build defects | 5 |
| Process / data issues | 2 |
