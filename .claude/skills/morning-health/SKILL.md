---
name: morning-health
description: Report-only daily health check for Verdant. Runs npm run check, summarizes recent commits on main, lists TODO/FIXME lines those commits added, flags dependency changes, writes reports/morning-health-<date>.md and prints a 5-line summary. Never edits source, commits or pushes.
when_to_use: Use as the one-line prompt of a scheduled run (a Desktop scheduled task, a cloud routine, `/loop 1h /morning-health`, or a CI schedule), or when the user asks "how is the repo doing this morning" or "what changed on main since yesterday".
allowed-tools: Bash(npm run check) Bash(npm ci *) Bash(git log *) Bash(git show *) Bash(git diff *) Bash(git rev-parse *) Bash(date *) Bash(mkdir -p reports) Edit(reports/**)
disallowed-tools: AskUserQuestion
---
<!-- 📘 A SCHEDULABLE skill. The instructions live HERE, committed, so the whole team shares one
     definition. Each person's scheduler only has to say `/morning-health`:
       - a Desktop scheduled task (Routines > New routine > Local), instructions: /morning-health
       - a cloud routine (`/schedule` or claude.ai/code/routines), prompt: /morning-health
       - a loop while you work: /loop 1h /morning-health
       - a team-owned CI schedule: ci-examples/bitbucket-pipelines.yml (custom: nightly-health)
     Change the check once, here, and every schedule picks it up on its next run.
     Three choices make it safe to run unattended:
     - It does NOT set `disable-model-invocation: true`. A scheduled fire only runs skills Claude
       may invoke itself; with that flag the scheduler's `/morning-health` would arrive as plain text.
     - `disallowed-tools: AskUserQuestion`: nobody is there to answer, so it never stops to ask.
     - `allowed-tools` pre-approves exactly the commands below, plus writes under reports/ (an
       `Edit(...)` rule covers Write too). Everything else still goes through normal permissions.
     A missed Desktop run catches up once when the machine wakes, possibly hours late, so the window
     is "since the last report", not "the last 24 hours". Full guide: docs/automation/SCHEDULING.md. -->

# Morning health check

You produce a report. You do not fix anything.

## Guard rails

- Never edit source files, tests, configs or package files. The only file you write is the report.
- Never commit, never push, never change branches, never run `npm install` or `npm update`.
- If something fails, report it and move on to the next step.

## Steps

1. **Today's date and report path.** Run `date +%F`. The report is
   `reports/morning-health-<date>.md`. Run `mkdir -p reports`. If today's report already exists,
   overwrite it: the latest run wins.
2. **Pick the window.** Find the newest `reports/morning-health-*.md` dated BEFORE today (Glob).
   If there is one, the window starts on that date (for example `--since=2026-10-11`). If there is
   none (a fresh clone, a cloud VM, CI), use `--since=yesterday`. Say which one you used.
3. **Pick the ref.** Use `origin/main` if `git rev-parse --verify origin/main` succeeds, otherwise
   `main`. Do not fetch: report on what this checkout has, and name the ref and its latest commit.
4. **Checks.** If `node_modules` is missing (a fresh worktree or clone), run
   `npm ci --no-audit --no-fund` first; it installs exactly what the lockfile pins and changes no
   tracked files. Then run `npm run check`. Record PASS or FAIL. On FAIL, record which part failed
   (lint, typecheck or tests), the failing test names or the first errors, and the likely cause
   with file:line. Do not try to fix it.
5. **Commits.** `git log <ref> --since=<window> --no-merges --format='%h %an %s'`. Count them and
   list them (at most 30; say how many you left out).
6. **TODO and FIXME added.** `git log <ref> --since=<window> -p --no-color` and keep only added
   lines (starting with `+`) that contain `TODO` or `FIXME`. For each: file, the line text, and the
   commit that added it.
7. **Dependency changes.** `git log <ref> --since=<window> --format='%h %s' -- package.json
   app/package.json package-lock.json`. If any commit touched them, show the changed dependency
   lines from the package.json files (`git diff <oldest>^ <ref> -- package.json app/package.json`).
   A lockfile-only change is worth one line: "package-lock.json changed in <commits>".

## Report file

```markdown
# Morning health: <date>

Window: since <date or "yesterday"> on <ref> (latest commit <hash> <date>)

## Checks: PASS | FAIL
<what failed and the likely cause, or "all green">

## Commits (<n>)
<list>

## TODO / FIXME added (<n>)
<list, or "none">

## Dependency changes
<list, or "none">
```

## Final answer (exactly 5 lines)

```
Checks: PASS | FAIL (<what failed>)
Commits: <n> on <ref> since <window>
TODO/FIXME added: <n>
Dependencies: changed in <n> commit(s) | unchanged
Report: reports/morning-health-<date>.md
```
