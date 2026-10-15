---
name: report
description: Step 10 of the functional testing workflow. Collects the outputs of steps 01–08 and 11 for a feature (requirements, plan, test cases, judge verdicts, manual execution, automation, automated run results, defects, guide) and writes report.html — an ISTQB test completion report (ISO/IEC/IEEE 29119-3) with measured numbers, exit criteria and a recommendation. Use when the testing of a feature is finished.
---

# Report (step 10)

## Input
- The feature key (for example `SCRUM-9`).
- Everything in `workflows/functional-testing/runs/<feature-key>/`: `spec.yaml`, `plan.md`, `test_cases.yaml`, `case_verdict.json`, `execution.md`, `automation.yaml`, `test_verdict.json`, `results.json`, `guide.md`.
- If `execution.md` or `results.json` is missing, stop and tell the human — steps 05 or 08 are not finished. Other missing files are reported as "not done".

## Steps
1. Read every input file. Take numbers only from these files; never estimate or invent a number. Write "not run" or "not done" where something is missing.
2. Build these sections:
   1. **Summary** — what was tested, the build, the dates, the overall result in three lines, and the recommendation.
   2. **Test basis** — requirements in scope / out of scope, gaps answered, approved requirement changes (with Jira comment IDs).
   3. **Plan** — risks by level, devices, test levels.
   4. **Test cases** — number, by priority, level and technique; case judge rounds and verdicts.
   5. **Manual execution** — passed / failed / blocked, requirement coverage, failed and blocked cases with reasons.
   6. **Automation** — automated cases, test judge verdict and its main findings, the automated run result from `results.json` (per test: expected vs. actual status, duration), and how to run it again.
   7. **Defects** — each defect with key, severity, priority and status; testware issues; other observations outside the scope.
   8. **Exit criteria** — each criterion from the plan with met / not met and the evidence.
   9. **Risks still open** and **recommendation** for the release decision, based only on the facts above.
   10. **Traceability and links** — where each artifact is (repository paths, Qase project and suite, Jira keys).
3. Write `workflows/functional-testing/runs/<feature-key>/report.html`: one self-contained HTML file (inline CSS, no external scripts), readable on a phone and on a desktop, in light and dark mode.

## Rules
- Only measured facts from the input files. Every number must be traceable to a file.
- Do not change any input file, test, test case or Jira issue.
- Write the report in English (testware language). Names and texts from the application stay exactly as they are.

## Finish
Tell the human the path of `report.html`, the overall result, the recommendation and the exit criteria that are not met.
