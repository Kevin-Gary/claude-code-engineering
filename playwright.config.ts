// 📘 Playwright runs the END-TO-END tests in e2e/: a real browser against the real running site.
// This is the deterministic half of the QA story. Claude (with the Playwright MCP) explores the site
// and finds a bug; you then commit a test here, and CI runs it on every push with no AI involved.
// Any stack: Playwright also ships for Python, Java and .NET, and the same idea holds for Cypress
// or Selenium. The pattern (spin up the app, drive it like a user, assert what they see) is the point.
import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // In CI, fail the build if someone left a `test.only` behind, and retry once to absorb flakiness.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    // A trace (DOM snapshots, network, console) is recorded only when a test fails and retries.
    trace: "on-first-retry",
    launchOptions: {
      // Optional: point at a browser that is already installed (CI images, sandboxes). Unset on a
      // normal laptop, where `npx playwright install chromium` downloads the matching browser.
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Playwright starts the dev server for you, waits for it, and stops it after the run.
  // Locally it reuses a server you already have running, so `npm run dev` + `npm run test:e2e` is fast.
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
