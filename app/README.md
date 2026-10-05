# app/: the Verdant marketing site

The real product surface: a **Next.js + TypeScript + Tailwind v4** marketing site, built on
Verdant's **Claude Design** system (tokens and components imported via the `claude_design` MCP),
plus a small engineering surface (two API routes and some domain logic) for the testing,
review and security lessons.

## Run it

The repo root is an npm workspace, so install and run from the root, not from `app/`:

```bash
npm install
npm run dev          # http://localhost:3000
npm run check        # lint + typecheck + unit tests
npm run test:e2e     # Playwright end-to-end tests (starts the dev server for you)
npm run build        # production build
```

## How it's wired

- **Design tokens are the source of truth.** `src/styles/tokens/*.css` are synced verbatim from the
  Verdant design system and imported by `src/app/globals.css`.
- **Components mirror the design system.** `src/components/ui/` holds the primitives;
  `src/components/site/` holds the landing sections. They style themselves with Tailwind utilities
  that reference the token CSS variables (e.g. `bg-[var(--forest-600)]`).
- **Domain logic is pure and tested.** `src/lib/care/schedule.ts` (watering and feeding dates) and
  `src/lib/waitlist/plans.ts` each have a Vitest file beside them.
- **API routes** live in `src/app/api/`. The waitlist store is in memory, so it resets when the
  dev server restarts. That keeps the demo free of a database.
- **Page:** `src/app/page.tsx` composes Nav, Hero, How it works, Diagnose, Pricing, Waitlist, Footer.

## Notes / swap later

- Fonts load from the Google Fonts CDN. Swap for `next/font` or licensed binaries when available.
- Hero and diagnose imagery use the design system's Unsplash placeholders.
