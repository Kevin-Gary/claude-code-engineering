#!/usr/bin/env bash
# 📘 A HOOK is a shell script Claude Code runs automatically at a fixed point in a session's
# lifecycle (SessionStart, PreToolUse, PostToolUse, Stop and about two dozen more). This one is a
# STOP hook: it fires when Claude is about to finish its turn and yield back to you. It's wired
# up in .claude/settings.json under "hooks.Stop".
#
# What it does: once per throttle window, it nudges Claude to write any durable decisions into
# MEMORY.md before yielding. It does that by printing {"decision":"block","reason":"..."} to
# stdout, which tells Claude "don't stop yet, here's something to handle first."
#
# Native, zero dependencies: it reads the hook's JSON payload from stdin and parses with grep.
# It ALWAYS exits 0 so it can never break your session.

set -euo pipefail

# The Stop-hook JSON payload arrives on stdin. The key field is "stop_hook_active": it's true
# when we're ALREADY inside a stop-hook-triggered continuation. If we blocked again there, we'd
# loop forever, so we bail out immediately in that case.
payload="$(cat)"

# Off switches. Claude Code has no way to disable ONE hook while keeping it configured (only
# "disableAllHooks"), so a hook that should sometimes stay quiet needs its own switch:
#   - VERDANT_SKIP_MEMORY_NUDGE=1: set it in your .claude/settings.local.json "env" block while you
#     teach or demo (see CLAUDE.local.md.example).
#   - CI or VERDANT_HEADLESS: scripted `claude -p` runs (CI review, scripts/token-usage.sh) should
#     never spend turns editing MEMORY.md.
if [ -n "${VERDANT_SKIP_MEMORY_NUDGE:-}${CI:-}${VERDANT_HEADLESS:-}" ]; then
  exit 0
fi

if printf '%s' "$payload" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

# Throttle: only nudge once per window so we're not nagging on every single turn. The stamp file
# lives in a temp dir (kept out of the repo). Lower WINDOW_SECONDS to see it fire more often in a
# live demo; raise it for everyday use. Teaching a live class? Set VERDANT_SKIP_MEMORY_NUDGE (above)
# so the nudge does not interrupt a demo mid-sentence.
WINDOW_SECONDS=1800
stamp="${TMPDIR:-/tmp}/claude-code-tutorial-memory-nudge"
now="$(date +%s)"
if [ -f "$stamp" ]; then
  last="$(cat "$stamp" 2>/dev/null || echo 0)"
  if [ $(( now - last )) -lt "$WINDOW_SECONDS" ]; then
    exit 0
  fi
fi
printf '%s' "$now" > "$stamp"

# Emit the block. Claude sees "reason" and gets one chance to update memory before it stops.
printf '%s\n' '{"decision":"block","reason":"Before finishing: if this turn produced a durable decision or a gotcha worth remembering, append a short dated entry to MEMORY.md (full reasoning goes in decisions.md). If nothing durable happened, just stop."}'
exit 0
