import { test, expect } from "@playwright/test";
import { uniqueEmail } from "./api-helpers";

// Test design: qa/03-design/ep-bva.md §1–2 (EP + 2-value BVA).

const valid = {
  fullName: "API Boundary",
  phoneNumber: "+37490000000",
  password: "secret123",
};

const boundaries: { field: keyof typeof valid; length: number; expected: number }[] = [
  { field: "password", length: 7, expected: 400 },
  { field: "password", length: 8, expected: 200 },
  { field: "password", length: 72, expected: 200 },
  { field: "password", length: 73, expected: 400 },
  { field: "fullName", length: 1, expected: 400 },
  { field: "fullName", length: 2, expected: 200 },
  { field: "fullName", length: 120, expected: 200 },
  { field: "fullName", length: 121, expected: 400 },
  { field: "phoneNumber", length: 7, expected: 400 },
  { field: "phoneNumber", length: 8, expected: 200 },
  { field: "phoneNumber", length: 32, expected: 200 },
  { field: "phoneNumber", length: 33, expected: 400 },
];

test.describe("Registration API — field boundaries", { tag: ["@api", "@regression"] }, () => {
  for (const { field, length, expected } of boundaries) {
    test(
      `${field} with ${length} characters returns ${expected}`,
      {
        annotation: [
          { type: "testCase", description: "TC-16" },
          { type: "requirement", description: "REQ-13" },
        ],
      },
      async ({ request }) => {
        const value = field === "phoneNumber" ? "+" + "1".repeat(length - 1) : "a".repeat(length);
        const res = await request.post("/api/auth/register", {
          data: { ...valid, email: uniqueEmail("bva"), [field]: value },
        });
        expect(res.status()).toBe(expected);
      },
    );
  }
});

test(
  "registration rejects an existing email in another letter case",
  {
    tag: ["@api", "@regression"],
    annotation: [
      { type: "testCase", description: "TC-17" },
      { type: "requirement", description: "REQ-13" },
    ],
  },
  async ({ request }) => {
    const email = uniqueEmail("dup");
    const first = await request.post("/api/auth/register", { data: { ...valid, email } });
    expect(first.status()).toBe(200);

    for (const variant of [email, email.toUpperCase()]) {
      const again = await request.post("/api/auth/register", { data: { ...valid, email: variant } });
      expect(again.status()).toBe(400);
      expect((await again.json()).message).toBe("Email already registered");
    }

    // Surrounding spaces fail format validation first, which also prevents a duplicate.
    const padded = await request.post("/api/auth/register", { data: { ...valid, email: ` ${email} ` } });
    expect(padded.status()).toBe(400);
  },
);

test(
  "login error is the same for a wrong password and an unknown email",
  {
    tag: ["@api", "@regression", "@smoke"],
    annotation: [
      { type: "testCase", description: "TC-18" },
      { type: "requirement", description: "REQ-14" },
    ],
  },
  async ({ request }) => {
    const email = uniqueEmail("login");
    await request.post("/api/auth/register", { data: { ...valid, email } });

    const ok = await request.post("/api/auth/login", { data: { email, password: valid.password } });
    expect(ok.status()).toBe(200);
    expect((await ok.json()).token).toBeTruthy();

    const wrongPassword = await request.post("/api/auth/login", {
      data: { email, password: "wrongpass1" },
    });
    const unknownEmail = await request.post("/api/auth/login", {
      data: { email: uniqueEmail("nobody"), password: "wrongpass1" },
    });
    expect(wrongPassword.status()).toBe(400);
    expect(unknownEmail.status()).toBe(400);
    expect((await wrongPassword.json()).message).toBe("Invalid email or password");
    expect((await unknownEmail.json()).message).toBe("Invalid email or password");
  },
);
