---
description: Draft a changelog line and a clean commit message for the current changes
disable-model-invocation: true
argument-hint: "[optional extra direction]"
---
<!-- 📘 This used to live in .claude/commands/ship-update.md. Custom commands have merged into
     skills: a skill folder with a SKILL.md gives you the same /ship-update, plus supporting files
     and frontmatter like `disable-model-invocation`. Old .claude/commands/ files still work; new
     ones belong here. With no `name` field, the folder name becomes the command name.
     `disable-model-invocation: true` keeps this a manual command: only you type /ship-update.
     `$ARGUMENTS` is replaced by whatever you type after the command, e.g.
     `/ship-update focus on the pricing section`. -->

Review the current staged and unstaged changes (`git diff` and `git diff --staged`).

Then produce:
1. A single-line changelog entry for Verdant, written for users (impact, not implementation).
2. A clean conventional-commit message (`type(scope): summary`) with a short body if needed.

Extra direction from me: $ARGUMENTS
