<!-- 📘 A Desktop LOCAL ROUTINE (scheduled task): runs on your machine on a schedule, with access to
     your local repo, even when no session is open. It fires only while the desktop app is open and
     the computer is awake. Create it in the Claude desktop app from the Routines page. Its instructions are one
     line, `/nightly-check`: the real instructions live in the committed skill. -->

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

## Instructions

```
/nightly-check
```

That's the whole prompt. The instructions live in the committed skill
[`.claude/skills/nightly-check/SKILL.md`](../../.claude/skills/nightly-check/SKILL.md), so every
teammate who schedules it runs the same check, and a change to the skill (in a PR) reaches every
schedule on its next run.

`reports/` is gitignored, so the reports stay on your machine.

## Why it is written this way

- **Report, do not fix.** An unattended run that edits code produces surprises. Let it diagnose;
  you fix it with full context in the morning.
- **Worktree on.** The routine works in its own checkout, so your half-finished branch is safe.
  It starts from your local repo's state, so keep your main branch current, or add a
  `git fetch` step and approve it on the first run.
- **Same commands as CI.** If the nightly is red, CI will be too. Catch it first.

## Share it with the team

Share the skill, not the schedule. The routine itself lives on your machine
(`~/.claude/scheduled-tasks/<name>/SKILL.md`, with the schedule kept by the Desktop app), so it can't
be committed. The skill can, and it is. Teammates create their own routine with `/nightly-check`.
See [schedules/](schedules/) for the two options side by side.
