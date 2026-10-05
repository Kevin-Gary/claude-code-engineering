#!/usr/bin/env bash
# 📘 Notification hook: ping you when Claude needs you (a permission prompt is waiting, or it has
# been idle for a minute). Wired in settings.json with the matcher "permission_prompt|idle_prompt".
#
# Hooks have no terminal of their own, so instead of writing escape codes directly, this prints
# {"terminalSequence": "..."} and Claude Code emits the notification itself (OSC 9 for iTerm2,
# Windows Terminal and WezTerm; OSC 777 for Ghostty and Warp). This matters most in a terminal:
# the Claude desktop app already shows native notifications on its own.

payload="$(cat)"
printf '%s' "$payload" | node -e '
let s = "";
process.stdin.on("data", (d) => (s += d)).on("end", () => {
  let message = "Claude needs your attention";
  try { message = JSON.parse(s).message || message; } catch {}
  const clean = message.replace(/[\u0000-\u001f;]/g, " ").slice(0, 200);
  const seq = `\u001b]9;${clean}\u0007\u001b]777;notify;Claude Code;${clean}\u0007`;
  process.stdout.write(JSON.stringify({ terminalSequence: seq }));
});'
exit 0
