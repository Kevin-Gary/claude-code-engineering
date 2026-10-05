// 📘 Vitest is the unit-test runner for app/. Unit tests are Claude's fastest verification loop:
// a change is "done" when `npm test` is green, not when the code looks right. Tests sit next to
// the code they cover (schedule.ts -> schedule.test.ts), so Claude finds them with one Glob.
// Any stack: this file plays the role of pytest.ini, a JUnit/Gradle test block, or `go test ./...`.
// The .mts extension marks it as an ES module, so Vite loads it natively instead of warning.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirror the "@/..." import alias from tsconfig.json so tests import code the same way the app does.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    // Domain logic and API helpers are plain TypeScript, so a Node environment is enough (no DOM).
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
