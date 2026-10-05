# Test Completion Report — template

**ISTQB:** CTFL 5.3.2 (test completion report), 1.4.1 (test completion activities)
**Template:** ISO/IEC/IEEE 29119-3 — Test Completion Report

> Fill this in at the **end** of a test cycle or release, not during it — for the
> current status use [test-progress-report.md](test-progress-report.md).
> Cycle 1 is still in progress (2026-10-05), so this report is not filled yet.
> The `test-report` skill can fill it from real runs.

---

| Field | Value |
|---|---|
| Report ID | TCR-‹nn› |
| Test plan | [TP-FOODME-01](../01-planning/test-plan.md) |
| Cycle / release | |
| Period | ‹start› – ‹end› |
| Build / commit | |
| Author / date | |

## 1. Summary

‹3–5 sentences: what was tested, overall quality, release recommendation (Go / Go with risks / No-go).›

## 2. Deviations from the test plan

‹Scope, schedule, environment or approach changes, and why.›

## 3. Results

| Metric | Planned | Actual |
|---|---|---|
| Test cases executed | | |
| Passed / failed / blocked / not run | | |
| Requirements covered (≥ 1 passed test) | | |
| Automated tests (component / API / E2E) | | |
| Backend statement / branch coverage | | |
| Non-functional results (performance, accessibility) | | |

## 4. Exit criteria evaluation (test plan §3.7)

| # | Criterion | Met? | Evidence |
|---|---|---|---|
| 1 | 100% High-priority test cases executed; ≥ 90% of all | | |
| 2 | No open Critical defects; Major defects accepted or with workaround | | |
| 3 | Every requirement in scope has ≥ 1 executed test case | | |
| 4 | Backend branch coverage reported | | |
| 5 | This report written and reviewed | | |

## 5. Defects

| Severity | Found | Fixed and confirmed | Open | Deferred / accepted |
|---|---|---|---|---|
| Blocker | | | | |
| Critical | | | | |
| Major | | | | |
| Minor | | | | |
| Trivial | | | | |

Open defects that the release would ship with: ‹Jira keys and why they are accepted›

## 6. Residual risks

‹Risks from the risk register that are not sufficiently reduced, with their level.›

## 7. Testware

‹What was produced and where it is archived (qa/ folder, commit hash, Playwright HTML report).›

## 8. Lessons learned

| What went well | What to improve | Action |
|---|---|---|
| | | |

## 9. Approval

| Role | Name | Date | Decision |
|---|---|---|---|
| Test manager | | | |
| Product owner | | | |
