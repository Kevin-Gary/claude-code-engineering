# MCP: connect Claude to your tools

MCP (Model Context Protocol) is an open standard for connecting AI to tools and data. An MCP
server exposes tools (`browser_click`, `query_database`, `create_ticket`); Claude Code connects to
it and Claude can call those tools like its built-in ones.

## The servers in this repo's `.mcp.json`

| Server | Type | What it gives Claude |
| --- | --- | --- |
| `claude_design` | HTTP | Verdant's design system (`/design-sync`). Run `/design-login` once. |
| `claude-code-docs` | HTTP, no auth | Searches the official Claude Code docs. "Use claude-code-docs to look up SessionStart matchers." |
| `playwright` | stdio (`npx @playwright/mcp`) | A real browser Claude can drive: navigate, click, type, read the accessibility tree, screenshot. The QA demo. |
| `playwright-test` | stdio (`npx playwright run-test-mcp-server`) | Tools for Playwright's planner, generator and healer agents. |

## Scopes: who gets the server

- **Project** (`.mcp.json`, committed): everyone who clones the repo. Claude Code asks each
  person to approve project servers the first time.
- **Local** (`claude mcp add <name> ...`, default): just you, just this project.
- **User** (`claude mcp add --scope user ...`): just you, every project.
- **A subagent's `mcpServers:` field**: only that agent. The main conversation never pays for
  its tool descriptions.

## Pin versions in the team file

`.mcp.json` pins `@playwright/mcp@0.0.83`. The Playwright README says `@latest`, which is fine on
your own machine, but a shared config should change only when someone decides to change it.
`--isolated` keeps the browser profile in memory, so two sessions can each run a browser without
fighting over one profile. `--output-dir .playwright-mcp` keeps screenshots in a gitignored folder.

## Secrets: `${VAR}`, never the value

`.mcp.json` is committed, so it must never contain a token. Reference an environment variable
instead, with an optional default: see [`docs/examples/mcp-with-secrets.json`](docs/examples/mcp-with-secrets.json).

```json
"headers": { "Authorization": "Bearer ${GITHUB_TOKEN}" },
"url": "${INTERNAL_API_URL:-https://internal.example.com}/mcp"
```

Each person sets `GITHUB_TOKEN` in their own environment. If it is missing, `/mcp` warns.

## Context cost

MCP tool definitions are deferred by default: only the tool names load at startup, and Claude
fetches a tool's full schema (via tool search) when it needs it. Because of that, a server that
connects mid-session does not break the prompt cache: Claude Code keeps the first request's tool
list and loads late tools on demand. The exception is a setup where tools load upfront (tool
search off, a custom API gateway, some cloud providers); there, adding or removing a server
changes the cached prefix. Setting servers up before you start is still the tidy habit.

## Browser pane vs Playwright MCP

The Claude desktop app has its own built-in browser pane for previewing your app. The Playwright
MCP is different: it is a scriptable browser any Claude Code surface (CLI, IDE, Desktop, CI) can
drive, and its actions map one-to-one onto Playwright test code. When you want the browser work
to become a committed test, say "use the playwright MCP" (or use the `qa-explorer` agent).

Playwright also ships a CLI with skills (`microsoft/playwright-cli`) that some coding agents
prefer because it costs fewer tokens than MCP tool schemas. The MCP is better for long exploratory
sessions that keep a browser open.

## Day to day

- `/mcp` lists servers, their status and tool counts, and handles sign-in.
- A plugin can bundle skills, agents, hooks and an MCP server together.
