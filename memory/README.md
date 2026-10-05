<!-- 📘 The team's notes folder. Nothing here is @imported, so none of it costs context until Claude
     reads it. CLAUDE.md tells Claude this folder exists; Claude opens or greps the file it needs when
     a task touches a past decision. That is the "load on demand" pattern: the always-loaded file
     holds a pointer, the knowledge lives one hop away. -->

# memory/: notes Claude looks up when it needs them

Durable project knowledge that is too specific for CLAUDE.md and too important to lose. Nothing in
this folder loads by default. CLAUDE.md points here, and Claude reads a file when a task touches it.

## What's here

| File | What goes in it |
| --- | --- |
| `notes.md` | Short, dated gotchas and decisions, newest first. One to three lines each. |
| `decisions.md` | The full reasoning behind a decision (Context / Decision / Consequences). |

When a topic outgrows `notes.md` (deploys, the data model, a tricky integration), give it its own
file here and add a row to this table, so Claude can find it.

## What belongs here

- A gotcha that cost real time and will happen again.
- A decision someone could reasonably undo without knowing why it was made.
- A fact about the domain or another system that Claude can't read from the code.

## What doesn't

- A rule for every session: `CLAUDE.md`, or a path-scoped rule in `.claude/rules/`.
- A fact that's only true on your machine: `CLAUDE.local.md`.
- Where the current task stands: `HANDOFF.md` (run `/handoff`).
- Anything Claude can read from the code or the git history.
- Secrets. Ever.

## Adding an entry

Ask Claude ("add a note to memory/notes.md: the care-guide slugs are lowercase, and why") or write it
yourself. Either way it is an ordinary diff, reviewed in the PR like code. The shape:

```markdown
## 2026-10-05 - Gotcha: <one-line title>
What happened and what to do instead. Full reasoning, if any: memory/decisions.md 2026-10-05.
```

## How this differs from Claude's built-in memory

- **Auto memory** (`~/.claude/projects/<repo>/memory/`): Claude's own notes, on your machine only.
  "Remember that..." lands there. Your teammates never see it.
- **Agent memory** (`.claude/agent-memory/<agent>/`): one agent's notes, written by that agent,
  committed and shared.
- **This folder**: the team's notes, written on purpose (by people, or by Claude when you ask),
  committed, reviewed, and loaded only when needed.

When a personal auto-memory note keeps proving useful, promote it: move it here (or into
`CLAUDE.md`) in a PR so the whole team gets it.
