---
name: write-tests
description: Write or extend tests for Verdant, unit tests with Vitest or end-to-end tests with Playwright. Covers characterization tests before a refactor, test-first bug fixes, and turning an acceptance criterion or a QA finding into a regression test.
when_to_use: Use when the user asks to add tests, cover a function, reproduce a bug in a test, write a regression test, pin current behavior before refactoring, or turn a test plan in specs/ into Playwright tests.
argument-hint: "[file, function, bug report or spec to test]"
allowed-tools: Bash(git status *) Bash(npm run *) Bash(npx vitest *) Bash(npx playwright test *)
---
<!-- 📘 A RECIPE skill with two supporting files. SKILL.md holds the decisions (which kind of test,
     in what order); the patterns files hold the details and load only when needed.
     The `!` line injects the current working-tree status so Claude knows what you just changed.
     Any stack: the three moves (characterize, red-then-green, regression from a finding) are the
     same in pytest, JUnit or Go; only patterns files change. -->

# Writing tests for Verdant

What changed in the working tree right now:
!`git status --short`

Target from the user: $ARGUMENTS

## Pick the right kind of test

| You have | Write | Where |
| --- | --- | --- |
| A pure function in `app/src/lib/` | Vitest unit test | next to it, `name.test.ts` |
| A user flow on the site (form, navigation) | Playwright E2E test | `e2e/<feature>.spec.ts` |
| A test plan in `specs/` | Playwright tests, one per scenario | `e2e/` |

Details: [vitest-patterns.md](vitest-patterns.md) and [playwright-patterns.md](playwright-patterns.md).

## The three moves

**1. Characterization test (before a refactor).** Pin what the code does TODAY, even if it looks odd.
Name the block `describe("<fn> (characterization)")`. Cover each branch with one example. Run it
green. Now you can refactor and know you changed nothing.

**2. Bug fix, test first.** Write a test that reproduces the bug. Run it and show it FAIL (red), with
the failure message. Only then change the code. Run it again and show it pass (green). Run the
whole suite to prove nothing else broke.

**3. Regression from a QA finding.** Turn the exact steps that exposed the bug into a test, name it
after the acceptance criterion it protects (for example `AC4: ...`), and keep it forever.

## Rules

- Never weaken, skip (`.skip`, `.only`), or delete an existing assertion to get to green. If an
  existing test looks wrong, stop and ask.
- One behavior per test. The test name says the behavior in plain words.
- No sleeps. Use Playwright's auto-waiting `expect` and Vitest's fake timers.
- Finish by running `npm test` (unit) or `npm run test:e2e` (E2E) and paste the summary line.
