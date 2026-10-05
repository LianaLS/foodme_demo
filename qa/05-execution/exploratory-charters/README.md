# Exploratory Testing — Charters and Session Sheets

**ISTQB:** CTFL 4.4.2 — exploratory testing, session-based test management (SBTM).

Exploratory testing = learning, test design and execution **at the same time**.
It is not random clicking: every session has a **charter** (mission), a
**time box**, and ends with a **session sheet** that records what was covered,
what was found and what is left. Use it where specifications are weak, under
time pressure, and to complement scripted tests (testing quadrant Q3).

## Charter format

> **Explore** ‹target› **with** ‹resources / techniques› **to discover** ‹information›.

## Charters

| ID | Charter | Time box | Priority | Risk | Source |
|---|---|---|---|---|---|
| [EC-01](EC-01-checkout-robustness.md) | Explore **checkout** with slow network, double clicks and browser navigation to discover duplicate or lost orders | 45 min | High | RSK-03, RSK-01 | EG-01, EG-02 |
| [EC-02](EC-02-backoffice-to-storefront.md) | Explore **back-office changes** (dish/chef edits, status changes) to discover what the storefront and an open cart do with them | 45 min | Medium | RSK-10 | EG-20, REQ-18 |
| [EC-03](EC-03-api-security.md) | Explore the **public and admin API** with tokens of different roles to discover data that leaks to the wrong user | 30 min | High | RSK-08 | EG-15, EG-19, TC-25 |

## How to run a session

1. Copy [session-sheet-template.md](session-sheet-template.md) to `qa/05-execution/sessions/<date>-<charter>.md`.
2. Start a timer. Stay inside the charter; write new ideas as **"new charter"** notes instead of following them.
3. Log every defect with the `bug-report` skill; write the Jira key in the sheet.
4. After the session, debrief: what was covered, how confident are we, what needs another session.
