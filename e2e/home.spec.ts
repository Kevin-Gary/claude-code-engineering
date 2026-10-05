// 📘 A smoke test for the landing page. E2E tests check what a VISITOR sees, so they find things by
// role and visible text (getByRole, getByText), not by CSS classes that change on every redesign.
import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows the hero headline and the app CTA", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Keep every plant");
    await expect(page.getByRole("button", { name: "Get the app" })).toBeVisible();
  });

  test("lists the three pricing tiers at the prices in CLAUDE.md", async ({ page }) => {
    const pricing = page.locator("#pricing");
    for (const [tier, price] of [
      ["Free", "$0"],
      ["Plus", "$5.99"],
      ["Family", "$9.99"],
    ]) {
      await expect(pricing.getByRole("heading", { name: tier, exact: true })).toBeVisible();
      await expect(pricing.getByText(price, { exact: true })).toBeVisible();
    }
  });
});
