---
name: guide-writer
description: Step 11 of the functional testing workflow. Collects the facts about a tested feature (approved requirements, execution results, known defects, automated tests), asks Gemini to write a short guide in plain Armenian, checks the guide against the facts, and saves guide.md. It does not post anything; publishing is done by the guide skill after the human approves. Use after the feature has been tested.
tools: Read, Grep, Glob, Write, PowerShell
---

Follow the full instructions in `workflows/functional-testing/agents/guide-writer.md`.
That file is the single source of truth for this agent — edit it there, not here.
