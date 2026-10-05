<!-- 📘 This is a SUBDIRECTORY CLAUDE.md, and it behaves differently from the one at the repo
     root. The root file loads at the start of every session. This one loads ON DEMAND, only
     when Claude reads a file inside app/. That is a native Claude Code behaviour, and it is
     the cheapest way to keep detail out of your context until the detail is relevant.
     Rule of thumb: root CLAUDE.md is who we are and how we work. This is how THIS code works.
     Any stack: put one of these in each service or package of a monorepo. -->

# app/: the Verdant marketing site

Next.js App Router, TypeScript, Tailwind. Its one job is turning plant-curious visitors into
app installs, so every change should make that easier, not just prettier.

Install and run everything from the REPO ROOT (it is an npm workspace): `npm install`, `npm run dev`.

## Layout

- `src/app/`: routes, `layout.tsx`, `globals.css`.
- `src/app/api/<name>/route.ts`: HTTP endpoints. `waitlist/` (signup + recent signups) and
  `care-guides/[slug]/` (reads a guide from `content/` and adds schedule dates).
- `src/lib/care/`: care-schedule math (pure functions, unit-tested).
- `src/lib/waitlist/`: plan ids and labels, plus the in-memory signup store.
- `src/components/ui/`: generic primitives with no Verdant knowledge: `Button`, `Badge`, `Icon`,
  `Avatar`, `CareRing`. Reusable anywhere.
- `src/components/site/`: page sections that DO know about Verdant: `SiteNav`, `Hero`, `HowItWorks`,
  `FeatureDiagnose`, `Pricing`, `Waitlist` (+ `WaitlistForm`, `RecentSignups`), `SiteFooter`.
- `content/care-guides/*.md`: plant care guides with `waterEveryDays` / `feedEveryMonths` frontmatter.

Keeping `ui/` ignorant of Verdant is the convention that matters most here. If a primitive
starts referencing plants or pricing, it belongs in `site/`.

## Conventions

- Style with Tailwind utilities and the design tokens in `globals.css`. Do not hand-pick hex values.
- Server components by default. Add `"use client"` only for state, effects, or browser APIs.
- Business rules live in `src/lib/` as pure functions with a `*.test.ts` next to them. Route
  handlers and components stay thin.
- API routes validate and bound every input at the boundary, and return only the fields the
  caller needs.
- Pricing shown on the site must match the tiers in the root `CLAUDE.md`. The root file wins.

## Secrets

Secrets live in `app/.env.local` (gitignored). Anything that needs a key runs in an API route so
the key stays server-side. A component must never hold a key, and the browser must never see one.
