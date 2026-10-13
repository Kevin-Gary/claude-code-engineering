#!/usr/bin/env bash
# 📘 SessionStart hook for CLOUD sessions (claude.ai/code, the Desktop app's Cloud option, the phone's
# Code tab, `claude --cloud`, and cloud routines). Wired in .claude/settings.json with the matcher
# "startup|resume" and a 600-second timeout.
#
# A cloud session starts on a fresh VM with a fresh clone, so node_modules does not exist and
# `npm run check` would fail. The docs recommend exactly this split:
#   - an environment SETUP SCRIPT (configured on claude.ai) for VM-level tools that are not
#     pre-installed; it runs before Claude Code starts and its result is cached
#   - a SessionStart HOOK (committed, here) for project setup such as installing dependencies
# Hooks run locally too, so the first line makes this a no-op on your laptop: cloud VMs set
# CLAUDE_CODE_REMOTE=true, and it is never true locally.
#
# For SessionStart, whatever this prints to stdout becomes context Claude reads, so npm's output
# goes to a log file and the hook prints one line. It always exits 0: a failed install should not
# stop the session from starting; Claude reads the line and can retry.

if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0

if [ -d node_modules ]; then
  echo "Cloud session: node_modules already present (cached or resumed), skipped npm ci."
  exit 0
fi

if npm ci --no-audit --no-fund > /tmp/verdant-npm-ci.log 2>&1; then
  echo "Cloud session: installed dependencies with npm ci. npm run check is ready to run."
else
  echo "Cloud session: npm ci failed (log: /tmp/verdant-npm-ci.log). Run npm ci before npm run check."
fi
exit 0
