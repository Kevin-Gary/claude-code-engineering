<!-- 📘 REVIEW.md tunes Anthropic's managed Code Review for this repo: review-only guidance that does
     not belong in CLAUDE.md (which every session loads). Keep it short and specific. -->

# Review guidance for Verdant

## What matters most
- Security in `app/src/app/api/`: input validation, path handling, server-side fetches, and
  anything returned to the browser. Treat these as high severity.
- Tests: a new API route or lib function needs a test in the same PR. A bug fix needs a test that
  would have failed before it. A weakened, skipped or deleted assertion is a blocker unless the PR
  explains why.
- Date math in `app/src/lib/care/`: check month ends, leap years and UTC handling.

## Severity
- **Important**: wrong behavior a user would see, data exposure, an exploitable input.
- **Nit**: naming, style, small readability tweaks. Report at most five nits per PR.

## Skip
- `package-lock.json`, generated Playwright agent files in `.claude/agents/playwright-test-*.md`,
  and anything under `docs/learn/`.
- Copy and design-token issues: the `copy-polish` and `design-reviewer` agents cover those.
