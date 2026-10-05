import { test, expect } from "@playwright/test";
import { registerCustomer } from "./api-helpers";

// Test design: qa/03-design/error-guessing.md EG-14, EG-16; checklists/api-checklist.md API-10, API-12.

test.describe("Access control", { tag: ["@api", "@regression"] }, () => {
  const protectedCalls = [
    { name: "POST /api/order", method: "post", url: "/api/order" },
    { name: "GET /api/customer/me", method: "get", url: "/api/customer/me" },
    { name: "GET /api/customer/orders", method: "get", url: "/api/customer/orders" },
    { name: "GET /admin/order", method: "get", url: "/admin/order" },
    { name: "GET /admin/chef", method: "get", url: "/admin/chef" },
  ] as const;

  for (const call of protectedCalls) {
    test(
      `${call.name} without a token returns 401`,
      {
        tag: ["@smoke"],
        annotation: [
          { type: "testCase", description: "TC-25" },
          { type: "requirement", description: "REQ-NF-03" },
        ],
      },
      async ({ request }) => {
        const res = await request[call.method](call.url, call.method === "post" ? { data: {} } : undefined);
        expect(res.status()).toBe(401);
      },
    );
  }

  // New defect found 2026-10-05 (not yet in Jira): /admin/** only checks that a
  // token is present, not the ADMIN role. Stays red until the defect is logged;
  // then switch to test.fail with the Jira key.
  test(
    "a customer token cannot read admin orders",
    {
      annotation: [
        { type: "testCase", description: "TC-25" },
        { type: "requirement", description: "REQ-NF-03" },
      ],
    },
    async ({ request }) => {
      const { token } = await registerCustomer(request);
      const res = await request.get("/admin/order", { headers: { Authorization: `Bearer ${token}` } });
      expect([401, 403]).toContain(res.status());
    },
  );

  test(
    "4xx error bodies do not expose a stack trace",
    { annotation: [{ type: "testCase", description: "TC-25" }, { type: "requirement", description: "REQ-NF-03" }] },
    async ({ request }) => {
      const notFound = await request.get("/api/chef/99999");
      expect(notFound.status()).toBe(404);
      const body = await notFound.json();
      expect(body.message).toBe("Chef 99999 not found");
      expect(body.trace ?? null).toBeNull();
    },
  );
});
