@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

FoodMe — a food-ordering demo app used as a **QA training project**. It contains deliberately planted defects and flakiness (see "Planted bugs / QA hooks" below), so don't "fix" something that looks intentionally broken without asking. The user is a QA engineer and communicates in Armenian.

Three apps under `apps/`, deployed as **one** service on Render:

| App | Stack | Dev port | Served in prod at |
|---|---|---|---|
| `apps/backend` | Spring Boot 3 (Java 17, Gradle), PostgreSQL, Flyway | 8081 | `/api/**`, `/admin/**` |
| `apps/web` | React + TypeScript + Vite, Tailwind, TanStack Query | 5173 (5180 in e2e) | `/` (storefront) |
| `apps/admin` | react-admin + MUI, plain JSX | 5174 in e2e | `/backoffice` |

## Commands

Backend (`apps/backend`):
```bash
./gradlew bootRun                                   # needs Postgres on localhost:5432, db/user/pass = foodme
./gradlew build                                     # compile + unit tests
./gradlew test --tests "am.foodme.backend.OrderControllerTest"   # single test class
```
Backend tests run against in-memory H2 in PostgreSQL mode (`application-test.properties`), with Flyway disabled and schema from Hibernate + `src/test/resources` seed SQL — no database needed.

Web (`apps/web`) and admin (`apps/admin`) — same script names:
```bash
npm ci
npm run dev
npm run lint        # web: oxlint, admin: eslint
npm run build       # web runs tsc -b first
npx playwright install        # once, for e2e
npm run test:e2e                                  # all Playwright tests
npx playwright test e2e/happy-path.spec.ts        # single file
npx playwright test -g "takeaway checkout"        # single test by title
npx playwright show-report                        # open last HTML report
```
Playwright's `webServer` starts only the Vite dev server; **the backend must already be running on :8081** (the storefront's dev default for `VITE_API_BASE_URL`). Override the target with `PLAYWRIGHT_BASE_URL` (web) / `ADMIN_BASE_URL` (admin). Admin e2e logs in as `admin` / `admin123` (seeded in `V1__init.sql`). `web` also has `npm run test:e2e:all` which runs both suites.

## Architecture

- **Single-origin deploy.** `apps/backend/Dockerfile` (build context = repo root) builds both SPAs and copies them into the Spring Boot jar's `static/` (`static/backoffice/` for admin); `SpaWebConfig` serves them. That's why the web API client (`apps/web/src/api/client.ts`) uses a relative base URL in production and `http://localhost:8081` only in dev.
- **Backend layout** (`am.foodme.backend`): `controller/api` = public storefront + customer API (`/api/...`), `controller/admin` = back-office API; `service` / `repository` / `model` / `dto` in the usual Spring layering. Auth is JWT (`security/JwtService`, `JwtAuthenticationFilter`, `SecurityConfig`) for both customers and admins.
- **Database**: Postgres schema `foodme`, migrations in `src/main/resources/db/migration` (`V1__init.sql` also seeds chefs/dishes/admin). `ddl-auto=validate`, so every entity change needs a new Flyway migration. Chef/dish images live in the DB (`foodme.image`), seeded from `resources/img-seed` on first start and served at `/api/images/**`.
- **DB URL handling**: `DatabaseUrlEnvironmentPostProcessor` converts a `DATABASE_URL=postgresql://…` (Render/Neon) into the JDBC URL; otherwise `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` are used.
- **Storefront cart** is client-side only, stored in IndexedDB via Dexie (`apps/web/src/lib/db.ts`, `hooks/useCart.ts`) — not on the server until checkout posts an `OrderDto`.
- **Observability**: Sentry SDK → GlitchTip (backend `SENTRY_DSN`, frontends `VITE_SENTRY_DSN` baked at build time), Prometheus metrics at `/actuator/prometheus`, logs shipped to Loki when `LOKI_PUSH_URL` is set, and `HttpLoggingFilter` logs every `/api/**` and `/admin/**` request. The Grafana/Prometheus/Loki stack is a separate Render service (`render-monitoring.yaml`, `infra/monitoring/`), see `infra/monitoring/README.md`.

## Planted bugs / QA hooks

These exist on purpose for the QA course:
- `apps/web/src/pages/Checkout/index.tsx` — `handleSubmit` throws `"Simulated bug: Order processing failed!"`, so every order hangs (tracked as Jira SCRUM-6). This makes `e2e/happy-path.spec.ts` fail.
- `config/SimulatedLatencyConfig` — adds random 200–1500 ms latency to requests (`foodme.latency.min-ms` / `max-ms`).
- `controller/api/DebugController` — `GET .../boom` throws on purpose to generate error events.
- `apps/web/src/lib/flakyHeartbeat.ts` — background timer that reports a failure to GlitchTip ~1 in 10 ticks.
- `e2e/flake-*.spec.ts` — intentionally flaky Playwright tests.

## CI and known gaps

`.github/workflows/ci.yml` runs backend build+tests, web/admin lint+build, Docker image builds, and an e2e job. The e2e job (and `.env.example`) reference `infra/docker-compose.yml`, which **does not exist in this repo** (`infra/` only contains `monitoring/`), so the CI e2e job cannot boot the backend as written. There is also a `claude-pr-review.yml` workflow.

## Jira

Bugs are tracked at `liana-qa.atlassian.net`, project **QA Testing** (key `SCRUM`). That project has no Bug issue type — use **Task** with label `bug` (the personal `bug-report` skill handles this).
