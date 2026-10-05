---
paths:
  - "app/**/*.tsx"
  - "app/**/*.ts"
---

<!-- 📘 A PATH-SCOPED rule. The `paths:` frontmatter above means Claude only loads this file when it
     reads a TypeScript or TSX file under app/. Editing a markdown doc or the site config? These
     conventions stay out of context. Open app/src/components/site/Hero.tsx? They show up. That's the win:
     frontend rules are present exactly when you're doing frontend work, and free otherwise. -->

# Verdant site conventions (app/)

These apply when working in the Verdant marketing site.

- **Design tokens are the source of truth.** Use the synced Claude Design tokens and components for
  color, spacing, and type. Never hardcode a hex value or a one-off pixel spacing.
- **Match the existing component pattern.** Look at a neighboring component before adding a new one;
  mirror its props, file location, and structure. Consistency beats cleverness.
- **Components are function components in TypeScript.** Type props explicitly. No `any`.
- **Server components by default;** add `"use client"` only when a component needs state, effects, or
  browser-only APIs.
- **User-facing strings follow the copy guardrails** (see the always-on `brand-voice` rule and, for
  longer copy, the `brand-voice` skill).
- **After a visual change, run the `design-reviewer` subagent** to confirm it stayed on-system.
