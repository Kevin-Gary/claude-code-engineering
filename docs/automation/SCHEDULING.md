<!-- 📘 Act 7 reference: running the same check on a schedule, three ways, without copying the
     instructions into three places. Facts checked against the Claude Code docs (scheduled-tasks,
     desktop-scheduled-tasks, routines) on 2026-10-12. -->

# Three schedulers, one skill

Claude Code can run a prompt on a schedule in three places. They differ in where the run happens
and who owns the schedule. What they share: each one can run a **skill**, so the instructions can
live in the repo, reviewed and versioned like code, while each scheduler only says `/morning-health`.

## The three schedulers

| | Cloud routine | Desktop scheduled task | `/loop` |
| --- | --- | --- | --- |
| Runs on | Anthropic's cloud, a fresh clone of a GitHub repo | Your machine, through the Desktop app | Your machine, inside an open session |
| Machine must be on | No | Yes: the app open and the computer awake | Yes |
| Needs an open session | No | No | Yes |
| Sees local files | No (fresh clone) | Yes | Yes |
| Minimum interval | 1 hour | 1 minute | 1 minute |
| Survives a restart | Yes | Yes | Only on `--resume`, and recurring jobs expire after 7 days |
| Permission prompts | None: runs autonomously | Per task (Manual mode can stall until you answer) | Same as the session |
| Where it is stored | Your claude.ai account | Prompt: `~/.claude/scheduled-tasks/<name>/SKILL.md`. Schedule, folder, model, on/off: the Desktop app | The session. A bare `/loop` reads `.claude/loop.md` |
| Shared through git | No (the skill it runs is) | No (the skill it runs is) | `.claude/loop.md` is; the schedule is not |

Use a cloud routine for work that must run with your laptop closed, a Desktop task when the run
needs your local files and tools, and `/loop` for "keep an eye on this while I work".

## Is there a `.claude/scheduled-tasks` folder in the repo? No.

People expect one, next to `.claude/agents/` and `.claude/skills/`. It does not exist, and Claude
Code does not read one. Creating `.claude/scheduled-tasks/` in a repo does nothing.

Where scheduled things actually live:

- **Desktop scheduled task**: per person, at `~/.claude/scheduled-tasks/<task-name>/SKILL.md`.
  That file holds only `name` and `description` frontmatter and the prompt as the body. The
  schedule, the working folder, the model and whether it is enabled are not in the file; they live
  in the Desktop app (change them from the task's Edit form or by asking Claude). Edits to the
  prompt take effect on the next run.
- **Cloud routine**: on your claude.ai account. Not in any repo, not shared with teammates.
- **`/loop`**: in the session. The only committed piece is `.claude/loop.md`, the default prompt
  for a bare `/loop`.

You may see `.claude/scheduled_tasks.json` (underscore, a file) in a project: in some setups the
session scheduler saves jobs you asked to keep across sessions there. It is machine state, a copy
of it in another folder is listed but never runs, and it is not a way to share a schedule. This
repo gitignores it.

## The shareable pattern: commit a skill, schedule the slash command

1. Write the instructions once, as a skill: `.claude/skills/morning-health/SKILL.md` (and the weekly
   `dependency-audit`). Review it in a pull request like any other change.
2. Each person points their scheduler at it. The scheduler's prompt is one line:
   `/morning-health`.
3. Change the check in the skill and every schedule picks it up on its next run.

One rule makes it work: a scheduled fire only runs skills **Claude may invoke on its own**. A skill
with `disable-model-invocation: true` arrives as plain text and nothing runs. Both scheduled
skills here leave that field out on purpose.

## Recipe A: a Desktop scheduled task

1. In the Desktop app's **Code** tab, click **Routines** (in the sidebar or its **More** menu),
   then **New routine**, then **Local**.
2. **Name**: `verdant-morning-health`. **Description**: "Daily report-only health check".
3. **Instructions**: `/morning-health`. Pick the permission mode and model in the instructions box.
   (On disk, `~/.claude/scheduled-tasks/verdant-morning-health/SKILL.md` now holds that one line.
   The real instructions stay in the repo.)
4. **Folder**: this repo. Turn the **worktree** toggle on, so each run gets its own checkout and
   never touches your working copy. (The skill runs `npm ci` itself when a fresh worktree has no
   `node_modules`.)
5. **Schedule**: Daily, 9:07. Save (Desktop asks you to trust the folder if you have not).
6. Click **Run now** and watch the run. Each time it asks for permission (`npm ci`, writing the
   report), choose **always allow**. Later runs approve the same tools without asking. Skip this
   and a Manual-mode run stalls at the first prompt until you open it.

Behavior to expect: Desktop starts each task a few minutes after its time (a fixed offset per
task). If the computer was asleep, the run is skipped, and on wake Desktop runs ONE catch-up for
the most recent missed time within the last 7 days. So a 9:07 task can run at 23:00. That is why
the skill reports "since the last report" rather than "the last 24 hours". To stop idle sleep,
turn on **Keep computer awake** in Settings > This computer > System.

## Recipe B: a cloud routine (GitHub repos only)

Requirements: the repo is on GitHub and your claude.ai account can reach it (the Claude GitHub App
or `/web-setup`), you are signed in with a claude.ai subscription, and routines are allowed for
your organization. Routines are in research preview.

From the CLI:

```text
/schedule every weekday at 9:07am run /morning-health and open nothing, just report
```

Claude walks through the same questions the web form asks (repository, environment, schedule,
prompt) and then saves the routine to your account. If it says you need to sign in instead, no
routine was created. Or create it at claude.ai/code/routines: **New routine**, prompt
`/morning-health. Do not open a pull request.`, add the repository, keep the **Default**
environment, trigger **Schedule**, weekdays at 9:07, and remove every connector (this skill needs
none). Then **Run now** once.

Things to know:

- A routine is a full cloud session with no permission prompts, and it runs as you: your GitHub
  identity, your usage.
- It starts from a fresh clone every time. This repo's SessionStart hook installs `node_modules`
  in cloud sessions (see [../cloud/README.md](../cloud/README.md)), so `npm run check` works.
- The report file stays in that run's VM. Read the run on claude.ai: the skill's 5-line summary is
  the last message.
- Times a few minutes past the hour (9:07, not 9:00) start closer to on time.

## Recipe C: `/loop` while you work

```text
/loop 30m /morning-health
```

Runs in this session every 30 minutes (each run can start up to 15 minutes late; jitter spreads
the load). It stops when the session ends, and recurring loops expire after 7 days. Each run
overwrites today's report, so the file always shows the latest state.

A bare `/loop` (or `/loop 15m`) uses `.claude/loop.md` instead of the built-in maintenance prompt:
in this repo, "run `npm run check`, report failures, fix only small things in files this branch
already changed, never push". `/loop <anything>` ignores `loop.md`.

## Team-owned schedules belong in CI

A routine or a Desktop task belongs to one person. When that person is on vacation, or leaves, the
schedule goes with them. A check the team depends on should be owned by the repository:

- `ci-examples/bitbucket-pipelines.yml` defines `custom: nightly-health`, which runs
  `scripts/ci/morning-health.sh`: `claude -p "/morning-health"` with a restricted tool set, an
  organization API key from a secured repository variable, and the report kept as an artifact.
  Attach it to a schedule in Bitbucket and it runs whether or not anyone's laptop is on.
- On GitHub, the same command fits a workflow with a `schedule:` trigger (GitHub runs scheduled
  workflows from the default branch only).

## Writing prompts that run unattended

- **Self-contained.** Nobody is there to answer a question. Say what to read, what to run and what
  done looks like. (The skills set `disallowed-tools: AskUserQuestion` for this reason.)
- **Name the success condition and the output file.** "Write reports/morning-health-<date>.md and
  print 5 lines" can be checked; "look at the repo" cannot.
- **Report before fix.** An unattended run that edits code produces surprises. Let it diagnose;
  a person fixes it with full context.
- **Never main.** No commits, no pushes, no branch switches. Use a worktree (Desktop) or a
  `claude/` branch (routines) when a run must write code.
- **Idempotent windows.** Use "since the last report" rather than "the last 24 hours", and
  overwrite today's report rather than appending, so a late or repeated run gives the same answer.
- **A green run only means it didn't crash: read the transcript.** A routine's green status means
  the session started and ended without an infrastructure error, not that the task succeeded.
