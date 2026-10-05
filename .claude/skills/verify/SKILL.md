---
name: verify
description: Verify a Verdant change end to end before it is committed. Runs lint, typecheck and unit tests, then the Playwright suite against the running site when app code changed, and reports exactly what passed.
when_to_use: Use before committing, when the user asks "is this done", "verify", or "does it work", and after finishing any change to app/ or e2e/.
allowed-tools: Bash(npm run *) Bash(git status *) Bash(git diff *)
---
<!-- 📘 THE `verify` SKILL NAME IS SPECIAL. Claude Code ships a bundled /verify, and a project skill
     with the same name replaces it. On v2.1.286 and later, when a skill named `verify` exists at the
     start of a session, Claude's commit instructions tell it to run this skill right before each
     commit (docs-only and test-only changes are skipped). So this file turns "please run the tests
     before you commit" from a hope into a habit. It only works because Claude may invoke it, so it
     must NOT set `disable-model-invocation`.
     Any stack: put your build, test and smoke-run commands here. -->

# Verify a Verdant change

Changed files:
!`git status --short`

1. Run `npm run check` (ESLint, TypeScript, Vitest). If anything fails, fix it and run it again.
   Do not move on with a red check.
2. If anything under `app/src/app/`, `app/src/components/` or `e2e/` changed, run
   `npm run test:e2e`. It starts the dev server and drives the real site in a browser.
3. If the change is visible on the page and no E2E test covers it, say so and suggest the test
   (the `write-tests` skill has the pattern).
4. Report in three lines: what you ran, what passed, and anything you could not verify.

Never weaken or skip a test to make this pass.
