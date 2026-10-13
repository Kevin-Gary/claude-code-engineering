<!-- 📘 loop.md (a note for people reading the file): this replaces the built-in maintenance prompt
     for a BARE `/loop` (or `/loop 15m`) only. `/loop <prompt>` ignores it. This project file wins
     over ~/.claude/loop.md, edits take effect on the next iteration, and anything past 25,000 bytes
     is cut. See docs/automation/SCHEDULING.md. -->

Check the current branch's state.

1. Run `npm run check`.
2. If something fails, report the failing check (lint, typecheck or which test) and the most likely
   cause, with file:line.
3. Fix it only if the fix is small and stays inside files this branch already changed
   (`git diff --name-only main...HEAD` plus `git status --short`). Otherwise report and stop.
4. Never push. Never commit to or switch to `main`. If the current branch is `main`, report only.
5. If everything is green and nothing changed since the last iteration (same `git rev-parse HEAD`,
   same `git status --short`), say so in one line.
