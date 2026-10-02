// PreToolUse hook: blocks adding page.waitForTimeout() to Playwright e2e tests.
const fs = require("fs");

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  const { tool_name, tool_input = {} } = JSON.parse(input || "{}");
  const filePath = (tool_input.file_path || "").replace(/\\/g, "/");

  // Only check e2e test files
  if (!/\/e2e\/.*\.(spec|test)\.[jt]sx?$/.test(filePath)) process.exit(0);

  const count = (s) => ((s || "").match(/waitForTimeout\s*\(/g) || []).length;
  let before = 0;
  let after = 0;

  if (tool_name === "Write") {
    try { before = count(fs.readFileSync(tool_input.file_path, "utf8")); } catch {}
    after = count(tool_input.content);
  } else if (tool_name === "Edit") {
    before = count(tool_input.old_string);
    after = count(tool_input.new_string);
  } else if (tool_name === "MultiEdit") {
    for (const e of tool_input.edits || []) {
      before += count(e.old_string);
      after += count(e.new_string);
    }
  }

  // Block only when the change ADDS new waits (existing intentional flaky waits are left alone)
  if (after > before) {
    console.error(
      "BLOCKED: page.waitForTimeout() is not allowed in e2e tests " +
      "(fixed waits make tests flaky and slow). Wait for a condition instead: " +
      "await expect(locator).toBeVisible(), expect(page).toHaveURL(...), or page.waitForResponse(...)."
    );
    process.exit(2);
  }
  process.exit(0);
});
