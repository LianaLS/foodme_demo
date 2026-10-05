---
name: test-report
description: Run the FoodMe test suites and write an ISTQB test progress report or test completion report (ISO/IEC/IEEE 29119-3) with real numbers — executed/passed/failed/blocked, requirement coverage, defects by severity, risks, exit criteria. Use when the user asks for a test report, test summary, test results, status of testing, "ռեպորտ", "հաշվետվություն", "test completion report", "progress report", or wants to know whether the release meets the exit criteria.
---

# Test report (ISTQB CTFL v4.0, 5.3)

Two report types:
- **Test progress report** — during testing; status, deviations from the plan, impediments, next steps. File: `qa/06-reporting/test-progress-report.md` (newest report on top, or one file per date).
- **Test completion report** — at the end of a cycle/release; summary, exit criteria check, residual risks, lessons learned. File: `qa/06-reporting/test-completion-report.md`.

Talk to the user in their language; write the report in English.

## Workflow

1. **Ask which report** if it is not clear, and which cycle/build it covers.
2. **Wake the environment**: `curl https://foodme-lianals.onrender.com/api/chef/active?page=0&size=1` (can take up to 2 minutes).
3. **Run and collect** (only what the user agrees to; each command prints a summary):
   - `cd apps/web && npm run test:unit`
   - `cd apps/web && npm run test:regression -- --reporter=line` (and `test:a11y` if non-functional testing is in scope)
   - backend: `./gradlew test` → JaCoCo `apps/backend/build/reports/jacoco/test/jacocoTestReport.xml`
   - performance (optional): `k6 run qa/performance/k6-read-api.js`
4. **Classify every failure** before reporting it: product defect (which REQ/TC), known defect (`@known-defect` → expected failure), testware defect, or environment problem (re-run once with `--workers=1` to check). Never count an environment timeout as a product defect without saying so.
5. **Defects**: list open defects by severity with Jira keys (search `project = SCRUM AND labels = bug AND statusCategory != Done`). Mark findings not yet in Jira as `NEW-xx`.
6. **Coverage**: requirement coverage from `qa/04-implementation/traceability-matrix.md`; update its "Last result" column.
7. **Exit criteria**: compare with section 3.7 of `qa/01-planning/test-plan.md`; state met / not met for each.
8. **Write the report** using the structure of the existing report file. Every number must come from a run you did (write the command, date and commit). If something was not run, write "not run".
9. **Reply** with a 5–8 line summary and the file path.
