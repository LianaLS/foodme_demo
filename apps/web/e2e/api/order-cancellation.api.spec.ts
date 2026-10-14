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

// SCRUM-9 Cancel order (KAN-12) — test basis: cancel-order.spec.md (AC-1…AC-5, "Done when").
// Every test creates its own customer and order, so the seed data is never changed.

const ONLY_NEW = "Only new orders can be cancelled.";

async function newOrder(request: APIRequestContext, admin: string) {
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
  return { id, number: number as string, token };
}

function cancel(request: APIRequestContext, token: string | null, number: string) {
  return request.post(`/api/customer/orders/${number}/cancel`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

async function statusOf(request: APIRequestContext, number: string) {
  const res = await request.get(`/api/order/number/${number}`);
  expect(res.ok()).toBeTruthy();
  return (await res.json()).status as string;
}

test.describe("Cancel order API", { tag: ["@api", "@regression"] }, () => {
  let admin: string;

  test.beforeAll(async ({ request }) => {
    admin = await adminToken(request);
  });

  test(
    "the owner cancels a new order",
    { annotation: [{ type: "requirement", description: "SCRUM-9 AC-1, AC-3" }] },
    async ({ request }) => {
      const { number, token } = await newOrder(request, admin);

      const res = await cancel(request, token, number);

      expect(res.status()).toBe(200);
      expect(await res.json()).toMatchObject({ number, status: "CANCELLED" });
      expect(await statusOf(request, number)).toBe("CANCELLED");
    },
  );

  test(
    "an accepted order cannot be cancelled",
    { annotation: [{ type: "requirement", description: "SCRUM-9 AC-2" }] },
    async ({ request }) => {
      const { id, number, token } = await newOrder(request, admin);
      expect((await setStatus(request, admin, id, "ACCEPTED")).status()).toBe(200);

      const res = await cancel(request, token, number);

      expect(res.status()).toBe(400);
      expect((await res.json()).message).toBe(ONLY_NEW);
      expect(await statusOf(request, number)).toBe("ACCEPTED");
    },
  );

  test(
    "someone else's order looks like a missing order",
    { annotation: [{ type: "requirement", description: "SCRUM-9 KAN-12 owner only" }] },
    async ({ request }) => {
      const { number } = await newOrder(request, admin);
      const { token: stranger } = await registerCustomer(request);

      const res = await cancel(request, stranger, number);

      expect(res.status()).toBe(404);
      expect((await res.json()).message).toBe(`Order ${number} not found`);
      expect(await statusOf(request, number)).toBe("NEW");
    },
  );

  test(
    "a visitor who is not signed in cannot cancel",
    { annotation: [{ type: "requirement", description: "SCRUM-9 KAN-12 owner only" }] },
    async ({ request }) => {
      const { number } = await newOrder(request, admin);

      expect((await cancel(request, null, number)).status()).toBe(401);
      expect(await statusOf(request, number)).toBe("NEW");
    },
  );

  test(
    "an admin cannot move a cancelled order to any other status",
    { annotation: [{ type: "requirement", description: "SCRUM-9 AC-4" }] },
    async ({ request }) => {
      const { id, number, token } = await newOrder(request, admin);
      expect((await cancel(request, token, number)).status()).toBe(200);

      for (const status of ["NEW", "ACCEPTED", "DELIVERED", "REJECTED"]) {
        expect((await setStatus(request, admin, id, status)).status(), `CANCELLED -> ${status}`).toBe(400);
      }
      expect(await statusOf(request, number)).toBe("CANCELLED");
    },
  );

  test(
    "the admin order list can be filtered by Cancelled",
    { annotation: [{ type: "requirement", description: "SCRUM-9 KAN-14 filter" }] },
    async ({ request }) => {
      const { number, token } = await newOrder(request, admin);
      expect((await cancel(request, token, number)).status()).toBe(200);

      const res = await request.get("/admin/order?page=0&size=50&status=CANCELLED", {
        headers: { Authorization: `Bearer ${admin}` },
      });

      expect(res.ok()).toBeTruthy();
      const list = (await res.json()).list as { number: string; status: string }[];
      expect(list.map((o) => o.number)).toContain(number);
      expect(list.every((o) => o.status === "CANCELLED")).toBeTruthy();
    },
  );
});
