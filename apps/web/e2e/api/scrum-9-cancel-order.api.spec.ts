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

// SCRUM-9 Cancel order — API tests automated from the Qase test cases (project FML, suite 6).
// Step 06 of the functional testing workflow; traceability in
// workflows/functional-testing/runs/SCRUM-9/automation.yaml.

const ONLY_NEW = "Only new orders can be cancelled.";

/** A new customer places a takeaway order; returns the customer's token and the order number. */
async function customerWithOrder(request: APIRequestContext) {
  const dish = findDish(await activeChefs(request), { withAdditions: false });
  const { token } = await registerCustomer(request);
  const res = await placeOrder(request, token, takeawayOrder(dish.chefId, [{ dishId: dish.id, quantity: 1 }]));
  expect(res.ok()).toBeTruthy();
  return { token, number: (await res.json()).number as string };
}

/** The admin id of an order, looked up by its number. */
async function adminIdOf(request: APIRequestContext, admin: string, number: string) {
  const res = await request.get("/admin/order?page=0&size=50&status=NEW", {
    headers: { Authorization: `Bearer ${admin}` },
  });
  expect(res.ok()).toBeTruthy();
  const order = ((await res.json()).list as { id: number; number: string }[]).find((o) => o.number === number);
  expect(order, `order ${number} in the admin list`).toBeTruthy();
  return order!.id;
}

function cancel(request: APIRequestContext, token: string, number: string) {
  return request.post(`/api/customer/orders/${number}/cancel`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function statusOf(request: APIRequestContext, number: string) {
  const res = await request.get(`/api/order/number/${number}`);
  expect(res.ok()).toBeTruthy();
  return (await res.json()).status as string;
}

test.describe("SCRUM-9 cancel order API", { tag: ["@api", "@regression"] }, () => {
  // Every request goes to Render with simulated latency (200–1500 ms), so a test with
  // ten requests needs more than the default 30 s. Upper limit only, not a wait.
  test.describe.configure({ timeout: 90_000 });

  test(
    "TC-SCRUM-9-02 API: cancelling an Accepted order is refused",
    {
      annotation: [
        { type: "testCase", description: "TC-SCRUM-9-02" },
        { type: "requirement", description: "REQ-SCRUM-9-03" },
        { type: "qase", description: "FML-17" },
      ],
    },
    async ({ request }) => {
      // Precondition: customer A placed an order, the admin moved it to Accepted.
      const { token, number } = await customerWithOrder(request);
      const admin = await adminToken(request);
      expect((await setStatus(request, admin, await adminIdOf(request, admin, number), "ACCEPTED")).status()).toBe(200);

      // Step 1: as customer A, cancel the order.
      const res = await cancel(request, token, number);
      expect(res.status()).toBe(400);
      expect((await res.json()).message).toBe(ONLY_NEW);

      // Step 2: read the order again — the status is still Accepted.
      expect(await statusOf(request, number)).toBe("ACCEPTED");
    },
  );

  test(
    "TC-SCRUM-9-06 API: another customer cannot cancel someone else's order (looks like an unknown order)",
    {
      tag: ["@security"],
      annotation: [
        { type: "testCase", description: "TC-SCRUM-9-06" },
        { type: "requirement", description: "REQ-SCRUM-9-04" },
        { type: "qase", description: "FML-21" },
      ],
    },
    async ({ request }) => {
      // Precondition: customer A placed an order (Received); customer B is signed in.
      const { number } = await customerWithOrder(request);
      const { token: customerB } = await registerCustomer(request);

      // Step 1: customer B cancels A's order.
      const someoneElses = await cancel(request, customerB, number);
      expect(someoneElses.status()).toBe(404);
      const body1 = await someoneElses.json();

      // Step 2: customer B cancels an order number that does not exist.
      const unknown = await cancel(request, customerB, "FM-999999");
      expect(unknown.status()).toBe(404);
      const body2 = await unknown.json();

      // Same shape and message, except for the order number (and the timestamp).
      const comparable = (b: Record<string, unknown>, n: string) =>
        JSON.stringify({ ...b, timestamp: undefined }).split(n).join("{number}");
      expect(comparable(body1, number)).toBe(comparable(body2, "FM-999999"));

      // Step 3: A's order is unchanged.
      expect(await statusOf(request, number)).toBe("NEW");
    },
  );
});
