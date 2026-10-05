---
name: exploratory-session
description: Plan, guide and document a time-boxed exploratory testing session (session-based test management, ISTQB CTFL 4.4.2) for FoodMe — write a charter, suggest test ideas and heuristics, and fill in a session sheet with notes, defects and new charter ideas. Use when the user wants to do exploratory testing, an exploratory session, a charter, "ազատ թեստավորում", "exploratory", "session sheet", or wants to explore a feature without a written spec.
---

# Exploratory session (ISTQB CTFL 4.4.2, SBTM)

Talk to the user in their language; write the charter and session sheet in English.

Files: `qa/05-execution/exploratory-charters/` (charters, template), `qa/05-execution/sessions/` (filled session sheets).

## Workflow

1. **Charter.** Reuse an existing `EC-xx` or write a new one: *Explore ‹target› with ‹resources/techniques› to discover ‹information›*. Add time box (30–60 min), priority, risk and requirement ids. Save it as `EC-xx-<slug>.md` and add it to the charters README.
2. **Ideas.** Offer 6–10 concrete starting ideas from: `qa/03-design/error-guessing.md`, the checklists in `qa/03-design/checklists/`, known risks, and tours (data tour, back-button tour, interruption tour, configuration tour). Ideas are a starting point, not a script.
3. **During the session** (the user drives; help when asked): note what was tried, keep the user inside the charter, park off-charter ideas as new charters. When the user finds a problem, help reproduce it and file it with the `bug-report` skill.
4. **Session sheet.** Copy `session-sheet-template.md` to `qa/05-execution/sessions/<yyyy-mm-dd>-EC-xx.md` and fill it: time split, notes, defects with Jira keys, questions, new charter ideas, debrief (covered / not covered / confidence).
5. **Follow-up.** Offer to turn valuable findings into scripted test cases with the `test-design` skill.
