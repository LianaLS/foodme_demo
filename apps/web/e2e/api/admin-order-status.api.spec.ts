import { test, expect } from "@playwright/test";
import { adminToken, createOrderForAdmin, setStatus } from "./api-helpers";

// Test design: qa/03-design/state-transitions.md ST-1, sequences S1–S4.
// Every test creates its own order, so the seed data is never changed.

test.describe("Admin order status workflow", { tag: ["@api", "@regression"] }, () => {
  let admin: string;

  test.beforeAll(async ({ request }) => {
    admin = await adminToken(request);
  });

  const valid = [
    { seq: "S1", path: ["ACCEPTED", "DELIVERED"] },
    { seq: "S2", path: ["REJECTED"] },
    { seq: "S3", path: ["ACCEPTED", "REJECTED"] },
  ];

  for (const { seq, path } of valid) {
    test(
      `${seq}: NEW -> ${path.join(" -> ")} is allowed`,
      { annotation: [{ type: "testCase", description: "TC-27" }, { type: "requirement", description: "REQ-16" }] },
      async ({ request }) => {
        const { id } = await createOrderForAdmin(request, admin);
        for (const status of path) {
          const res = await setStatus(request, admin, id, status);
          expect(res.status(), `-> ${status}`).toBe(200);
          expect((await res.json()).status).toBe(status);
        }
      },
    );
  }

  const invalid = [
    { seq: "S4", setup: [], target: "DELIVERED", from: "NEW" },
    { seq: "S1", setup: ["ACCEPTED", "DELIVERED"], target: "REJECTED", from: "DELIVERED" },
    { seq: "S2", setup: ["REJECTED"], target: "ACCEPTED", from: "REJECTED" },
  ];

  for (const { seq, setup, target, from } of invalid) {
    test(
      `${seq}: ${from} -> ${target} is rejected and the status does not change`,
      { annotation: [{ type: "testCase", description: "TC-28" }, { type: "requirement", description: "REQ-16" }] },
      async ({ request }) => {
        const { id } = await createOrderForAdmin(request, admin);
        for (const status of setup) {
          expect((await setStatus(request, admin, id, status)).status()).toBe(200);
        }

        const res = await setStatus(request, admin, id, target);
        expect(res.status()).toBe(400);
        expect((await res.json()).message).toBe(`Cannot transition order from ${from} to ${target}`);

        const after = await request.get(`/admin/order/${id}`, { headers: { Authorization: `Bearer ${admin}` } });
        expect((await after.json()).status).toBe(from);
      },
    );
  }
});
