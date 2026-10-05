// 📘 E2E tests for the waitlist signup, written from docs/features/waitlist-signup.md.
// Each test names the acceptance criterion it proves (AC1, AC5...), so a red test points straight
// at the requirement it breaks. Coverage is deliberately partial: specs/waitlist-signup.plan.md
// lists the scenarios that still need a test.
import { expect, test, type Page } from "@playwright/test";

// Scope every locator to the waitlist section. Next.js adds its own role="alert" route announcer
// to every page, so an unscoped getByRole("alert") matches two elements and the test fails.
const section = (page: Page) => page.locator("#waitlist");

test.describe("waitlist signup", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#waitlist");
  });

  test("AC1 + AC4: a visitor joins the Plus waitlist and sees their plan confirmed", async ({ page }) => {
    await page.getByLabel("First name").fill("Sam");
    await page.getByLabel("Email").fill("sam@example.com");
    await page.getByLabel("Plan you're interested in").selectOption("plus");
    await page.getByRole("button", { name: "Join the waitlist" }).click();

    const status = section(page).getByRole("status");
    await expect(status).toContainText("You're on the Plus waitlist");
    await expect(status).toContainText("in line");
  });

  test("AC5: an invalid email shows an inline error and no confirmation", async ({ page }) => {
    await page.getByLabel("First name").fill("Sam");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByRole("button", { name: "Join the waitlist" }).click();

    await expect(section(page).getByRole("alert")).toHaveText("Please enter a valid email address.");
    await expect(section(page).getByRole("status")).toHaveCount(0);
  });
});
