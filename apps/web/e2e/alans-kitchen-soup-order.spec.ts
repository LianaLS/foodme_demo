import { test, expect, type Locator } from "@playwright/test";
import { createAccountAtCheckout } from "./auth";

const CHEF_NAME = "Alans Kitchen";
const SOUP_NAME = "Pho Bo soup with beef";
const QUANTITY = 2;

/** "7,000 AMD" -> 7000 */
async function readAmd(locator: Locator): Promise<number> {
  const text = (await locator.innerText()).replace(/[^\d]/g, "");
  return Number(text);
}

/** Amount in the "<label> ... 7,000 AMD" summary row inside `container`. */
function summaryAmount(container: Locator, label: string): Locator {
  return container
    .locator("div.justify-between")
    .filter({ has: container.page().getByText(label, { exact: true }) })
    .locator("span.tabular-nums")
    .last();
}

test("Alans Kitchen: 2 x soup -> total = unit price x 2 -> order placed", async ({ page }) => {
  test.setTimeout(90_000);

  // 1. Open the site and click the FoodMe button (logo in header)
  await page.goto("/");
  await page.getByRole("link", { name: "FoodMe home" }).click();
  await expect(page).toHaveURL(/\/$/);

  // 2. Go to the chef list and select Alans Kitchen
  await page.getByRole("link", { name: "Order now" }).first().click();
  await expect(page).toHaveURL(/\/explore/);
  const chefCard = page.locator("a.cc_card").filter({ hasText: CHEF_NAME }).first();
  await chefCard.scrollIntoViewIfNeeded();
  await chefCard.click();
  await expect(page).toHaveURL(/\/chef\/\d+/);

  // 3. Select the soup and read its unit price from the dish modal
  const soupCard = page.locator("button.dc_card").filter({ hasText: SOUP_NAME }).first();
  await soupCard.scrollIntoViewIfNeeded();
  await soupCard.click();

  const addToCart = page.getByRole("button", { name: /Add to cart/ });
  await expect(addToCart).toBeVisible();
  const unitPrice = await readAmd(addToCart.locator("span.tabular-nums"));
  expect(unitPrice).toBeGreaterThan(0);

  // 4. Set quantity to 2 and add to basket
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Increase quantity" }).click();
  await expect(addToCart.locator("span.tabular-nums")).toContainText(
    (unitPrice * QUANTITY).toLocaleString("en-US"),
  );
  await addToCart.click();

  // 5. Verify cart: line total and Subtotal = unit price x quantity
  const expectedTotal = unitPrice * QUANTITY;
  const cart = page.locator("aside.uc-panel");
  const line = cart.locator(".cic_root").filter({ hasText: SOUP_NAME });
  await expect(line).toHaveCount(1);
  await expect(line.locator(".fm-qty-grp p")).toHaveText(String(QUANTITY));
  expect(await readAmd(line.locator("span.font-semibold").first())).toBe(expectedTotal);

  expect(await readAmd(summaryAmount(cart, "Subtotal"))).toBe(expectedTotal);
  // 7,000 AMD is above the 5,000 AMD free-delivery threshold -> Total == Subtotal
  expect(await readAmd(summaryAmount(cart, "Total"))).toBe(expectedTotal);

  // 6. Checkout
  await cart.getByRole("link", { name: "Go to checkout" }).click();
  await expect(page).toHaveURL(/\/checkout/);
  await createAccountAtCheckout(page, "Soup Tester");

  const checkoutForm = page.getByRole("form", { name: "Checkout" });
  await checkoutForm.getByLabel("Full name").fill("Soup Tester");
  await checkoutForm.getByLabel("Phone").fill("+37491234567");
  await checkoutForm.getByLabel("Email").fill("soup.tester@example.com");
  await page.getByLabel("City").fill("Yerevan");
  await page.getByLabel("Street").fill("Abovyan");

  // Checkout summary must show the same amounts
  const summary = page.locator("main aside");
  await expect(summaryAmount(summary, "Total")).toContainText(expectedTotal.toLocaleString("en-US"));
  expect(await readAmd(summaryAmount(summary, "Subtotal"))).toBe(expectedTotal);
  expect(await readAmd(summaryAmount(summary, "Total"))).toBe(expectedTotal);

  // 7. Place the order and verify the result
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page).toHaveURL(/\/orders\/success/, { timeout: 30_000 });
  await expect(page.getByText("Order placed!")).toBeVisible();
});
