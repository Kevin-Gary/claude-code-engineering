# Two ways to put Claude on a schedule

Every scheduled job has two parts: **what** to do (the instructions) and **when** (the schedule).
The instructions are always the committed skill `.claude/skills/morning-health/SKILL.md`. What
changes is where the schedule lives.

| | [1. Schedule in the repo](1-schedule-in-the-repo/) | [2. Schedule per person](2-schedule-per-person/) |
|---|---|---|
| Where the schedule lives | A committed CI file (`cron:` in YAML) | Each person's desktop app, claude.ai account or session |
| Who owns it | The team | One person |
| Runs as | An org API key in a CI secret | That person, on their usage |
| Needs a laptop on? | No | Desktop task and `/loop`: yes. Cloud routine: no |
| Git host | GitHub Actions or Bitbucket Pipelines | Desktop task and `/loop`: any. Cloud routine: GitHub |
| Use it for | A check the whole team relies on | Your own morning report or babysitting loop |

**There is no `.claude/scheduled-tasks/` folder in a repo.** The desktop app keeps your scheduled
tasks in `~/.claude/scheduled-tasks/<name>/SKILL.md` in your home folder, and that file holds only
the prompt. The schedule itself is stored inside the app. So option 2 can never be committed; the
only committed schedule is option 1, a CI file.
