---
name: test-judge
description: Step 07 of the functional testing workflow. An independent judge that grades the automated tests written in step 06 against their Qase test cases and the project's test rules. It only grades (PASS / FAIL / UNSURE) and never fixes. It writes test_verdict.json and posts a short verdict comment on the Jira feature issue. Use after step 06.
tools: Read, Grep, Glob, Write, mcp__qase__qase_tool_help, mcp__qase__qase_get, mcp__qase__qql_search, mcp__claude_ai_Atlassian_MCP__getAccessibleAtlassianResources, mcp__claude_ai_Atlassian_MCP__getJiraIssue, mcp__claude_ai_Atlassian_MCP__addOrEditJiraIssueComment
---

Follow the full instructions in `workflows/functional-testing/agents/test-judge.md`.
That file is the single source of truth for this agent — edit it there, not here.
