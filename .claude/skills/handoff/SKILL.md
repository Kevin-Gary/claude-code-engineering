---
name: handoff
description: Write HANDOFF.md, a short note that lets a fresh session (or a teammate) pick up this work exactly where it stopped.
disable-model-invocation: true
argument-hint: "[optional note about what comes next]"
---
<!-- 📘 A HANDOFF skill. Long sessions fill the context window; /compact summarizes, but a fresh
     session with a crisp written handoff is often better. This skill writes that note.
     `disable-model-invocation: true` means only YOU can run it (type /handoff). Claude will not
     decide on its own to write one.
     HANDOFF.md is gitignored (it is personal and short-lived), and the SessionStart hook in
     .claude/hooks/session-context.sh tells the next session to read it first.
     Any stack: this works in any repo; nothing here is language-specific. -->

# Write a handoff

Write `HANDOFF.md` at the repo root using [template.md](template.md). Fill it from THIS
conversation, not from memory of the repo:

- Be specific: file paths, function names, test names, exact commands, error messages.
- Record what failed and why, so the next session does not repeat it.
- Keep it under 60 lines. It is a baton, not a report.

Extra note from the user: $ARGUMENTS

When done, tell the user: "Handoff written. Start a new session; it will read HANDOFF.md first."
