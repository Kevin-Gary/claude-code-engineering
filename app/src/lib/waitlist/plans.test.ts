// 📘 Tests for the plan normalizer. Small, fast, and named after behavior, so a failing test
// reads like a bug report. Like every test file here, coverage is honest but not complete.
import { describe, expect, it } from "vitest";
import { normalizePlan, PLANS } from "./plans";

describe("normalizePlan", () => {
  it("maps the Plus option", () => {
    expect(normalizePlan("plus")).toBe("plus");
  });

  it("ignores case and stray whitespace", () => {
    expect(normalizePlan("  Plus ")).toBe("plus");
  });

  it("keeps the legacy 'pro' value working", () => {
    expect(normalizePlan("pro")).toBe("plus");
  });

  it("maps the Free option", () => {
    expect(normalizePlan("free")).toBe("free");
  });

  it("falls back to free for missing input", () => {
    expect(normalizePlan(undefined)).toBe("free");
  });
});

describe("PLANS", () => {
  it("labels every tier the way the pricing section does", () => {
    expect(Object.values(PLANS).map((plan) => plan.label)).toEqual(["Free", "Plus", "Family"]);
  });
});
