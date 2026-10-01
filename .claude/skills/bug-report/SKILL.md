---
name: bug-report
description: File a well-structured bug report in Jira (Atlassian) using a standard QA template — Summary, Steps to reproduce, Expected result, Actual result, Environment, Severity/Priority, Console errors, attachments — after checking for duplicates. Use this skill whenever the user wants to report, log, file, open or create a bug, defect, issue or ticket in Jira, describes something broken they found while testing (an error in the console, a page that hangs, a failed checkout, a wrong value), or says things like "բացիր բագ", "գրանցիր բագ", "Jira-ում բագ ստեղծիր", "բագ ռեպորտ", even if they only paste an error message and a short description.
---

# Bug report

You are helping a QA engineer turn what they observed into a Jira issue that a developer can pick up and reproduce without asking follow-up questions. A good bug report saves a round-trip: the developer reads it once and knows exactly what to do, what "fixed" looks like, and where to look.

The user usually writes in Armenian. Talk to them in the language they use. Write the Jira issue itself in English (Summary and section headings), because tickets are read by the whole team — unless the user asks for another language.

## Default Jira target

- Site: `liana-qa.atlassian.net` — get the `cloudId` once with `getAccessibleAtlassianResources`.
- Project: **QA Testing**, key **`SCRUM`**.
- The SCRUM project has **no "Bug" issue type** (only Epic, Subtask, Task, Story). Create bugs as **Task** with the label **`bug`**. If a create with `issueType: "Bug"` is ever needed for another project, check its types first (`getJiraProjectIssueTypesMetadata`) rather than guessing.
- If the user names a different project, use that one and check its issue types the same way.

## Workflow

### 1. Collect the facts

Pull everything you can from what the user already gave you (their message, a pasted console error, a screenshot, the code in the current project). Only ask about what is genuinely missing *and* matters for reproduction — typically steps to reproduce or expected behavior. Ask all missing questions in one message, not one by one.

If the bug lives in a project you have open (e.g. the error text can be found with Grep), it's useful to locate the source line and mention it under "Additional notes" — developers appreciate a pointer, but keep it factual ("thrown at `apps/web/src/pages/Checkout/index.tsx:52`"), not a diagnosis you can't back up.

If the user asks you to reproduce the bug yourself in a browser, do it and record the real steps, console output and a screenshot.

### 2. Check for duplicates

Before creating anything, search the project for open issues that already describe the same problem — search by the key error text and by the main keywords of the summary:

```
searchJiraIssuesUsingJql: project = SCRUM AND statusCategory != Done AND (summary ~ "<keywords>" OR description ~ "<error text>") ORDER BY created DESC
```

If you find a likely duplicate, show it to the user (key, summary, status, link) and ask whether to add a comment to it instead of creating a new issue. Creating duplicates clutters the backlog and splits discussion, so this check is worth the extra call. If nothing matches, go ahead.

### 3. Write the report

**Summary** — one line, under ~80 characters, of the form *"<Where>: <what goes wrong> [<when>]"*. Describe the symptom, not a guess at the cause.
- Good: `Checkout: order placement hangs with "Order processing failed" error`
- Bad: `Bug in checkout`, `Fix the throw in handleSubmit`

**Description** — use this template (Markdown; it's converted to Jira format automatically). Omit a section only if it truly doesn't apply; don't pad with "N/A" everywhere.

~~~markdown
## Steps to reproduce
1. …
2. …
3. …

## Expected result
…

## Actual result
…

## Environment
- URL / build: …
- Browser / OS: …
- User / role: … (if relevant)

## Console / logs
```
<exact error text, stack trace if available>
```

## Severity
<Blocker | Critical | Major | Minor | Trivial> — <one-line justification>

## Additional notes
<frequency (always / sometimes), workaround, related issues, source-code pointer>
~~~

**Severity vs Priority.** Severity is how bad the impact is; set it in the description with a short reason (e.g. "Critical — users cannot place any order"). Map it to Jira's `priority` field: Blocker→Highest, Critical→High, Major→Medium, Minor→Low, Trivial→Lowest. If the project rejects the priority field, drop it and keep severity in the description.

### 4. Confirm, then create

Show the user the draft (summary, severity, and the description) and wait for a "yes" before calling `createJiraIssue` — the ticket is visible to the whole team, so it's worth a quick look. If the user already said something like "just create it" / "ուղղակի ստեղծիր", skip the confirmation.

Create with:
- `projectKey`: `SCRUM`
- `issueType`: `Task` (see note above)
- `labels`: `["bug"]` plus any the user asks for
- `priority`: mapped from severity
- `summary`, `description` from step 3

If the user gave a screenshot or file, create the issue first and then attach/embed it (inline media needs an existing issue — use `editJiraIssue`). If attaching isn't possible, say so and tell the user to drag it into the ticket.

### 5. Report back

Reply briefly with the issue key as a link (`https://liana-qa.atlassian.net/browse/SCRUM-N`), the summary, and anything you couldn't do (e.g. the attachment). Don't repeat the whole description back.

## Example

User: «Checkout-ում պատվերը չի անցնում, console-ում գրում է Uncaught Error: Simulated bug: Order processing failed!»

Resulting issue:
- **Summary:** `Checkout: order placement hangs with "Order processing failed" error`
- **Labels:** `bug` · **Priority:** High
- **Description:**
  - Steps: 1. Sign in 2. Add any dish to cart 3. Go to Checkout 4. Fill in the form 5. Click "Place order"
  - Expected: order is created, confirmation shown
  - Actual: page stays in submitting state, no order created
  - Console: `Uncaught Error: Simulated bug: Order processing failed!`
  - Severity: Critical — no user can complete an order
  - Notes: reproduces every time; error thrown in `handleSubmit` (`apps/web/src/pages/Checkout/index.tsx:52`)
