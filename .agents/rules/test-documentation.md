# Test documentation rules (ISO/IEC/IEEE 29119-3, ISTQB CTFL v4.0)

All testware lives in `qa/`. The folder order follows the ISTQB test process.

| Folder / file | Test activity | Template / content |
|---|---|---|
| `qa/README.md` | Map of all documents | Status of every document |
| `qa/glossary.md` | — | ISTQB terms, EN / HY / RU |
| `qa/01-planning/test-plan.md` | Test planning | ISO 29119-3 Test Plan: objectives, scope, strategy, levels, entry/exit criteria, environment, metrics |
| `qa/01-planning/risk-register.md` | Test planning, monitoring | Product and project risks, likelihood × impact |
| `qa/02-analysis/` | Test analysis | Requirements (test basis), test conditions |
| `qa/03-design/` | Test design | EP/BVA, decision tables, state transitions, error guessing, checklists |
| `qa/test-cases.md`, `qa/04-implementation/` | Test implementation | Test cases, traceability matrix |
| `qa/05-execution/` | Test execution | Exploratory charters, session sheets, run logs |
| `qa/06-reporting/` | Monitoring, control, completion | Test progress report, test completion report |
| `qa/static-testing/` | Static testing | Review checklist, review log |
| `qa/performance/` | Non-functional testing | k6 scripts |

## Rules

- Update the **Status** column in `qa/README.md` when a document is added.
- Every document starts with: ISTQB reference, version, date, author/owner.
- Reports contain **measured numbers** from a real run (command, date, commit). Never write a result that was not observed; write "not run" instead.
- When the app or a requirement changes, update in this order: requirements → risks → test conditions → design → test cases → traceability → automated tests.
- Keep `qa/test-cases.xlsx` in sync with `qa/test-cases.md` when the Excel file is used for a submission; Markdown is the source of truth.
