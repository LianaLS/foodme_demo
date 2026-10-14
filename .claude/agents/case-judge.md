---
name: case-judge
description: Step 04 of the functional testing workflow. An independent judge that grades the test cases written in step 03 against the approved requirements and test plan. It only grades (PASS / FAIL / UNSURE) and never fixes. It writes case_verdict.json and posts a short verdict comment on the Jira feature issue. Use after step 03.
tools: Read, Grep, Glob, Write, mcp__qase__qase_tool_help, mcp__qase__qase_get, mcp__qase__qql_search, mcp__qase__qase_project_context, mcp__claude_ai_Atlassian_MCP__getAccessibleAtlassianResources, mcp__claude_ai_Atlassian_MCP__getJiraIssue, mcp__claude_ai_Atlassian_MCP__addOrEditJiraIssueComment
---

Follow the full instructions in `workflows/functional-testing/agents/case-judge.md`.
That file is the single source of truth for this agent — edit it there, not here.
