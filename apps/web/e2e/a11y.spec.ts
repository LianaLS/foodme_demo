import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Non-functional test (ISO/IEC 25010 usability — accessibility), REQ-NF-02, TC-32.
// Checklist: qa/03-design/checklists/accessibility-checklist.md (A11Y-01).
// axe finds only part of the WCAG issues; the manual checklist is still needed.

const pages: { name: string; open: (page: Page) => Promise<void> }[] = [
  {
    name: "home",
    open: async (page) => {
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    },
  },
  {
    name: "explore",
    open: async (page) => {
      await page.goto("/explore");
      await expect(page.locator("a.cc_card").first()).toBeVisible();
    },
  },
  {
    name: "chef",
    open: async (page) => {
      await page.goto("/explore");
      await page.locator("a.cc_card").first().click();
      // The chef page waits for the chef API (simulated latency + Render cold start).
      await expect(page.locator("button.dc_card").first()).toBeVisible({ timeout: 15_000 });
    },
  },
  {
    name: "checkout (empty cart)",
    open: async (page) => {
      await page.goto("/checkout");
      await expect(page.getByRole("heading", { name: "Nothing to check out" })).toBeVisible();
    },
  },
  {
    name: "login",
    open: async (page) => {
      await page.goto("/login");
      await expect(page.getByRole("button", { name: "Sign in" }).last()).toBeVisible();
    },
  },
];

test.describe("Accessibility (axe-core, WCAG 2.1 A/AA)", { tag: ["@a11y"] }, () => {
  for (const { name, open } of pages) {
    test(
      `${name} page has no critical or serious violations`,
      {
        annotation: [
          { type: "testCase", description: "TC-32" },
          { type: "requirement", description: "REQ-NF-02" },
        ],
      },
      async ({ page }, testInfo) => {
        await open(page);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();

        await testInfo.attach("axe-results.json", {
          body: JSON.stringify(results.violations, null, 2),
          contentType: "application/json",
        });

        const blocking = results.violations
          .filter((v) => v.impact === "critical" || v.impact === "serious")
          .map((v) => `${v.impact}: ${v.id} (${v.nodes.length} nodes) — ${v.help}`);
        expect(blocking, blocking.join("\n")).toEqual([]);
      },
    );
  }
});
