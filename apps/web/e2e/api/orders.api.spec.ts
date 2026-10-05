import { test, expect } from "@playwright/test";
import {
  activeChefs,
  findDish,
  placeOrder,
  registerCustomer,
  takeawayOrder,
  type Chef,
} from "./api-helpers";

// Test design: qa/03-design/ep-bva.md §5 (quantity), error-guessing.md EG-05..EG-08.
// TAKEAWAY orders are used so the delivery fee does not affect the total.

test.describe("Orders API", { tag: ["@api", "@regression"] }, () => {
  let chefs: Chef[];
  let token: string;

  test.beforeAll(async ({ request }) => {
    chefs = await activeChefs(request);
    ({ token } = await registerCustomer(request));
  });

  test(
    "total = dish price x quantity for a dish without additions",
    {
      tag: ["@smoke"],
      annotation: [{ type: "testCase", description: "TC-21" }, { type: "requirement", description: "REQ-10" }],
    },
    async ({ request }) => {
      const dish = findDish(chefs, { withAdditions: false });
      const res = await placeOrder(request, token, takeawayOrder(dish.chefId, [{ dishId: dish.id, quantity: 3 }]));
      expect(res.status()).toBe(200);
      const order = await res.json();
      expect(order.number).toMatch(/^FM-\d{6,}$/);
      expect(order.status).toBe("NEW");
      expect(order.totalPrice).toBe(dish.price * 3);
    },
  );

  test.fail(
    "total = (dish price + addition price) x quantity",
    {
      tag: ["@known-defect"],
      annotation: [
        { type: "testCase", description: "TC-21" },
        { type: "requirement", description: "REQ-10" },
        { type: "issue", description: "FM-BUG-01 — additions are not multiplied by quantity" },
      ],
    },
    async ({ request }) => {
      const dish = findDish(chefs, { withAdditions: true });
      const addition = dish.additions![0];
      const res = await placeOrder(
        request,
        token,
        takeawayOrder(dish.chefId, [{ dishId: dish.id, quantity: 2, additions: [{ additionId: addition.id }] }]),
      );
      expect(res.status()).toBe(200);
      expect((await res.json()).totalPrice).toBe((dish.price + addition.price) * 2);
    },
  );

  for (const quantity of [0, -1, null]) {
    test.fail(
      `quantity ${quantity} is rejected with 400`,
      {
        tag: ["@known-defect"],
        annotation: [
          { type: "testCase", description: "TC-22" },
          { type: "requirement", description: "REQ-11" },
          { type: "issue", description: "FM-BUG-04 — quantity is not validated" },
        ],
      },
      async ({ request }) => {
        const dish = findDish(chefs, { withAdditions: false });
        const res = await placeOrder(request, token, takeawayOrder(dish.chefId, [{ dishId: dish.id, quantity }]));
        expect(res.status()).toBe(400);
      },
    );
  }

  test.fail(
    "a dish from another chef is rejected with 400",
    {
      tag: ["@known-defect"],
      annotation: [
        { type: "testCase", description: "TC-23" },
        { type: "requirement", description: "REQ-11" },
        { type: "issue", description: "FM-BUG-05 — dish ownership is not checked" },
      ],
    },
    async ({ request }) => {
      const [chefA, chefB] = chefs.filter((c) => c.dishes?.length);
      const res = await placeOrder(
        request,
        token,
        takeawayOrder(chefA.id, [{ dishId: chefB.dishes[0].id, quantity: 1 }]),
      );
      expect(res.status()).toBe(400);
    },
  );

  test(
    "a non-existent dish returns 404",
    { annotation: [{ type: "testCase", description: "TC-23" }, { type: "requirement", description: "REQ-11" }] },
    async ({ request }) => {
      const chefId = chefs[0].id;
      const res = await placeOrder(request, token, takeawayOrder(chefId, [{ dishId: 999999, quantity: 1 }]));
      expect(res.status()).toBe(404);
    },
  );

  test(
    "a payment type other than CASH is rejected",
    { annotation: [{ type: "testCase", description: "TC-24" }, { type: "requirement", description: "REQ-10" }] },
    async ({ request }) => {
      const dish = findDish(chefs, { withAdditions: false });
      const body = { ...takeawayOrder(dish.chefId, [{ dishId: dish.id, quantity: 1 }]), paymentType: "CARD" };
      const res = await placeOrder(request, token, body);
      expect(res.status()).toBe(400);
      expect((await res.json()).message).toBe("Only CASH payment is supported");
    },
  );
});
