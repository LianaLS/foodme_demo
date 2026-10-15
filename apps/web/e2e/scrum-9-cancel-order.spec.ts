import { test, expect, type Page } from "@playwright/test";
import { activeChefs, findDish, placeOrder, registerCustomer, takeawayOrder } from "./api/api-helpers";

// SCRUM-9 Cancel order — UI tests automated from the Qase test cases (project FML, suite 6).
// Step 06 of the functional testing workflow; traceability in
// workflows/functional-testing/runs/SCRUM-9/automation.yaml.

/** Signs a customer in through the storefront's Sign in form. */
async function signIn(page: Page, email: string) {
  await page.goto("/login?next=/orders");
  const form = page.getByRole("form", { name: "Sign in" });
  await form.getByLabel("Email").fill(email);
  await form.getByLabel("Password").fill("secret123");
  await form.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText(`Signed in as ${email}`)).toBeVisible({ timeout: 20_000 });
}

// Known defect: SCRUM-10 (DEF-01) — the tracking page shows "Order cancelled" and an extra line
// instead of the status title "Cancelled". The expected result stays as the requirement says;
// when the defect is fixed this test reports "expected to fail, but passed" → confirmation test.
test.fail(
  "TC-SCRUM-9-22 UI: the owner cancels from the order tracking page",
  {
    tag: ["@regression", "@known-defect"],
    annotation: [
      { type: "testCase", description: "TC-SCRUM-9-22" },
      { type: "requirement", description: "REQ-SCRUM-9-11, REQ-SCRUM-9-15, REQ-SCRUM-9-19" },
      { type: "qase", description: "FML-37" },
      { type: "issue", description: 'SCRUM-10 — DEF-01: tracking title "Order cancelled" instead of "Cancelled"' },
    ],
  },
  async ({ page, request }) => {
    test.setTimeout(120_000);
    // Precondition: customer A (signed in) has an order in status Received.
    const dish = findDish(await activeChefs(request), { withAdditions: false });
    const { token, email } = await registerCustomer(request);
    const res = await placeOrder(request, token, takeawayOrder(dish.chefId, [{ dishId: dish.id, quantity: 1 }]));
    expect(res.ok()).toBeTruthy();
    const number = (await res.json()).number as string;
    await signIn(page, email);

    await test.step("1. Open the tracking page of the order", async () => {
      await page.goto(`/tracking/${number}`);
      // Expected: a "Cancel order" button is shown.
      await expect(page.getByRole("button", { name: "Cancel order" })).toBeVisible({ timeout: 20_000 });
    });

    await test.step('2. Click "Cancel order"', async () => {
      await page.getByRole("button", { name: "Cancel order" }).click();
      // Expected: the confirmation opens for this order.
      const dialog = page.getByRole("dialog");
      await expect(dialog.getByRole("heading", { name: `Cancel order ${number}?` })).toBeVisible();
      await expect(dialog.getByText("This can't be undone.")).toBeVisible();
    });

    await test.step('3. Click "Cancel order" in the confirmation', async () => {
      const dialog = page.getByRole("dialog");
      await dialog.getByRole("button", { name: "Cancel order", exact: true }).click();
      await expect(dialog).toBeHidden();
      // Expected: the page shows the status title "Cancelled" (CHG-01: no other text).
      await expect(page.getByText("Cancelled", { exact: true })).toBeVisible();
    });
  },
);

test(
  "TC-SCRUM-9-34 UI: sign up, place an order, cancel it from My Orders (Desktop 1920x1080)",
  {
    tag: ["@regression"],
    annotation: [
      { type: "testCase", description: "TC-SCRUM-9-34" },
      { type: "requirement", description: "REQ-SCRUM-9-27, REQ-SCRUM-9-02, REQ-SCRUM-9-15" },
      { type: "qase", description: "FML-49" },
    ],
  },
  async ({ page, request }) => {
    // Seven UI steps against Render with simulated latency (200–1500 ms per request) don't fit
    // the default 30 s test timeout; this is an upper limit, not a fixed wait.
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Test data: one active dish without additions.
    const dish = findDish(await activeChefs(request), { withAdditions: false });
    // A new email on every run, otherwise the second run gets "already registered".
    const email = `qa-tc34-${Date.now()}@example.com`;
    let orderNumber = "";

    await test.step("1. Sign up as a new customer", async () => {
      await page.goto("/login?next=/orders");
      await page.getByRole("tab", { name: "Create account" }).click();
      const form = page.getByRole("form", { name: "Create account" });
      await form.getByLabel("Full name").fill("QA Device");
      await form.getByLabel("Email").fill(email);
      await form.getByLabel("Phone").fill("+37491234567");
      await form.getByLabel("Password").fill("secret123");
      await form.getByRole("button", { name: "Create account" }).click();
      // Expected: the customer is signed in.
      await expect(page.getByText(`Signed in as ${email}`)).toBeVisible({ timeout: 20_000 });
    });

    await test.step("2. Open a chef page", async () => {
      await page.goto(`/chef/${dish.chefId}`);
      // Expected: the chef's dishes are listed.
      await expect(page.getByRole("button", { name: `Add ${dish.nameEn} to cart` })).toBeVisible();
    });

    await test.step("3. Add one dish to the cart", async () => {
      await page.getByRole("button", { name: `Add ${dish.nameEn} to cart` }).click();
      // Expected: the cart shows the dish.
      await expect(page.getByRole("complementary").getByText(dish.nameEn).first()).toBeVisible();
    });

    await test.step("4. Go to checkout, choose takeaway and place the order", async () => {
      await page.goto("/checkout");
      const checkout = page.getByRole("form", { name: "Checkout" });
      const takeaway = page.getByRole("button", { name: /Takeaway/ });
      await takeaway.click();
      // The checkout form can reset to "Delivery" while it is still loading, so make sure
      // Takeaway really is selected before filling the form.
      await expect(takeaway).toHaveAttribute("aria-pressed", "true");
      await checkout.getByLabel("Full name").fill("QA Device");
      await checkout.getByLabel("Phone").fill("+37491234567");
      await checkout.getByLabel("Email").fill("qa@example.com");
      const created = page.waitForResponse(
        (res) => res.request().method() === "POST" && new URL(res.url()).pathname === "/api/order",
      );
      await page.getByRole("button", { name: "Place order" }).click();
      const response = await created;
      expect(response.ok()).toBeTruthy();
      orderNumber = (await response.json()).number;
      // Expected: the order is placed and has a number FM-xxxxxx.
      expect(orderNumber).toMatch(/^FM-\d{6}$/);
      await expect(page).toHaveURL(/\/orders\/success/);
    });

    const row = page.getByRole("listitem").filter({ hasText: orderNumber });

    await test.step("5. Open My Orders", async () => {
      await page.goto("/orders");
      // Expected: the order shows Received and a "Cancel order" button.
      await expect(row.getByText("Received", { exact: true })).toBeVisible();
      await expect(row.getByRole("button", { name: `Cancel order ${orderNumber}` })).toBeVisible();
    });

    await test.step('6. Click "Cancel order"', async () => {
      await row.getByRole("button", { name: `Cancel order ${orderNumber}` }).click();
      // Expected: the confirmation opens.
      await expect(page.getByRole("dialog").getByText("This can't be undone.")).toBeVisible();
    });

    await test.step('7. Click "Cancel order" in the confirmation', async () => {
      const dialog = page.getByRole("dialog");
      await dialog.getByRole("button", { name: "Cancel order", exact: true }).click();
      await expect(dialog).toBeHidden();
      // Expected: the order shows "Cancelled" (the page behind an open dialog is hidden from
      // accessibility, so the row is read after the dialog has closed).
      await expect(row.getByText("Cancelled", { exact: true })).toBeVisible();
    });
  },
);
