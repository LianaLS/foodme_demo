import { test, expect, type APIRequestContext } from "@playwright/test";
import {
  activeChefs,
  adminToken,
  findDish,
  placeOrder,
  registerCustomer,
  setStatus,
  takeawayOrder,
} from "./api-helpers";

// SCRUM-7 Order Ratings — test basis: order-ratings.spec.md (R1–R27, AC1–AC7).
// Every test creates its own customer and order, so the seed data is never changed.

const NOT_DELIVERED = "Only delivered orders can be reviewed.";
const ALREADY_REVIEWED = "Order already reviewed.";
const BAD_STARS = "Rating must be a whole number from 1 to 5";

async function orderInStatus(request: APIRequestContext, admin: string, path: string[]) {
  const chefs = await activeChefs(request);
  const dish = findDish(chefs, { withAdditions: false });
  const { token } = await registerCustomer(request);
  const res = await placeOrder(request, token, takeawayOrder(dish.chefId, [{ dishId: dish.id, quantity: 1 }]));
  expect(res.ok()).toBeTruthy();
  const { number } = await res.json();

  const list = await request.get("/admin/order?page=0&size=50&status=NEW", {
    headers: { Authorization: `Bearer ${admin}` },
  });
  const id = ((await list.json()).list as { id: number; number: string }[]).find((o) => o.number === number)!.id;
  for (const status of path) {
    expect((await setStatus(request, admin, id, status)).status(), `-> ${status}`).toBe(200);
  }
  return { id, number: number as string, token, chefId: dish.chefId };
}

function review(request: APIRequestContext, token: string | null, number: string, data: unknown) {
  return request.post(`/api/customer/orders/${number}/review`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    data,
  });
}

test.describe("Order ratings API", { tag: ["@api", "@regression"] }, () => {
  let admin: string;

  test.beforeAll(async ({ request }) => {
    admin = await adminToken(request);
  });

  test(
    "a delivered order can be rated and the rating is shown with the order",
    { annotation: [{ type: "requirement", description: "SCRUM-7 R1, R13, R19 / AC1" }] },
    async ({ request }) => {
      const { id, number, token } = await orderInStatus(request, admin, ["ACCEPTED", "DELIVERED"]);

      const res = await review(request, token, number, { stars: 4, comment: "Tasty" });
      expect(res.status()).toBe(200);
      expect((await res.json()).review).toMatchObject({ stars: 4, comment: "Tasty" });

      const tracking = await request.get(`/api/order/number/${number}`);
      expect((await tracking.json()).review).toMatchObject({ stars: 4, comment: "Tasty" });

      const adminView = await request.get(`/admin/order/${id}`, { headers: { Authorization: `Bearer ${admin}` } });
      const adminReview = (await adminView.json()).review;
      expect(adminReview).toMatchObject({ stars: 4, comment: "Tasty" });
      expect(adminReview.createdAt).toBeTruthy();
    },
  );

  for (const path of [[], ["ACCEPTED"], ["REJECTED"]]) {
    const status = path.at(-1) ?? "NEW";
    test(
      `a ${status} order cannot be rated`,
      { annotation: [{ type: "requirement", description: "SCRUM-7 R8 / AC2" }] },
      async ({ request }) => {
        const { number, token } = await orderInStatus(request, admin, path);
        const res = await review(request, token, number, { stars: 5 });
        expect(res.status()).toBe(400);
        expect((await res.json()).message).toBe(NOT_DELIVERED);
      },
    );
  }

  test(
    "an order can be rated only once",
    { annotation: [{ type: "requirement", description: "SCRUM-7 R4, R9 / AC2" }] },
    async ({ request }) => {
      const { number, token } = await orderInStatus(request, admin, ["ACCEPTED", "DELIVERED"]);
      expect((await review(request, token, number, { stars: 3 })).status()).toBe(200);

      const second = await review(request, token, number, { stars: 5 });
      expect(second.status()).toBe(409);
      expect((await second.json()).message).toBe(ALREADY_REVIEWED);
    },
  );

  test(
    "someone else's order behaves as if it does not exist",
    { annotation: [{ type: "requirement", description: "SCRUM-7 R7 / AC2" }] },
    async ({ request }) => {
      const { number } = await orderInStatus(request, admin, ["ACCEPTED", "DELIVERED"]);
      const { token: stranger } = await registerCustomer(request);

      const res = await review(request, stranger, number, { stars: 5 });
      expect(res.status()).toBe(404);
    },
  );

  test(
    "a visitor who is not signed in cannot rate",
    { annotation: [{ type: "requirement", description: "SCRUM-7 R6 / AC4" }] },
    async ({ request }) => {
      const { number } = await orderInStatus(request, admin, ["ACCEPTED", "DELIVERED"]);
      expect((await review(request, null, number, { stars: 5 })).status()).toBe(401);
    },
  );

  // BVA on stars (valid partition 1..5, whole numbers) and comment length (0..1000).
  for (const stars of [0, 6, 4.5, null]) {
    test(
      `stars = ${stars} is refused`,
      { annotation: [{ type: "requirement", description: "SCRUM-7 R2 / AC3" }] },
      async ({ request }) => {
        const { number, token } = await orderInStatus(request, admin, ["ACCEPTED", "DELIVERED"]);
        const res = await review(request, token, number, { stars });
        expect(res.status()).toBe(400);
        expect((await res.json()).message).toBe(BAD_STARS);
      },
    );
  }

  test(
    "comment of 1001 characters is refused, 1000 is accepted",
    { annotation: [{ type: "requirement", description: "SCRUM-7 R3 / AC3" }] },
    async ({ request }) => {
      const { number, token } = await orderInStatus(request, admin, ["ACCEPTED", "DELIVERED"]);
      expect((await review(request, token, number, { stars: 1, comment: "a".repeat(1001) })).status()).toBe(400);
      expect((await review(request, token, number, { stars: 1, comment: "a".repeat(1000) })).status()).toBe(200);
    },
  );

  test(
    "the chef rating is updated after a rating is saved",
    { annotation: [{ type: "requirement", description: "SCRUM-7 R10, R11, R12 / AC5" }] },
    async ({ request }) => {
      const { number, token, chefId } = await orderInStatus(request, admin, ["ACCEPTED", "DELIVERED"]);
      expect((await review(request, token, number, { stars: 5 })).status()).toBe(200);

      // Other tests rate the same chef in parallel, so the exact average is not
      // predictable here; the backend test checks the arithmetic. Here: it is a
      // 1..5 value with at most one decimal place.
      const rating = (await (await request.get(`/api/chef/${chefId}`)).json()).rating as number;
      expect(rating).toBeGreaterThanOrEqual(1);
      expect(rating).toBeLessThanOrEqual(5);
      expect(Math.round(rating * 10) / 10).toBe(rating);
    },
  );
});
