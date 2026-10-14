import { test, expect, devices, type Page } from "@playwright/test";
import { registerCustomerViaApi } from "./auth";
import { activeChefs, adminToken, findDish, setStatus } from "./api/api-helpers";

// SCRUM-9 Cancel order (KAN-13) — test basis: cancel-order.spec.md.
// "Done when": sign up → place an order → cancel it from My Orders → it shows "Cancelled",
// on desktop and on mobile. Every test creates its own customer and order.

async function signIn(page: Page, email: string) {
  await page.goto("/login?next=/orders");
  const form = page.getByRole("form", { name: "Sign in" });
  await form.getByLabel("Email").fill(email);
  await form.getByLabel("Password").fill("secret123");
  await form.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Your orders" })).toBeVisible({ timeout: 15_000 });
}

/** Signs up (via API), signs in and places a takeaway order through the UI. Returns its number. */
async function placeOrderAsNewCustomer(page: Page) {
  const { email } = await registerCustomerViaApi(page.request, "");
  await signIn(page, email);

  const dish = findDish(await activeChefs(page.request), { withAdditions: false });
  await page.goto(`/chef/${dish.chefId}`);
  await page.locator("button.dc_card").filter({ hasText: dish.nameEn }).first().click();
  await page.getByRole("button", { name: "Add to cart" }).click();

  await page.goto("/checkout");
  const checkout = page.getByRole("form", { name: "Checkout" });
  await checkout.getByLabel("Full name").fill("Ann Test");
  await checkout.getByLabel("Phone").fill("+37491234567");
  await checkout.getByLabel("Email").fill("ann@example.com");
  await page.getByLabel("City").fill("Yerevan");
  await page.getByLabel("Street").fill("Abovyan");

  const created = page.waitForResponse(
    (res) => res.request().method() === "POST" && new URL(res.url()).pathname === "/api/order",
  );
  await page.getByRole("button", { name: "Place order" }).click();
  const res = await created;
  expect(res.ok()).toBeTruthy();
  await expect(page).toHaveURL(/\/orders\/success/);
  return (await res.json()).number as string;
}

function orderRow(page: Page, number: string) {
  return page.getByRole("listitem").filter({ hasText: number });
}

// defaultBrowserType can't be set inside a describe; both devices run on Chromium anyway.
function viewportOf(name: "Desktop Chrome" | "Pixel 7") {
  const { defaultBrowserType: _browser, ...use } = devices[name];
  return use;
}

for (const [viewport, use] of [
  ["desktop", viewportOf("Desktop Chrome")],
  ["mobile", viewportOf("Pixel 7")],
] as const) {
  test.describe(`Cancel order on ${viewport}`, () => {
    test.use(use);

    test(
      "sign up, place an order, cancel it from My Orders and it shows Cancelled",
      {
        tag: ["@regression", "@smoke"],
        annotation: [{ type: "requirement", description: "SCRUM-9 AC-1, AC-3 / KAN-13 Done when" }],
      },
      async ({ page }) => {
        const number = await placeOrderAsNewCustomer(page);

        await page.goto("/orders");
        const row = orderRow(page, number);
        await expect(row.getByText("Received")).toBeVisible();
        await row.getByRole("button", { name: `Cancel order ${number}` }).click();

        const dialog = page.getByRole("dialog");
        await expect(dialog.getByRole("heading", { name: `Cancel order ${number}?` })).toBeVisible();
        await expect(dialog.getByText("This can't be undone.")).toBeVisible();
        await expect(dialog.getByRole("button", { name: "Keep order" })).toBeVisible();
        await dialog.getByRole("button", { name: "Cancel order", exact: true }).click();

        await expect(dialog).toBeHidden();
        await expect(row.getByText("Cancelled", { exact: true })).toBeVisible();
        await expect(row.getByRole("button", { name: `Cancel order ${number}` })).toHaveCount(0);
      },
    );
  });
}

test.describe("Cancel order", { tag: ["@regression"] }, () => {
  test(
    "Keep order closes the confirmation and leaves the order Received",
    { annotation: [{ type: "requirement", description: "SCRUM-9 KAN-13 confirmation" }] },
    async ({ page }) => {
      const number = await placeOrderAsNewCustomer(page);

      await page.goto("/orders");
      const row = orderRow(page, number);
      await row.getByRole("button", { name: `Cancel order ${number}` }).click();
      await page.getByRole("dialog").getByRole("button", { name: "Keep order" }).click();

      await expect(page.getByRole("dialog")).toBeHidden();
      await expect(row.getByText("Received")).toBeVisible();
      await expect(row.getByRole("button", { name: `Cancel order ${number}` })).toBeVisible();
    },
  );

  test(
    "cancel from the tracking page: no progress bar for a cancelled order",
    { annotation: [{ type: "requirement", description: "SCRUM-9 AC-3 / KAN-13 tracking" }] },
    async ({ page }) => {
      const number = await placeOrderAsNewCustomer(page);

      await page.goto(`/tracking/${number}`);
      await expect(page.getByText("Order received")).toBeVisible();
      await page.getByRole("button", { name: "Cancel order" }).click();
      await page.getByRole("dialog").getByRole("button", { name: "Cancel order", exact: true }).click();

      await expect(page.getByText("Order cancelled")).toBeVisible();
      await expect(page.getByRole("listitem").filter({ hasText: "Preparing" })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Cancel order" })).toHaveCount(0);
    },
  );

  test(
    "accepted before the customer confirms: the reason is shown and the real status loads",
    { annotation: [{ type: "requirement", description: "SCRUM-9 AC-2 / KAN-13 race" }] },
    async ({ page }) => {
      const number = await placeOrderAsNewCustomer(page);
      const admin = await adminToken(page.request);
      const list = await page.request.get("/admin/order?page=0&size=50&status=NEW", {
        headers: { Authorization: `Bearer ${admin}` },
      });
      const id = ((await list.json()).list as { id: number; number: string }[]).find((o) => o.number === number)!.id;

      await page.goto("/orders");
      const row = orderRow(page, number);
      await row.getByRole("button", { name: `Cancel order ${number}` }).click();
      // The kitchen accepts while the confirmation is open.
      expect((await setStatus(page.request, admin, id, "ACCEPTED")).status()).toBe(200);
      await page.getByRole("dialog").getByRole("button", { name: "Cancel order", exact: true }).click();

      await expect(page.getByRole("dialog").getByRole("alert")).toHaveText("Only new orders can be cancelled.");
      await page.getByRole("dialog").getByRole("button", { name: "Keep order" }).click();
      await expect(row.getByText("Preparing")).toBeVisible();
      await expect(row.getByRole("button", { name: `Cancel order ${number}` })).toHaveCount(0);
    },
  );
});
