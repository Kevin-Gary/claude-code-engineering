---
name: nightly-check
description: Report-only nightly check. Runs npm ci, npm run check and npm run test:e2e, and writes reports/nightly-<date>.md with any failure, its likely cause and a suggested fix. Never changes code or commits.
when_to_use: As the one-line prompt of a Desktop scheduled task or `/loop`, or when asked for "the nightly check".
allowed-tools: Bash(npm ci *) Bash(npm run check) Bash(npm run test:e2e) Bash(date *) Bash(mkdir -p reports) Edit(reports/**)
disallowed-tools: AskUserQuestion
---
<!-- 📘 The instructions from docs/automation/desktop-routine.md, committed as a skill so the routine's
     own instructions are just `/nightly-check` and every teammate runs the same check. -->

# Nightly check

Run `npm ci`, then `npm run check`, then `npm run test:e2e`.

If everything passes, write one line to `reports/nightly-<date>.md` (date from `date +%F`) saying so,
and stop.

If anything fails:
1. Read the failure output and the code involved.
2. Write `reports/nightly-<date>.md` with: which command failed, the exact error, the most likely
   cause (file and line), and a suggested fix.
3. Do NOT change any code and do NOT commit. A person decides.
