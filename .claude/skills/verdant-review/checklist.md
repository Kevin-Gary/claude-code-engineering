# Verdant review checklist

A supporting file for the `verdant-review` skill. Claude reads it only when the skill runs, so it
can grow without costing context in every session.

## 1. Correctness
- Does the code do what the change set out to do, including edge cases (empty input, zero,
  the last day of a month, leap years, timezones, very long strings)?
- Are dates handled as the convention says (ISO `YYYY-MM-DD`, UTC math)?
- Are errors handled, or can an exception escape as a 500 with a stack trace?

## 2. Tests
- Is there a test for the new behavior, next to the code (`*.test.ts`) or in `e2e/`?
- Does a bug fix come with a test that failed before the fix?
- Was any existing assertion weakened, skipped or deleted? That is a Blocker unless the PR says why.

## 3. Input at the boundary (API routes, forms, URL params)
- Is every field from the outside world validated for type, shape and length before use?
- Is user input ever used to build a file path, a URL to fetch, a shell command, a query, or HTML?
  If so, is it constrained to an allowlist?

## 4. Output
- Is user-supplied text ever rendered as HTML (`dangerouslySetInnerHTML`, `innerHTML`)? React
  escapes text by default; anything that bypasses that needs a very good reason.
- Do API responses return only the fields the caller needs? Emails, internal ids and timestamps
  leak easily.

## 5. Secrets and personal data
- No keys, tokens or passwords in code, tests, fixtures or logs.
- Personal data (emails, full names) is not logged and not exposed beyond what the feature needs.

## 6. Design system and copy (app/)
- Colors, spacing and type come from the design tokens, never hardcoded hex or pixel values.
- User-facing copy follows the brand voice: second person, short sentences, no hype words, no em-dashes.

## 7. Scope
- Is the change as small as it can be? Unrelated refactors belong in their own PR.
