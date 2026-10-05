<!-- 📘 Act 4 reference: how you decide what Claude may do on its own. Three layers stack: a
     permission MODE sets the baseline, permission RULES in settings.json carve exceptions, and
     HOOKS run your own code around each tool call. Facts from the Claude Code docs pages
     "permission-modes", "permissions" and "hooks". Any stack: none of this depends on your language. -->

# Control: modes, rules and hooks

## Layer 1. Permission modes (the baseline)

A mode answers one question: what can Claude do without asking you? Switch it with Shift+Tab in
the terminal, or the mode selector in the desktop app. Set a default for the project with
`"defaultMode"` under `permissions` in `settings.json`.

| Mode | Runs without asking | Use it for |
| --- | --- | --- |
| `default` (shown as **Manual**) | Reads only | Sensitive work, code you do not know yet |
| `acceptEdits` | Reads, file edits, common file commands (`mkdir`, `mv`, `cp`) | Iterating on code you are watching |
| `plan` | Reads; edits wait until you approve a plan | Exploring and agreeing on an approach first |
| `auto` | Everything, with a classifier model checking each action | Long tasks, fewer prompts |
| `dontAsk` | Only pre-approved tools; anything that would prompt is denied | CI and scripts with an exact allowlist |
| `bypassPermissions` | Everything | Throwaway containers and VMs only |

Two things hold in every mode: **deny rules always block**, and an **ask rule always prompts**.

## Layer 2. Permission rules (`.claude/settings.json`)

```json
"permissions": {
  "allow": ["Bash(npm run *)"],
  "ask":   ["Bash(git push *)", "Edit(**/package.json)"],
  "deny":  ["Read(**/.env)", "Bash(rm -rf *)"]
}
```

- **Order: deny, then ask, then allow.** The first match wins, and a more specific allow rule
  cannot carve an exception out of a broader deny.
- **Bash rules match the command text.** `Bash(rm -rf *)` does not match `rm -r -f .`. A rule is a
  guard rail for the form Claude usually writes, not a security boundary.
- **Read and Edit rules follow the file,** including Bash commands Claude Code recognizes (`cat`,
  `head`, `tail`, `sed`, redirects). They cannot see a `grep -r pattern .` that never names the
  file, or a script that opens it itself.
- **Where rules live:** `settings.json` (team, committed), `settings.local.json` (you, gitignored;
  "Yes, don't ask again" writes here), `~/.claude/settings.json` (you, every project), and managed
  settings from IT, which nothing else overrides.

## Layer 3. Hooks (your code, run by Claude Code)

A hook is a script that runs at a fixed point: before a tool call (`PreToolUse`), after one
(`PostToolUse`), when a session starts, when Claude stops, and more. In this repo:

| Hook | File | Teaches |
| --- | --- | --- |
| PreToolUse guard | `.claude/hooks/guard.mjs` | Block with exit 2, deny or ask with JSON |
| PostToolUse typecheck | `.claude/hooks/typecheck-after-edit.sh` | Feed errors back so Claude fixes them |
| SessionStart context | `.claude/hooks/session-context.sh` | Inject facts that change every session, also after `/compact` |
| Notification | `.claude/hooks/notify.sh` | Get pinged when Claude waits on you |
| Stop | `.claude/hooks/persist-memory.sh` | Ask Claude to do one more thing before it yields |

How hooks and rules combine:
- A hook that **exits 2** blocks the call before rules run, even if an allow rule matches.
- A hook that returns **"allow"** cannot override a deny or ask rule. Rules still apply.
- So: rules for the simple, string-shaped cases; a hook for anything that needs parsing or logic.

## When neither is enough

Rules and hooks both inspect what Claude is about to do. For a real wall around files and the
network, turn on the sandbox (`/sandbox`), which the operating system enforces for every process.
