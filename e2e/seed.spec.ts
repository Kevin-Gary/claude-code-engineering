// 📘 The SEED test for Playwright's test agents (planner, generator, healer). It does the setup
// every generated test needs, here just "open the home page", and the agents copy its shape.
// Run `npx playwright init-agents --loop=claude` and the planner reads this file first.
import { test } from "@playwright/test";

test("seed", async ({ page }) => {
  await page.goto("/");
});
