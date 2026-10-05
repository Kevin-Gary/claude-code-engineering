#!/usr/bin/env bash
# 📘 SessionStart hook: inject a few live facts at the start of a session. Wired in settings.json with
# the matcher "startup|resume|compact", so it also runs right after /compact, when the conversation
# has just been summarized and these facts are most likely to have been squeezed out.
#
# For SessionStart, plain text printed to stdout becomes context Claude can see. Static facts belong
# in CLAUDE.md; this hook is for things that CHANGE (branch, recent commits, a handoff note).
# Keep it fast: it runs on every session start.

set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

echo "Project state at session start:"
echo "- Branch: $(git branch --show-current 2>/dev/null || echo unknown)"
echo "- Uncommitted files: $(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
echo "- Recent commits:"
git log --oneline -5 2>/dev/null | sed 's/^/    /'
echo "- Verify changes with: npm run check (lint + typecheck + unit tests); npm run test:e2e for UI flows."

if [ -f HANDOFF.md ]; then
  echo "- HANDOFF.md exists. It is the previous session's handoff note: read it before starting."
fi
exit 0
