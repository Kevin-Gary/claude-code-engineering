<!-- 📘 A CLOUD ROUTINE: runs on Anthropic's cloud on a fresh clone of a GitHub repo, triggered by a
     schedule, an API call, or a GitHub event. Routines are in research preview. Create one at
     claude.ai/code/routines (or `/schedule` in the CLI). -->

# Review every new pull request (cloud routine with a GitHub trigger)

## Setup
1. Install the Claude GitHub App on the repository (required for GitHub event triggers).
2. Create a routine at claude.ai/code/routines and add this repository.
3. Add a trigger: **GitHub event**, `pull_request.opened` (optionally also `synchronize`).
4. Environment: the Default one is enough. The repo's SessionStart hook
   (`scripts/cloud/session-start.sh`) runs `npm ci` in cloud sessions, so no setup script is needed.

## Prompt

```
/pr-check
```

The instructions live in the committed skill
[`.claude/skills/pr-check/SKILL.md`](../../.claude/skills/pr-check/SKILL.md): the routine's prompt is
one line, and a change to the skill reaches the routine on its next run.

## Things to know
- A routine runs as **you**: comments and commits carry your GitHub identity, and runs count
  against your usage.
- Each event starts a fresh session on a fresh clone. Nothing carries over between runs except
  what is committed, which is exactly why committed skills and `CLAUDE.md` matter here.
- The default cloud environment only reaches allowlisted hosts. Add domains to the environment if
  your setup needs more.
- Compare with `.github/workflows/claude-review.yml`: the Action runs on GitHub's runners and your
  API key; the routine runs on Anthropic's cloud and your Claude account.
