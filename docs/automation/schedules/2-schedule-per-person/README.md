# 2. The schedule is per person (instructions committed, schedule not)

The instructions are committed once, as the skill `.claude/skills/morning-health/SKILL.md`. Each
person who wants it sets their own schedule, and that schedule's prompt is one line:
`/morning-health`. Change the skill in a PR and every person's schedule uses the new version on its
next run. Nothing here runs automatically for anyone who didn't set it up.

## Set the schedule: three ways

**Desktop scheduled task** (your machine, any git host including Bitbucket)
- Desktop app → Code tab → Routines → New routine → **Local**
- Instructions: `/morning-health` · Folder: your clone · Worktree: on · Schedule: **Weekdays, 9:07**
- Or say it in any desktop session: `schedule /morning-health every weekday at 9:07am`
- Runs while the app is open and the machine is awake. Click Run now once and choose always allow.

**Cloud routine** (Anthropic's cloud, laptop can be closed, GitHub only)
- `/schedule every weekday at 9:07am run /morning-health`
- Or claude.ai/code/routines → New routine, prompt `/morning-health`, schedule Weekdays 9:07

**While you work** (your open session, up to 7 days)
- `/loop 1h /morning-health`

## Where it ends up (and why it isn't in the repo)

When you save a desktop scheduled task, the app writes this file in your **home folder**, not the
repo. It holds only the prompt. The schedule, folder, model and on/off state are kept by the app:

```text
~/.claude/scheduled-tasks/morning-health/SKILL.md
---
name: morning-health
description: Daily health check
---
/morning-health
```

Copying that file to a teammate schedules nothing for them. To share, commit the skill; to share a
schedule, use [option 1](../1-schedule-in-the-repo/).
