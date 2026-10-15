---
name: guide
description: Step 11 of the functional testing workflow. Runs the guide-writer subagent to get a short guide in plain Armenian (written by Gemini, checked against the test results), shows it to the human, and after the human's approval posts it as a comment on the feature's Jira issue. Use when the testing of a feature is done and the team needs a guide.
---

# Guide (step 11)

## Input
- The feature key (for example `SCRUM-9`) — it is also the Jira issue the guide is posted to, unless the human names another issue.

## Steps
1. **Write the guide**: run the `guide-writer` subagent with the feature key. Wait for its result: the path of `guide.md`, its text, the corrections it made to Gemini's text, and the facts it could not confirm.
2. **Show the human** the full guide, then the corrections and the unconfirmed facts in a short list.
3. **Wait for the human's decision** (human in the loop):
   - "approve" → go to step 4;
   - changes requested → make exactly those changes in `guide.md` (or run the subagent again if the human asks for a new version), show the result, and wait again;
   - "stop" → stop without posting.
4. **Post** the approved text of `guide.md` as one comment on the Jira issue, through the Atlassian MCP, with the heading "Ուղեցույց — <feature key>".
5. **Record** in `guide.md`, under the text: approved by (the human), date, Jira comment ID.

## Rules
- Never post before the human's explicit approval, and post only the approved text — no changes after approval.
- Jira only through the Atlassian MCP tools; no curl, REST calls, scripts, API tokens or browser. If the MCP is not available, stop and tell the human.
- One comment per approved guide. If a guide was already posted for this feature, ask the human whether to post a new comment or edit the existing one.

## Finish
Tell the human the Jira comment ID and link, and the path of `guide.md`.
