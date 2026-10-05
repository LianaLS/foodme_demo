import { describe, expect, it } from "vitest";
import { checkoutSchema, type CheckoutFormValues } from "./checkout-schema";

// Component tests for REQ-09. Design: qa/03-design/decision-tables.md DT-2,
// ep-bva.md §3, error-guessing.md EG-03.

const base: CheckoutFormValues = {
  receiverName: "Ann Test",
  receiverPhoneNumber: "+37491234567",
  receiverEmail: "ann@example.com",
  deliveryMethod: "DELIVERY",
  paymentType: "CASH",
  note: "",
  city: "Yerevan",
  street: "Abovyan",
  building: "",
  apartment: "",
};

function errors(values: Partial<CheckoutFormValues>) {
  const result = checkoutSchema.safeParse({ ...base, ...values });
  return result.success ? [] : result.error.issues.map((i) => i.message);
}

describe("DT-2 — address rules depend on the delivery method", () => {
  it.each([
    ["R1 delivery, city + street", { city: "Yerevan", street: "Abovyan" }, []],
    ["R2 delivery, no city", { city: "", street: "Abovyan" }, ["City is required"]],
    ["R3 delivery, no street", { city: "Yerevan", street: "" }, ["Street is required"]],
    ["R4 delivery, no city, no street", { city: "", street: "" }, ["Street is required", "City is required"]],
    ["R5 takeaway, no address", { deliveryMethod: "TAKEAWAY", city: "", street: "" }, []],
  ] as const)("%s", (_rule, values, expected) => {
    expect(errors(values as Partial<CheckoutFormValues>)).toEqual(expected);
  });

  it("EG-03: spaces only count as empty", () => {
    expect(errors({ city: "   ", street: "  " })).toEqual(["Street is required", "City is required"]);
  });
});

describe("contact fields — 2-value BVA", () => {
  it.each([
    ["receiverName", 1, ["Enter your name"]],
    ["receiverName", 2, []],
    ["receiverPhoneNumber", 7, ["Enter a valid phone number"]],
    ["receiverPhoneNumber", 8, []],
  ] as const)("%s with %i characters", (field, length, expected) => {
    expect(errors({ [field]: "1".repeat(length) })).toEqual(expected);
  });

  it("rejects an email without @", () => {
    expect(errors({ receiverEmail: "abc" })).toEqual(["Enter a valid email"]);
  });
});

describe("note — 2-value BVA on the 300 character limit", () => {
  it("accepts 300 characters", () => {
    expect(errors({ note: "n".repeat(300) })).toEqual([]);
  });

  it("rejects 301 characters", () => {
    // The schema rejects it, but the form shows no message for this field (see TC-30).
    expect(errors({ note: "n".repeat(301) })).toHaveLength(1);
  });
});
