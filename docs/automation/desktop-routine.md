<!-- 📘 A Desktop LOCAL ROUTINE (scheduled task): runs on your machine on a schedule, with access to
     your local repo, even when no session is open. It fires only while the desktop app is open and
     the computer is awake. Create it in the Claude desktop app from the Routines page and paste the
     instructions below. -->

# Nightly health check (Desktop local routine)

**Name:** verdant-nightly-check
**Schedule:** every weekday at 07:00
**Working folder:** this repo
**Run in an isolated worktree:** on (the routine never touches your working copy)
**Permission mode:** Manual (`default`), with the repo's `.claude/settings.json` rules

**First run:** click **Run now** right after you create it and watch. `npm run *` is already
allowed by the repo; `npm ci` and the report write are not, so they prompt. Choose "always allow"
for each, and later runs approve the same tools on their own. Skip this and a scheduled run stalls
at the first prompt until you answer it. (Auto mode avoids the prompts, with a classifier checking
each action instead of you.)

## Instructions (paste this)

```
Run `npm ci`, then `npm run check`, then `npm run test:e2e`.

If everything passes, write one line to reports/nightly-<date>.md saying so, and stop.

If anything fails:
1. Read the failure output and the code involved.
2. Write reports/nightly-<date>.md with: which command failed, the exact error, the most likely
   cause (file and line), and a suggested fix.
3. Do NOT change any code and do NOT commit. A human decides.
```

`reports/` is gitignored, so the reports stay on your machine.

## Why it is written this way

- **Report, do not fix.** An unattended run that edits code produces surprises. Let it diagnose;
  you fix it with full context in the morning.
- **Worktree on.** The routine works in its own checkout, so your half-finished branch is safe.
  It starts from your local repo's state, so keep your main branch current, or add a
  `git fetch` step and approve it on the first run.
- **Same commands as CI.** If the nightly is red, CI will be too. Catch it first.
