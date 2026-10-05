---
name: test-design
description: Design test cases for a FoodMe feature, field, API endpoint or user story the ISTQB way — test basis → test conditions → technique (equivalence partitioning, boundary value analysis, decision table, state transition, error guessing) → test cases with traceability — and optionally automate them. Use whenever the user asks to write, design, create or add test cases or tests ("թեստ քեյսեր գրիր", "թեստեր ավելացրու", "test design", "BVA", "decision table"), wants to test a form, a field, a calculation, a status workflow or an endpoint, or asks what to test for a feature.
---

# Test design (ISTQB CTFL v4.0, chapter 4)

You help a QA engineer produce test cases that a reviewer can trace and justify: every test case says **which requirement** it checks, **which risk** it reduces and **which technique** produced its values.

Talk to the user in their language (usually Armenian). Write testware in English.

Read first: `.agents/rules/test-design.md`, `.agents/rules/test-documentation.md`, and for automation `.agents/rules/e2e-tests.md`.

## Workflow

### 1. Test basis
Find the feature in `qa/02-analysis/requirements.md`. Read the code that implements it (validation annotations in `apps/backend/.../dto`, zod schemas in `apps/web/src/schemas`, services). If the requirement is missing or vague, draft it with acceptance criteria (Given/When/Then) and mark open points **[Assumption]** — show these to the user.

### 2. Risk and depth
Look up the risk in `qa/01-planning/risk-register.md` (add one if missing). High → several techniques + automation at component/API **and** UI level. Medium → EP + BVA or decision table, one automation level. Low → checklist/exploratory.

### 3. Test conditions
Add rows to `qa/02-analysis/test-conditions.md` (next free `TCOND-xx`).

### 4. Apply techniques
Write the design in the matching file in `qa/03-design/` — show the partitions, boundary values, decision table columns or state table, and the coverage you reach:
- input fields / ranges → EP + 2-value BVA (`ep-bva.md`)
- combinations → decision table (`decision-tables.md`)
- statuses → state transition (`state-transitions.md`)
- typical mistakes → `error-guessing.md`

### 5. Test cases
Append to `qa/test-cases.md` (next free `TC-xx`), using the existing format and all fields. Add a row to the summary table.

### 6. Traceability
Update `qa/04-implementation/traceability-matrix.md`.

### 7. Automate (if the user wants it)
Pick the lowest level that can catch the defect (see the pyramid table in `test-design.md`). Add tags and `testCase` / `requirement` annotations. Run the new tests and report the real result. A failing test against an unlogged defect stays red; offer to file it with the `bug-report` skill.

### 8. Report back
Short summary: conditions, technique and coverage, new TC ids, automated tests and their result, open [Assumption] questions.
