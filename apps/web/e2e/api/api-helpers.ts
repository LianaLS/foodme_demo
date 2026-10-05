import { expect, type APIRequestContext } from "@playwright/test";
import { registerCustomerViaApi } from "../auth";

// API tests call the same origin as the storefront (single-origin deploy), so
// relative paths resolve against `baseURL` from playwright.config.ts.

export interface Dish {
  id: number;
  nameEn: string;
  price: number;
  chefId: number;
  minimumOrderCount: number;
  additions?: { id: number; nameEn: string; price: number }[];
}

export interface Chef {
  id: number;
  dishes: Dish[];
}

export async function registerCustomer(request: APIRequestContext) {
  return registerCustomerViaApi(request, "");
}

export function uniqueEmail(prefix = "api") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

export async function adminToken(request: APIRequestContext): Promise<string> {
  const res = await request.post("/admin/auth/login", {
    data: { username: "admin", password: "admin123" },
  });
  expect(res.ok()).toBeTruthy();
  return (await res.json()).token as string;
}

/**
 * Test data source: active chefs whose detail page loads. A chef page that fails
 * is a defect of its own (covered by chefs.api.spec.ts), not a reason to block
 * unrelated order tests.
 */
export async function activeChefs(request: APIRequestContext): Promise<Chef[]> {
  const list = await request.get("/api/chef/active?page=0&size=50");
  expect(list.ok()).toBeTruthy();
  const body = await list.json();
  const chefs: Chef[] = [];
  for (const c of body.exploreChefResponseDtoList as { id: number }[]) {
    const detail = await request.get(`/api/chef/${c.id}`);
    if (detail.ok()) chefs.push(await detail.json());
  }
  expect(chefs.length, "at least two chef pages load").toBeGreaterThanOrEqual(2);
  return chefs;
}

/** First active dish with minimum order count 1, optionally with at least one addition. */
export function findDish(chefs: Chef[], opts: { withAdditions: boolean }): Dish {
  for (const chef of chefs) {
    const dish = (chef.dishes || []).find(
      (d) =>
        (d.minimumOrderCount ?? 1) <= 1 &&
        (opts.withAdditions ? (d.additions?.length ?? 0) > 0 : !d.additions?.length),
    );
    if (dish) return dish;
  }
  throw new Error(`No dish found (withAdditions=${opts.withAdditions})`);
}

export function takeawayOrder(
  chefId: number,
  items: { dishId: number; quantity?: number | null; additions?: { additionId: number }[] }[],
) {
  return {
    chefId,
    receiverName: "API Tester",
    receiverPhoneNumber: "+37490000000",
    receiverEmail: "api-tester@example.com",
    paymentType: "CASH",
    deliveryMethod: "TAKEAWAY",
    note: "api test",
    createOrderDishes: items,
  };
}

export async function placeOrder(
  request: APIRequestContext,
  token: string,
  body: ReturnType<typeof takeawayOrder>,
) {
  return request.post("/api/order", {
    headers: { Authorization: `Bearer ${token}` },
    data: body,
  });
}

/** Creates a NEW order and returns its admin id and number. */
export async function createOrderForAdmin(request: APIRequestContext, admin: string) {
  const chefs = await activeChefs(request);
  const dish = findDish(chefs, { withAdditions: false });
  const { token } = await registerCustomer(request);
  const res = await placeOrder(request, token, takeawayOrder(dish.chefId, [{ dishId: dish.id, quantity: 1 }]));
  expect(res.ok()).toBeTruthy();
  const { number } = await res.json();

  const list = await request.get("/admin/order?page=0&size=50&status=NEW", {
    headers: { Authorization: `Bearer ${admin}` },
  });
  expect(list.ok()).toBeTruthy();
  const order = ((await list.json()).list as { id: number; number: string }[]).find(
    (o) => o.number === number,
  );
  expect(order, `order ${number} visible in admin list`).toBeTruthy();
  return { id: order!.id, number };
}

export async function setStatus(
  request: APIRequestContext,
  admin: string,
  id: number,
  status: string,
) {
  return request.patch(`/admin/order/${id}/status`, {
    headers: { Authorization: `Bearer ${admin}` },
    data: { status, rejectReason: status === "REJECTED" ? "API test" : undefined },
  });
}
