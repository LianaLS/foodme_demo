# AGENTS.md

## Project
FoodMe — food-ordering demo app used for QA training.
Contains planted bugs on purpose — do not fix them without asking.

Planted defects are also marked with `FM-BUG-xx` comments in the code.

## How to run
- Backend: `cd apps/backend && ./gradlew bootRun` (needs Postgres)
- Web: `cd apps/web && npm run dev`
- E2E tests: `cd apps/web && npm run test:e2e` (backend must run on :8081)
- Suites (apps/web): `npm run test:unit` (Vitest, component), `test:smoke`, `test:regression`, `test:api`, `test:a11y`
- Backend tests + coverage: `cd apps/backend && ./gradlew test` (JaCoCo report in `build/reports/jacoco/test/html`)
- Performance: `k6 run qa/performance/k6-read-api.js`

## QA process (ISTQB CTFL v4.0)
All testware is in `qa/` — start with `qa/README.md`. The work follows the ISTQB
test process: planning → analysis → design → implementation → execution → completion.
Every test case traces to a requirement (`REQ-xx`) and a risk (`RSK-xx`).

## Test rules
- Never use `page.waitForTimeout()` — wait for a condition instead.
- Use role/label locators (`getByRole`, `getByLabel`).
- `flake-*.spec.ts` files are flaky on purpose.
- Expected results come from the requirement, not from the current app behaviour.

## Jira
Bugs go to project SCRUM, issue type Task with label `bug`.

## Rules and skills
- Rules: `.agents/rules/` — read the relevant file before writing or changing code/tests.
  - `e2e-tests.md` — Playwright test rules, tags, annotations
  - `test-design.md` — ISTQB test design process and techniques
  - `test-documentation.md` — where each test document lives (ISO/IEC/IEEE 29119-3)
  - `defect-management.md` — severity, priority, lifecycle, known-defect handling
- Skills: `.agents/skills/` (Claude Code stubs in `.claude/skills/`)
  - `bug-report` — file a bug in Jira
  - `test-design` — design test cases with EP, BVA, decision tables, state transitions
  - `test-report` — run suites and write a test progress / completion report
  - `exploratory-session` — charter and session sheet for exploratory testing

