<!-- 📘 How this repo behaves in a Claude Code CLOUD session, and how to drive one from your phone.
     Facts checked against the Claude Code docs (claude-code-on-the-web, cloud-environments,
     remote-control, mobile) on 2026-10-12. -->

# Run this repo in a Claude Code cloud session

A cloud session is a Claude Code session on a fresh VM in Anthropic's cloud (Ubuntu 24.04, your
repo cloned from GitHub, common toolchains pre-installed). It keeps running when you close your
laptop, and you can check on it from a browser, the Desktop app or your phone. It counts toward your
plan's usage like any other session.

## What carries over from this repo

The VM starts from a fresh clone. What is committed comes with it; what lives only on your machine
does not.

| | In a cloud session? | Why |
| --- | --- | --- |
| `CLAUDE.md` (and `app/CLAUDE.md`) | Yes | Part of the clone |
| `.claude/settings.json` hooks and permission rules | Yes, in a session with one repository | Part of the clone |
| `.mcp.json` servers | Yes, in a session with one repository | Part of the clone |
| `.claude/rules/` | Yes | Part of the clone |
| `.claude/skills/`, `.claude/agents/`, `.claude/commands/` | Yes | Part of the clone |
| Plugins turned on in `.claude/settings.json` (this repo's `example-skills`) | No | Cloud sessions do not install plugins from repo or user settings |
| Anything in `~/.claude/` (your CLAUDE.md, skills, agents, settings) | No | Lives on your machine |
| MCP servers you added at user or local scope | No | Stored in `~/.claude.json` on your machine |
| `node_modules`, `.env` files, anything gitignored | No | Not in git |

Inside the VM, `CLAUDE_CODE_REMOTE` is set to `true`. Locally it never is.

## The hook that installs dependencies

A fresh clone has no `node_modules`, so `npm run check` would fail. This repo fixes that with a
SessionStart hook, registered in `.claude/settings.json`:

```json
{
  "matcher": "startup|resume",
  "hooks": [
    { "type": "command", "command": "bash \"$CLAUDE_PROJECT_DIR/scripts/cloud/session-start.sh\"", "timeout": 600 }
  ]
}
```

[`scripts/cloud/session-start.sh`](../../scripts/cloud/session-start.sh) exits immediately unless
`CLAUDE_CODE_REMOTE` is `true`, so it costs nothing locally. In the cloud it runs `npm ci` once
(skipped when `node_modules` already exists, for example on resume) and prints one line that
Claude reads. It always exits 0, so a failed install never blocks the session.

Why a hook and not the environment's setup script: the docs split the two jobs. A **setup script**
(configured on claude.ai, cached, runs before Claude Code starts) provisions the VM: tools that are
not pre-installed. A **SessionStart hook** (committed, runs in every session) does project setup
such as `npm install`. The hook travels with the repo, so every teammate's cloud session gets it.

## Recommended environment

- **Network access: Trusted** (the Default environment). The npm registry is on the default
  allowlist, so `npm ci` works. GitHub goes through its own proxy at any level.
- **Environment variables: none needed.** Do not put secrets in them: anyone who uses the
  environment can read them.
- **Setup script: none needed for this repo.** Use one only for VM-level tools that are missing,
  for example `apt update && apt install -y shellcheck`. Append `|| true` to anything non-critical:
  a setup script that exits non-zero stops the session from starting.
- **End-to-end tests**: Playwright downloads its browsers from its own CDN, which is not on the
  Trusted list. Run `npm run test:e2e` locally or in CI, or allow that host with **Custom**
  network access.

## Start a session

- **Browser**: claude.ai/code, pick the repo and branch, describe the task.
- **Desktop app**: start a session and choose **Cloud** instead of **Local**.
- **Phone**: the **Code** tab in the Claude app.
- **Terminal**: `claude --cloud "Run npm run check and fix what fails"`. When the Claude GitHub
  App is installed on the repo, the VM clones your GitHub remote **at your current branch**, not
  your local checkout, so push first. (Without the app, or with no remote, Claude Code uploads a
  bundle of your local repo instead.)

## Follow up, pull it back, let it fix PRs

- **Send a follow-up from any terminal**: `claude -p "now add a test for that" --cloud <session-id>`
  queues one message into the running session and exits.
- **Continue it locally**: `claude --teleport` (a picker) or `claude --teleport <session-id>`, or
  `/teleport` inside a session. Your working tree must be clean, you must be in a checkout of the
  same repo, and the session's branch must be pushed. Teleport fetches the branch and loads the
  conversation; from then on the local copy is separate from the cloud one.
- **Auto-fix pull requests**: with the Claude GitHub App installed, Claude can watch a PR and
  respond to CI failures and review comments. Turn it on from the session's CI status bar, with
  `/autofix-pr` on the PR's branch, or by asking from the phone ("watch this PR and fix CI").

## If your code is on Bitbucket

Cloud sessions and routines need GitHub to clone and to push. For a Bitbucket repo you have three
options:

1. **Upload a bundle**: `CCR_FORCE_BUNDLE=1 claude --cloud "..."` sends your local repo (tracked
   files and history, under 100 MB; untracked files are left out). The session can read and test
   the code, but it cannot push back to Bitbucket. Bring the result home with `--teleport` or by
   copying the diff.
2. **Remote Control**: the session runs on your machine, so it works with any git host. See below.
3. **A GitHub pilot repo**: mirror one repository to GitHub to try cloud sessions, routines and
   auto-fix end to end before deciding anything bigger.

## From your phone

Claude Code has no separate mobile app. Both of these live in the **Code** tab of the Claude app
(iOS and Android), signed in with the same claude.ai account. Run `/mobile` in any Claude Code
session for a QR code to the app store.

- **Cloud sessions**: start or check a cloud session from the phone; it keeps running in the cloud
  after you put the phone away.
- **Remote Control**: run `/remote-control` in a Desktop or CLI session (or start with
  `claude remote-control`), then pick the session in the Code tab or scan the QR code. The phone is
  a window into the session on YOUR machine: your files, tools and MCP servers. The machine must
  stay on and the session must keep running; if it sleeps, it reconnects when it wakes.
- From the phone you can pick Accept edits, Plan or Auto (and Manual for Remote Control), but never
  Bypass permissions.
