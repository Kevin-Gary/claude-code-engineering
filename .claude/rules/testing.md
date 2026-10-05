---
paths:
  - "app/**/*.test.ts"
  - "e2e/**/*.ts"
  - "specs/**/*.md"
---

<!-- 📘 A PATH-SCOPED rule for tests. It loads only when Claude reads a unit test, an E2E spec, or a
     test plan, so these conventions cost nothing during non-test work. Open schedule.test.ts and
     run /memory: you will see this file listed as loaded. -->

# Testing conventions

- **Never weaken a test to make it pass.** Do not delete, skip (`.skip`), focus (`.only`) or loosen an
  existing assertion. If a test looks wrong, stop and ask.
- **Bug fixes start red.** Write a failing test that reproduces the bug, run it, show the failure,
  then fix the code.
- **One behavior per test**, named in plain words. E2E tests name the acceptance criterion they
  prove, e.g. `AC4: the confirmation names the chosen plan`.
- **Unit tests sit next to the code** (`schedule.ts` and `schedule.test.ts`). E2E tests live in `e2e/`.
  Test plans live in `specs/`.
- **E2E locators are user-facing**: `getByRole`, `getByLabel`, `getByText`. No CSS class selectors,
  no `waitForTimeout`.
- **Run what you touched**: `npm test` for unit tests, `npm run test:e2e` for E2E.
