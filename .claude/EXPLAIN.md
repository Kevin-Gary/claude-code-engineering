# The .claude folder

This is Claude Code's home for THIS project. Claude recognizes these files and folders by name.
Everything here is committed and shared with the team, except where noted.

- `settings.json`: the control panel. Permissions (allow / ask / deny), hooks, MCP and plugin
  settings. Committed, so the whole team shares the same guardrails.
- `settings.local.json`: your personal overrides, gitignored. Same shape. When you click
  "Yes, don't ask again", the new rule lands here.
- `rules/`: modular instructions. No frontmatter: loads every session, like CLAUDE.md.
  `paths:` frontmatter: loads only when Claude touches matching files (`app-conventions.md`,
  `testing.md`).
- `skills/`: reusable recipes and slash commands (see `skills/EXPLAIN.md`). Custom commands have
  merged into skills: `skills/ship-update/SKILL.md` is `/ship-update`. The old `commands/` folder
  still works, but new ones go here.
- `agents/`: subagent definitions (see `agents/PRIMER.md`).
- `agent-memory/`: persistent notes written BY agents that set `memory: project`. Committed, so
  the team shares what the agent learned.
- `hooks/`: scripts attached to lifecycle events in `settings.json`. This project has:
  - `session-context.sh` (SessionStart, also after /compact): injects branch, recent commits and
    any HANDOFF.md.
  - `guard.mjs` (PreToolUse on Bash, Edit, Write): blocks dangerous commands and protected paths.
  - `typecheck-after-edit.sh` (PostToolUse on Edit, Write): runs tsc and feeds errors back to Claude.
  - `notify.sh` (Notification): a desktop ping when Claude waits on you (terminal sessions).
  - A Stop hook (inline in `settings.json`): saves this session's plan-mode plan into `plans/`.
- `workflows/`: saved dynamic workflows (JavaScript that orchestrates many subagents). A saved
  workflow runs as `/<name>`, for example `/verdant-design-audit`.
- `launch.json`: how the Claude desktop app starts the dev server for its preview pane.

Think of it this way: CLAUDE.md at the root is the always-loaded project bible. The .claude
folder is the toolbox Claude reaches into.
