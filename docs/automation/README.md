<!-- 📘 Act 7 reference: every way to run Claude without you typing in a chat box. -->

# Scale and automation

## Pick the right runner

| | `/loop` | Desktop local routine | Cloud routine | GitHub Action | Headless `claude -p` in CI |
| --- | --- | --- | --- | --- | --- |
| Runs on | your machine, in the session | your machine | Anthropic cloud | GitHub runners | any CI runner |
| Needs your machine on | yes | yes | no | no | no |
| Needs an open session | yes | no | no | no | no |
| Sees local files | yes | yes | no (fresh clone) | checkout | checkout |
| Triggers | interval (min 1 min) | schedule (min 1 min) | schedule (min 1 h), API, GitHub events | any GitHub event | any CI event |
| Good for | "watch this while I work" | nightly checks of your local repo | PR review on GitHub, scheduled reports | team PR review, `@claude` in issues | Bitbucket, Jenkins, anything else |

Running the same check on a schedule in more than one of these? Commit it as a skill and point
each scheduler at `/skill-name`: [SCHEDULING.md](SCHEDULING.md) (and why there is no
`.claude/scheduled-tasks/` folder).

## The pieces in this repo

- **`/loop`**: `/loop 2m run npm test and tell me only when the result changes`. Stops when you
  close the session. A bare `/loop` runs `.claude/loop.md`, this repo's default loop prompt.
- **Scheduled skills**: `/morning-health` (daily) and `/dependency-audit` (weekly), report-only,
  written to be the one-line prompt of any scheduler. See [SCHEDULING.md](SCHEDULING.md).
- **Desktop local routine**: [desktop-routine.md](desktop-routine.md), a ready-to-paste nightly check.
  It fires only while the desktop app is open and your computer is awake; a missed run catches up
  when the machine wakes.
- **Cloud routine**: [cloud-routine.md](cloud-routine.md), review every new pull request on GitHub.
- **GitHub Actions**: `.github/workflows/ci.yml` (no AI, the deterministic gate) and
  `.github/workflows/claude-review.yml` (AI review with the official action).
- **Headless in any CI**: `ci-examples/bitbucket-pipelines.yml` + `scripts/ci/claude-review.sh`
  (PR review) and `scripts/ci/morning-health.sh` (a scheduled `custom: nightly-health` pipeline,
  the team-owned version of `/morning-health`). A pattern, not an official integration.
- **Dynamic workflows**: `.claude/workflows/verdant-design-audit.js` fans out one reviewer per
  component, then a skeptic per finding. Runs as `/verdant-design-audit`.
  `.claude/workflows/api-input-audit.js` does the same for every API route with the
  `security-reviewer` and `verifier` agents. Runs as `/api-input-audit`.

## Parallel work

- **Subagents in parallel**: "Use the security-reviewer agent on each API route in parallel."
  Each runs in its own context; you get one summary per route.
- **Worktrees**: an isolated checkout per task so parallel sessions never touch the same files.
  CLI: `claude --worktree`. Desktop: the worktree option when you start a session. Agents:
  `isolation: worktree` in frontmatter. Each worktree needs its own `npm install`; list gitignored
  files to copy in with a `.worktreeinclude` file.
- **Agent teams**: experimental, behind `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. Interactive CLI
  sessions only (not Desktop, not `claude -p`); a cloud session can enable them with the same
  variable on its environment. Teammates message each other. Not enabled in this repo (it changes
  how named subagents launch). Who talks to whom: `.claude/agents/ORCHESTRATION.md`.

## Leaving your desk

- **Remote Control**: run `/remote-control` in a session and continue it from the Claude app on
  your phone or another computer. The session keeps running on your machine.
- **Cloud sessions**: start a session at claude.ai/code on a GitHub repo. It runs in Anthropic's
  cloud on a fresh clone and can open a pull request. Cloning and pull requests need GitHub. A
  GitLab or Bitbucket repo can still go to a cloud session as an uploaded bundle
  (`CCR_FORCE_BUNDLE=1 claude --cloud "..."`), but that session cannot push back to the remote.
  This repo is ready for cloud sessions (a SessionStart hook installs dependencies there):
  [../cloud/README.md](../cloud/README.md), which also covers working from your phone.
