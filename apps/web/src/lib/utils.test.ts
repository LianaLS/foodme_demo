import { describe, expect, it } from "vitest";
import { formatAmd, sameLabel, translate } from "./utils";

describe("formatAmd", () => {
  it.each([
    [0, "0 AMD"],
    [1500, "1,500 AMD"],
    [1499.5, "1,500 AMD"],
    [1000000, "1,000,000 AMD"],
  ])("%d -> %s", (value, expected) => {
    expect(formatAmd(value)).toBe(expected);
  });
});

describe("translate", () => {
  const list = [
    { lang: "en", value: "Soup" },
    { lang: "ru", value: "Суп" },
  ];

  it("returns the requested language", () => {
    expect(translate(list, "ru")).toBe("Суп");
  });

  it("falls back to the first value when the language is missing", () => {
    expect(translate(list, "hy")).toBe("Soup");
  });

  it("returns an empty string for a missing list", () => {
    expect(translate(undefined)).toBe("");
  });
});

describe("sameLabel", () => {
  it("ignores letter case", () => {
    expect(sameLabel("Soups", "soups")).toBe(true);
    expect(sameLabel("Soups", "Salads")).toBe(false);
  });
});
