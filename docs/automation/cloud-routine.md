<!-- 📘 A CLOUD ROUTINE: runs on Anthropic's cloud on a fresh clone of a GitHub repo, triggered by a
     schedule, an API call, or a GitHub event. Routines are in research preview. Create one at
     claude.ai/code/routines (or `/schedule` in the CLI). -->

# Review every new pull request (cloud routine with a GitHub trigger)

## Setup
1. Install the Claude GitHub App on the repository (required for GitHub event triggers).
2. Create a routine at claude.ai/code/routines and add this repository.
3. Add a trigger: **GitHub event**, `pull_request.opened` (optionally also `synchronize`).
4. Environment: add a setup script of `npm ci` so the routine can run the checks.

## Instructions (paste this)

```
A pull request was opened. Check out its branch.

1. Run `npm run check`. Note any failure.
2. Run /verdant-review against `git diff origin/main...HEAD`.
3. Post ONE pull request comment with: the check result, the review verdict, and the findings
   grouped by severity with file:line. Keep it under 40 lines.

Do not push commits to the pull request branch.
```

## Things to know
- A routine runs as **you**: comments and commits carry your GitHub identity, and runs count
  against your usage.
- Each event starts a fresh session on a fresh clone. Nothing carries over between runs except
  what is committed, which is exactly why committed skills and `CLAUDE.md` matter here.
- The default cloud environment only reaches allowlisted hosts. Add domains to the environment if
  your setup needs more.
- Compare with `.github/workflows/claude-review.yml`: the Action runs on GitHub's runners and your
  API key; the routine runs on Anthropic's cloud and your Claude account.
