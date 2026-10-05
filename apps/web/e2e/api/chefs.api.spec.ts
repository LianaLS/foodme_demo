import { test, expect } from "@playwright/test";

// Test design: qa/03-design/ep-bva.md §7 (page size boundaries around `count`).

test.describe("Active chefs API", { tag: ["@api", "@regression"] }, () => {
  test.fail(
    "every active chef is returned across all pages",
    {
      tag: ["@known-defect"],
      annotation: [
        { type: "testCase", description: "TC-26" },
        { type: "requirement", description: "REQ-01" },
        { type: "issue", description: "FM-BUG-02 — the last item of the last page is dropped" },
      ],
    },
    async ({ request }) => {
      const first = await (await request.get("/api/chef/active?page=0&size=12")).json();
      const count: number = first.count;
      expect(count).toBeGreaterThan(1);

      for (const size of [1, count - 1, count, 12]) {
        const ids: number[] = [];
        for (let page = 0; page * size < count; page++) {
          const body = await (await request.get(`/api/chef/active?page=${page}&size=${size}`)).json();
          ids.push(...body.exploreChefResponseDtoList.map((c: { id: number }) => c.id));
        }
        expect(ids.length, `page size ${size}`).toBe(count);
      }
    },
  );

  // New defect found 2026-10-05 (not yet in Jira): GET /api/chef/32 returns 500
  // (NullPointerException on a dish with no Armenian name). Stays red until the
  // defect is logged; then switch to test.fail with the Jira key.
  test(
    "every active chef page loads",
    {
      tag: ["@smoke"],
      annotation: [{ type: "testCase", description: "TC-01" }, { type: "requirement", description: "REQ-02" }],
    },
    async ({ request }) => {
      const body = await (await request.get("/api/chef/active?page=0&size=50")).json();
      for (const { id } of body.exploreChefResponseDtoList as { id: number }[]) {
        const res = await request.get(`/api/chef/${id}`);
        expect.soft(res.status(), `GET /api/chef/${id}`).toBe(200);
      }
    },
  );

  test(
    "an unknown chef id returns 404",
    {
      tag: ["@smoke"],
      annotation: [{ type: "testCase", description: "TC-02" }, { type: "requirement", description: "REQ-02" }],
    },
    async ({ request }) => {
      const res = await request.get("/api/chef/99999");
      expect(res.status()).toBe(404);
    },
  );
});
