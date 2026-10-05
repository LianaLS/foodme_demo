# Review Checklist (static testing)

**ISTQB:** CTFL 3.1 (static testing basics, value of early defect detection), 3.2 (review process, roles, review types).

Static testing finds defects **without running the software** — in
requirements, test cases, code and configuration. A defect found in a review
is cheaper to fix than the failure it would cause later (shift left).

## Review types used in FoodMe

| Type | Formality | When | Example |
|---|---|---|---|
| Informal review | Low, no process | Any time | Ask a colleague to read a new test case |
| Walkthrough | Led by the author | New feature or test approach | Author walks the team through `test-plan.md` |
| Technical review | Peers, decision-making | Test design, automation code | Review of `03-design/` and new Playwright specs |
| Inspection | Highest: roles, entry/exit criteria, metrics | Critical documents | Requirements for checkout before a release |
| Tool-supported | Automated | Every PR | `claude-pr-review.yml`, `oxlint`, `eslint`, `tsc` |

## Review process (CTFL 3.2.2)

1. **Planning** — scope, review type, roles, checklist, entry/exit criteria.
2. **Review initiation** — distribute the work product and the checklist.
3. **Individual review** — each reviewer notes anomalies.
4. **Communication and analysis** — discuss anomalies, decide: defect / not a defect / question.
5. **Fixing and reporting** — the author fixes, findings go into the [review log](review-log.md).

Roles: author, moderator (facilitator), scribe (recorder), reviewers, review leader, manager.

## Checklist — requirements and user stories

| # | Question |
|---|---|
| R-01 | Is the requirement testable (clear expected result, no "fast", "user-friendly" without a number)? |
| R-02 | Are boundaries explicit (≥ or >, inclusive or exclusive)? |
| R-03 | Are error cases and messages defined? |
| R-04 | Is it consistent with other requirements and with the UI/API? |
| R-05 | Are non-functional expectations stated (time, accessibility, security)? |
| R-06 | Is every assumption marked and owned by someone? |

## Checklist — test cases

| # | Question |
|---|---|
| T-01 | Does it trace to a requirement (REQ-xx) and a risk (RSK-xx)? |
| T-02 | Is the design technique named, and are the chosen values justified (partitions, boundaries, rules)? |
| T-03 | Are preconditions and test data complete and reproducible? |
| T-04 | Is every step one action with an observable expected result? |
| T-05 | Is the expected result specific (exact text, value, URL), not "works correctly"? |
| T-06 | Does it test one thing (negative partitions one at a time)? |
| T-07 | Is the automation status correct and does the referenced test exist? |

## Checklist — automated tests (Playwright, JUnit, Vitest)

| # | Question |
|---|---|
| A-01 | No fixed waits (`waitForTimeout`) — waits for conditions only |
| A-02 | Role/label locators first; CSS classes only without an accessible alternative |
| A-03 | Test data is created by the test (unique email), seed data is not modified |
| A-04 | No hard-coded environment URLs — uses `baseURL` / env variables |
| A-05 | Tags (`@smoke`, `@regression`, `@api`, `@a11y`, `@known-defect`) and `testCase` / `requirement` annotations are set |
| A-06 | Known defects are marked with `test.fail()` / `@Disabled` **and** an issue id |
| A-07 | Assertions check the requirement, not the current (possibly wrong) behaviour |
| A-08 | The test fails when the feature is broken (try it: would it catch the defect?) |
