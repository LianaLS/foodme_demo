import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import type { DishDto } from "@/types";
import {
  addDishToCart,
  clearCart,
  decrementCartItem,
  incrementCartItem,
  removeCartItem,
} from "./useCart";

// Component tests for REQ-03, REQ-04, REQ-06.
// Design: qa/03-design/state-transitions.md ST-2 (cart), decision-tables.md DT-4.

function dish(overrides: Partial<DishDto> = {}): DishDto {
  return {
    id: 1,
    nameEn: "Soup",
    price: 1500,
    chefId: 24,
    minimumOrderCount: 1,
    additions: [],
    ...overrides,
  } as DishDto;
}

const items = () => db.products.toArray();

beforeEach(async () => {
  await clearCart();
});

describe("ST-2 cart transitions", () => {
  it("C1: Empty -> HasItems when a dish is added", async () => {
    expect(await addDishToCart(dish())).toBe("ok");
    expect(await items()).toMatchObject([{ id: 1, quantity: 1, price: 1500 }]);
  });

  it("C2: adding the same dish increases the quantity instead of a new line", async () => {
    await addDishToCart(dish());
    await addDishToCart(dish());
    expect(await items()).toMatchObject([{ id: 1, quantity: 2 }]);
  });

  it("C2/C3: + and − change the quantity by exactly one", async () => {
    await addDishToCart(dish());
    const [{ uid }] = await items();
    await incrementCartItem(uid);
    await incrementCartItem(uid);
    expect((await items())[0].quantity).toBe(3);
    await decrementCartItem(uid);
    expect((await items())[0].quantity).toBe(2);
  });

  it("C4: − at the minimum quantity removes the item", async () => {
    await addDishToCart(dish());
    const [{ uid }] = await items();
    await decrementCartItem(uid);
    expect(await items()).toEqual([]);
  });

  it("C5: trash removes the item regardless of quantity", async () => {
    await addDishToCart(dish(), 3);
    const [{ uid }] = await items();
    await removeCartItem(uid);
    expect(await items()).toEqual([]);
  });

  it("C7/C8: a dish from another chef is refused and the cart is unchanged", async () => {
    await addDishToCart(dish());
    expect(await addDishToCart(dish({ id: 2, chefId: 17 }))).toBe("mismatch");
    expect(await items()).toMatchObject([{ id: 1, chefId: 24 }]);
  });

  it("C9: 'Clear & continue' replaces the cart with the other chef's dish", async () => {
    await addDishToCart(dish());
    expect(await addDishToCart(dish({ id: 2, chefId: 17 }), 1, { replaceOtherChef: true })).toBe("ok");
    expect(await items()).toMatchObject([{ id: 2, chefId: 17, quantity: 1 }]);
  });
});

describe("minimum order count — BVA", () => {
  it("starts at the dish minimum and is removed when decreased from it", async () => {
    await addDishToCart(dish({ minimumOrderCount: 2 }));
    const [{ uid, quantity }] = await items();
    expect(quantity).toBe(2);
    await incrementCartItem(uid);
    await decrementCartItem(uid);
    expect((await items())[0].quantity).toBe(2);
    await decrementCartItem(uid);
    expect(await items()).toEqual([]);
  });
});

describe("line price (REQ-03 AC-03.2)", () => {
  it("includes the price of every selected addition", async () => {
    await addDishToCart(
      dish({
        additions: [
          { id: 7, nameEn: "Cheese", nameHy: "", nameRu: "", price: 300 },
          { id: 8, nameEn: "Bread", nameHy: "", nameRu: "", price: 200 },
        ],
      }),
    );
    expect((await items())[0].price).toBe(2000);
  });

  it("dishes with different additions are separate lines", async () => {
    const cheese = { id: 7, nameEn: "Cheese", nameHy: "", nameRu: "", price: 300 };
    await addDishToCart(dish());
    await addDishToCart(dish({ additions: [cheese] }));
    expect(await items()).toHaveLength(2);
  });
});
