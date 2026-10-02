# AGENTS.md

## Project
FoodMe — food-ordering demo app used for QA training.
Contains planted bugs on purpose — do not fix them without asking.

## How to run
- Backend: `cd apps/backend && ./gradlew bootRun` (needs Postgres)
- Web: `cd apps/web && npm run dev`
- E2E tests: `cd apps/web && npm run test:e2e` (backend must run on :8081)

## Test rules
- Never use `page.waitForTimeout()` — wait for a condition instead.
- Use role/label locators (`getByRole`, `getByLabel`).
- `flake-*.spec.ts` files are flaky on purpose.

## Jira
Bugs go to project SCRUM, issue type Task with label `bug`.
