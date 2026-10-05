import { test, expect } from "@playwright/test";
import { activeChefs } from "./api-helpers";

// Test design: qa/03-design/ep-bva.md §4 (BVA) and decision-tables.md DT-1.
// Seed data: delivery price 500, free delivery from 5000 for every chef.

async function deliveryPrice(
  request: import("@playwright/test").APIRequestContext,
  chefId: number,
  subtotal: number,
  deliveryMethod: "DELIVERY" | "TAKEAWAY",
) {
  const res = await request.post("/api/order/delivery-price", {
    data: { chefId, subtotal, deliveryMethod },
  });
  expect(res.ok()).toBeTruthy();
  return res.json() as Promise<{ deliveryPrice: number; freeDeliveryFrom: number }>;
}

test.describe("Delivery price API", { tag: ["@api", "@regression"] }, () => {
  let chefId: number;
  let threshold: number;
  let fee: number;

  test.beforeAll(async ({ request }) => {
    const chef = (await activeChefs(request))[0] as unknown as {
      id: number;
      deliveryPrice: number;
      freeDeliveryFrom: number;
    };
    chefId = chef.id;
    threshold = chef.freeDeliveryFrom;
    fee = chef.deliveryPrice;
    expect(fee).toBeGreaterThan(0);
  });

  test(
    "DT-1 R1 / BVA: subtotal just below the threshold pays the delivery fee",
    { annotation: [{ type: "testCase", description: "TC-19" }, { type: "requirement", description: "REQ-07" }] },
    async ({ request }) => {
      const body = await deliveryPrice(request, chefId, threshold - 1, "DELIVERY");
      expect(body.deliveryPrice).toBe(fee);
    },
  );

  test.fail(
    "DT-1 R2 / BVA: subtotal exactly at the threshold gets free delivery",
    {
      tag: ["@known-defect"],
      annotation: [
        { type: "testCase", description: "TC-19" },
        { type: "requirement", description: "REQ-07" },
        { type: "issue", description: "FM-BUG-03 — threshold compared with > instead of >=" },
      ],
    },
    async ({ request }) => {
      const body = await deliveryPrice(request, chefId, threshold, "DELIVERY");
      expect(body.deliveryPrice).toBe(0);
    },
  );

  test(
    "DT-1 R2: subtotal above the threshold gets free delivery",
    { annotation: [{ type: "testCase", description: "TC-19" }, { type: "requirement", description: "REQ-07" }] },
    async ({ request }) => {
      const body = await deliveryPrice(request, chefId, threshold + 1, "DELIVERY");
      expect(body.deliveryPrice).toBe(0);
    },
  );

  test(
    "DT-1 R3: takeaway is free below and above the threshold",
    { annotation: [{ type: "testCase", description: "TC-20" }, { type: "requirement", description: "REQ-07" }] },
    async ({ request }) => {
      for (const subtotal of [1000, threshold + 1000]) {
        const body = await deliveryPrice(request, chefId, subtotal, "TAKEAWAY");
        expect(body.deliveryPrice, `subtotal ${subtotal}`).toBe(0);
      }
    },
  );
});
