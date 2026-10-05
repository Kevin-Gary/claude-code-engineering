---
name: verdant-review
description: Review the current code changes against Verdant's team review checklist (correctness, tests, input validation, output encoding, secrets and PII, design tokens, brand voice) and report findings by severity with file:line and a concrete fix.
when_to_use: Use when the user says "review my changes", "review this diff", "check this before I open a PR", or asks for a team-standard code review. For a fresh second opinion, run it in a new session from the one that wrote the code.
argument-hint: "[optional focus, e.g. security or app/src/lib]"
allowed-tools: Bash(git diff *) Bash(git status *) Read Grep Glob
---
<!-- 📘 A TEAM REVIEW SKILL. Three things to notice:
     1. The `!` lines below run BEFORE Claude sees the skill. Their output (the real diff) replaces
        the command, so the review starts from facts, not from Claude guessing what changed. The
        commands must be allowed (see `allowed-tools` above) or the skill aborts.
     2. The checklist lives in a supporting file, checklist.md. SKILL.md stays short; Claude opens
        the checklist when it runs. Long reference material belongs in supporting files.
     3. The name is `verdant-review`, not `code-review`. A project skill with a bundled skill's name
        REPLACES the bundled one, so `/code-review` stays Anthropic's and this stays ours.
     Any stack: keep the shape, rewrite checklist.md for your language and your team's rules. -->

# Verdant code review

## The change under review

Files touched (including new, untracked files):
!`git status --short`

Diff summary against the last commit:
!`git diff HEAD --stat`

Full diff:
!`git diff HEAD`

If both are empty, the work is already committed. Run `git diff main...HEAD` yourself (or review
the paths the user named) instead.

Extra focus from the user, if any: $ARGUMENTS

## How to review

1. Read [checklist.md](checklist.md). It is the team's definition of "reviewed".
2. For every changed file, open the full file, not only the diff hunk. Many bugs live in the code
   the diff calls but does not show.
3. Check each checklist item. Only report what you can point at: a file, a line, and why it is wrong.
4. Do not edit anything. This skill reports; the author fixes.

## Report format

Group findings by severity: **Blocker**, **Should fix**, **Nit** (at most five nits).

For each finding:
- `path/to/file.ts:LINE`: what is wrong, in one sentence
- Why it matters (the failure, the exploit, or the user who sees it)
- The fix, as a short code snippet or a precise instruction

End with a one-line verdict: "Ready to merge", "Merge after fixes", or "Needs another pass".
