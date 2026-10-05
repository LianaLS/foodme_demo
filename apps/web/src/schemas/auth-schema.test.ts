import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth-schema";

// Component tests for REQ-13 / REQ-14. Design: qa/03-design/ep-bva.md §1–2.

const validRegistration = {
  fullName: "Ann Test",
  email: "ann@example.com",
  phoneNumber: "+37491234567",
  password: "secret123",
};

function firstError(result: ReturnType<typeof registerSchema.safeParse>) {
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe("registerSchema — 2-value BVA on minimum lengths", () => {
  it.each([
    ["password", 7, "Password must be at least 8 characters"],
    ["password", 8, undefined],
    ["fullName", 1, "Enter your name"],
    ["fullName", 2, undefined],
    ["phoneNumber", 7, "Enter a valid phone number"],
    ["phoneNumber", 8, undefined],
  ] as const)("%s with %i characters -> %s", (field, length, expected) => {
    const result = registerSchema.safeParse({ ...validRegistration, [field]: "1".repeat(length) });
    expect(firstError(result)).toBe(expected);
  });
});

describe("registerSchema — email partitions", () => {
  it.each([
    ["valid", "ann@example.com", undefined],
    ["no @", "abc", "Enter a valid email"],
    ["no domain", "test@", "Enter a valid email"],
    ["empty", "", "Enter a valid email"],
  ])("%s (%s)", (_name, email, expected) => {
    expect(firstError(registerSchema.safeParse({ ...validRegistration, email }))).toBe(expected);
  });

  it("an empty form reports one error per field", () => {
    const result = registerSchema.safeParse({ fullName: "", email: "", phoneNumber: "", password: "" });
    expect(result.success).toBe(false);
    const fields = result.success ? [] : result.error.issues.map((i) => i.path[0]);
    expect(new Set(fields)).toEqual(new Set(["fullName", "email", "phoneNumber", "password"]));
  });
});

describe("loginSchema", () => {
  it("accepts a valid email and an 8-character password", () => {
    expect(loginSchema.safeParse({ email: "ann@example.com", password: "12345678" }).success).toBe(true);
  });

  it("rejects empty fields before any request is sent (AC-14.3)", () => {
    const result = loginSchema.safeParse({ email: "", password: "" });
    expect(result.success).toBe(false);
  });
});
