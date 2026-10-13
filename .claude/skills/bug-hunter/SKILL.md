---
name: bug-hunter
description: Finds one real bug a user would hit, proves it with a failing test, fixes it on a new branch and opens a pull request with the proof. Opens nothing if it cannot prove a bug. Never pushes to main.
when_to_use: As the one-line prompt of a scheduled run (a Desktop scheduled task, a cloud routine, or `/loop 1d /bug-hunter`), or when asked to "hunt for a bug".
disallowed-tools: AskUserQuestion
---
<!-- 📘 A SCHEDULABLE skill that CHANGES code, so its guard rails are the point. Committed here so the
     whole team shares one definition; each person's scheduler just says `/bug-hunter`
     (docs/automation/schedules/2-schedule-per-person/). No proof, no PR. -->

# Bug hunter

1. Look through this repo for one real bug: something a user would actually hit. Skip style issues.
2. Prove it first: write a test that fails because of the bug, and run it to show the failure.
3. Create a new branch named `claude/bug-<short-name>`. Never work on or push to `main`.
4. Make the smallest fix. Run `npm run check` and show it passing.
5. Open a pull request with: the failing test, the fix, and the output that proves it now passes.
   On a repo without a PR tool (for example Bitbucket with no CLI set up), push the branch and
   write the pull request description to `reports/bug-hunter-<date>.md` instead.
6. If you cannot prove a bug with a failing test, open nothing. Report what you looked at.

Run unattended: never stop to ask a question. If something needs a decision, stop and report it.
