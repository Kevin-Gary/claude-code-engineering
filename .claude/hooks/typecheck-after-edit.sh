#!/usr/bin/env bash
# 📘 PostToolUse hook: after Claude edits or writes a TypeScript file, run the type checker and hand
# any errors straight back to Claude. Wired in .claude/settings.json under "PostToolUse" with the
# matcher "Edit|Write".
#
# The trick is the exit code. For PostToolUse, exit 2 does not undo the edit (it already happened);
# it SHOWS STDERR TO CLAUDE. So Claude sees "app/src/x.ts(12,3): error TS2322 ..." on the very next
# step and fixes it without you pasting anything. Exit 0 means "all good, say nothing".
#
# Keep a hook like this FAST: it runs on every edit. tsc is incremental here, so a re-check takes a
# couple of seconds. Alternatives: the code-intelligence (LSP) plugin gives Claude type errors
# without a hook, and lint-on-edit works the same way with eslint instead of tsc.
# Any stack: swap the command for mypy, pyright, `go vet`, `cargo check` or `mvn -q compile`.

set -uo pipefail

payload="$(cat)"
file="$(printf '%s' "$payload" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(JSON.parse(s).tool_input?.file_path??"")}catch{}})')"

case "$file" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
tsc="$root/node_modules/.bin/tsc"
[ -x "$tsc" ] || exit 0   # Dependencies not installed yet: nothing to check against.

case "$file" in
  "$root"/app/*|app/*) project="$root/app" ;;
  "$root"/e2e/*|e2e/*|*playwright.config.ts) project="$root" ;;
  *) exit 0 ;;
esac

if ! output="$("$tsc" --noEmit -p "$project" 2>&1)"; then
  {
    echo "TypeScript errors after this edit (tsc -p ${project#"$root"/}):"
    printf '%s\n' "$output" | head -40
    echo "Fix these before moving on."
  } >&2
  exit 2
fi
exit 0
