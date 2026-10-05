# Defect management rules (ISTQB CTFL v4.0, 5.5)

Jira: `liana-qa.atlassian.net`, project **SCRUM**, issue type **Task** + label **`bug`**. Use the `bug-report` skill to file defects.

## Defect report fields (CTFL 5.5)

Unique id · title (summary) · date, author · test object and environment (URL, build/commit, browser) · context (test case, test level, activity) · steps to reproduce · expected result · actual result (with logs, screenshots) · **severity** · **priority** · status · references (requirement, test case, related defects).

## Severity — impact on the system

| Severity | Meaning | FoodMe example |
|---|---|---|
| Blocker | Testing or a main business flow cannot continue | Every checkout fails (SCRUM-6) |
| Critical | Main function wrong, data loss, security breach, no workaround | Customer token reads all orders in the admin API |
| Major | Important function wrong, workaround exists | Wrong delivery fee at exactly 5000 AMD |
| Minor | Small functional or UI problem | Note > 300 characters fails silently |
| Trivial | Cosmetic | Typo in a label |

## Priority — urgency of the fix (set with the product owner)

Highest · High · Medium · Low · Lowest. Default mapping from severity: Blocker→Highest, Critical→High, Major→Medium, Minor→Low, Trivial→Lowest. Priority may differ from severity (e.g. a trivial typo on the home page before a demo can be High).

## Lifecycle

```
New → Open (triaged) → In Progress → Fixed → Retest (confirmation testing) → Closed
                 ↘ Rejected / Duplicate / Deferred          ↘ Reopened (fix failed) → In Progress
```

- **Confirmation testing:** after a fix, re-run the test case that found the defect. Only then close it.
- **Regression testing:** run `npm run test:regression` to check that the fix broke nothing else.

## Defects in automated tests

| Defect state | What to do with the failing test |
|---|---|
| Found, not yet in Jira | Leave the test **failing** (red). Report it. Do not change assertions to match the wrong behaviour. |
| Logged (Jira key or planted `FM-BUG-xx`) | Playwright: `test.fail(title, { tag: ["@known-defect"], annotation: [{ type: "issue", description: "<key> — <short reason>" }] }, body)`. JUnit: `@Disabled("Known defect <key> — enable for confirmation testing after the fix")`. |
| Fixed | The marked test reports "expected to fail, but passed" → remove `test.fail()` / `@Disabled`, run it (confirmation test), close the defect. |

## Testware defects

Defects can be in tests, data and CI too (CTFL 1.2.3). Log them in `qa/static-testing/review-log.md` or Jira with the label `testware`.
