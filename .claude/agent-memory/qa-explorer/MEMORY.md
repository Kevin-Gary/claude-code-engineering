<!-- 📘 This is the qa-explorer agent's PROJECT memory (memory: project). The agent reads the first
     200 lines of this file every time it starts and edits it as it learns. It lives in the repo and
     is committed, so every teammate's qa-explorer starts from the same notes. Review its edits in PRs
     like any other change. -->

# qa-explorer memory

## Setup
- The site runs at http://localhost:3000 (`npm run dev` from the repo root).
- The waitlist section is on the home page at `#waitlist`.

## Selectors that work
- Waitlist fields have visible labels: "First name", "Email", "Plan you're interested in".
- The submit button is named "Join the waitlist". The confirmation has `role="status"`.
- Next.js adds its own `role="alert"` route announcer, so scope alert lookups to `#waitlist`.

## Findings log
- (none yet)
