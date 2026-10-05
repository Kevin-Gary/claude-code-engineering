<!-- 📘 Act 1 and Act 2 reference: tokens and the context window, for engineers who want the
     internals. The facts here come from the Claude Code docs pages "context-window",
     "prompt-caching" and "how-claude-code-works". -->

# Tokens and the context window

## Tokens in, tokens out

- **Input tokens**: everything the model reads on a request. **Output tokens**: everything it
  writes, including tool calls and extended thinking. Output is priced higher than input.
- **The model is stateless.** Every turn, Claude Code re-sends the whole context: system prompt,
  tool definitions, project context, every earlier message and tool result, plus your new message.
  A 40-turn session re-sends turn 1 forty times.
- That is why the **context window** (how much fits in one request) and **prompt caching** (not
  paying full price to re-read the same prefix) are the two numbers that matter.

## What is in the window, in order

| Layer | What | Changes when |
| --- | --- | --- |
| System prompt | Core instructions, tool definitions (incl. MCP tool names) | The set of tools changes |
| Project context | CLAUDE.md files, auto memory, unscoped rules, skill descriptions | Session start, `/clear`, `/compact` |
| Conversation | Your messages, Claude's replies, every tool result | Every turn |

Loaded **at startup**, before you type: CLAUDE.md (and its `@imports`), auto memory (first 200
lines or 25 KB), always-on rules, skill **descriptions** (not bodies), MCP tool **names**.

Loaded **on demand**, as work happens: file contents, path-scoped rules (when a matching file is
read), nested CLAUDE.md (when Claude enters that folder), full skill bodies (when invoked), MCP
tool schemas (fetched via tool search when Claude needs a tool), hook output.

## Prompt caching: why order matters

The API caches by **prefix**: if the start of this request exactly matches the start of a recent
one, that part is read from cache (much cheaper and faster) and only the new tail is processed.
The match is exact. Change anything early in the prefix and everything after it is reprocessed.

Things that **break** the cache: switching models, changing the effort level, turning on fast
mode, denying an entire tool, `/compact` (it rewrites the conversation), upgrading Claude Code.
MCP servers are a special case. With tool search on (the default on supported models), Claude
Code keeps the first request's tool list for the whole conversation, so a server connecting
mid-session does not disturb the cache. Only when tools load upfront (tool search off, a custom
gateway, some providers) does adding or removing a server break it.
Things that **keep** it: editing files (Claude gets a "file changed" note appended), changing
permission mode, invoking skills (they append to the conversation), spawning a subagent, and
`/rewind` (it truncates back to a prefix that is already cached). Editing the root CLAUDE.md
mid-session also keeps the cache, because the edit does not apply until `/clear`, `/compact` or a restart.

Practical rule: pick your model and effort at the start, and `/compact` at natural breaks.

## When the window fills up

Claude Code first clears old tool outputs, then **compacts**: it replaces the conversation with a
structured summary. After a compaction:

| Mechanism | What happens |
| --- | --- |
| Root CLAUDE.md, unscoped rules, auto memory | Re-injected from disk |
| Path-scoped rules, nested CLAUDE.md | Gone until Claude reads a matching file again |
| Files Claude was working on | Up to five re-read, most recently modified first |
| Invoked skills | Re-injected, capped (5,000 tokens each, 25,000 total) |
| SessionStart hooks with matcher `compact` | Run again; their output is added |

So: anything that must survive compaction belongs in the root CLAUDE.md, an unscoped rule, or a
SessionStart hook with the `compact` matcher. This repo's `.claude/hooks/session-context.sh` is that hook.

## Your controls

- **The context indicator in the desktop app**: a live breakdown of what is using the window, by
  category. (In a terminal session, `/context` prints the same breakdown.)
- **`/compact focus on <x>`**: compact now and tell the summary what to keep. CLAUDE.md's
  "Compact instructions" section does the same for automatic compaction.
- **`/clear`**: start fresh between unrelated tasks. Old conversation costs tokens every turn.
- **Subagents**: a subagent reads 30 files in its own window and hands back one paragraph.
- **`disable-model-invocation: true`** on rarely used skills keeps even their description out.
- **1M-token models** exist (recent Opus, Sonnet and Fable models). Compaction works the same,
  later. A bigger window is not a substitute for a clean one: long contexts cost more per turn.

## Try it (Act 1 exercise)

From a terminal at the repo root: `bash scripts/token-usage.sh`. It runs the same headless question
twice and prints the token usage of each run. On the second run, look at `cache_read_input_tokens`:
the repeated prefix is read from cache.

Any stack: none of this depends on your language. It is how every Claude session works.
