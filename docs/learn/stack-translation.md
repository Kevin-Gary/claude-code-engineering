<!-- 📘 This repo is TypeScript and Next.js, but the session is about patterns, not a language.
     This table maps each artifact to its equivalent elsewhere. Every concept transfers. -->

# Stack translation

| What this repo uses | Python | Go | Java / Kotlin | Ruby |
| --- | --- | --- | --- | --- |
| `npm run check` (one verify command) | `make check` / `nox` | `make check` | `./gradlew check` | `bin/rake` |
| Vitest unit tests next to code | pytest | `go test` | JUnit | RSpec / Minitest |
| `tsc --noEmit` hook after edits | mypy / pyright | `go vet` / `go build` | `./gradlew compileJava` | Sorbet / Steep |
| ESLint | ruff | golangci-lint | Checkstyle / ktlint | RuboCop |
| Playwright E2E in `e2e/` | Playwright for Python | Playwright for Go (community) or a JS e2e/ folder | Playwright for Java | Capybara or Playwright |
| Next.js route handler | FastAPI / Flask / Django view | `net/http` handler | Spring controller | Rails controller |
| `app/CLAUDE.md` nested context | `services/billing/CLAUDE.md` | per-module CLAUDE.md | per-module CLAUDE.md | per-engine CLAUDE.md |
| `rules/testing.md` paths `app/**/*.test.ts` | `paths: ["**/test_*.py"]` | `paths: ["**/*_test.go"]` | `paths: ["**/src/test/**"]` | `paths: ["spec/**"]` |
| `security-checklist` (XSS, path traversal, SSRF) | same OWASP list, Django/Flask examples | same list, `net/http` examples | same list, Spring examples | same list, Rails examples |

Claude Code itself is language-agnostic: CLAUDE.md, rules, skills, agents, hooks, permissions,
MCP and CI integration work the same in every repo. Only the commands inside them change.
