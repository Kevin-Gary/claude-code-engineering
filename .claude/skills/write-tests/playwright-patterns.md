# Playwright patterns (E2E tests in e2e/)

```ts
import { expect, test } from "@playwright/test";

test("AC1: a visitor joins the waitlist", async ({ page }) => {
  await page.goto("/#waitlist");
  await page.getByLabel("Email").fill("sam@example.com");
  await page.getByRole("button", { name: "Join the waitlist" }).click();
  await expect(page.locator("#waitlist").getByRole("status")).toContainText("waitlist");
});
```

- Locator priority: `getByRole` with a name, then `getByLabel`, then `getByText`, then
  `getByTestId`. Avoid CSS classes and XPath: they change with every redesign.
- Scope to a section when a role appears more than once (Next.js adds its own `role="alert"`).
- Assertions auto-wait: `await expect(locator).toBeVisible()`. Never `waitForTimeout`.
- `npm run test:e2e` starts the dev server for you. Debug with `npx playwright test --ui` or
  `--debug`, and read traces with `npx playwright show-trace`.
- Browser dialogs (for example an `alert` from injected script): `page.on("dialog", ...)` lets a
  test assert that NO dialog ever opens.
- The `playwright-test-generator` agent writes tests in this style from a plan in `specs/`.
