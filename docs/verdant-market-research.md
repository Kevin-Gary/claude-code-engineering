# Verdant - market and pricing research

<!-- 📘 A realistic reference doc. It's the kind of thing you DON'T want in context every session,
     but DO want Claude to read when you're working on pricing pages or positioning copy. Pull it
     into a prompt with @docs/verdant-market-research.md, or let Claude open it when a task calls
     for it. -->

_Last updated: 2026-06-16. Figures are approximate, gathered from public App Store listings and
company pages. Treat as directional, not exact._

## The category

Plant-care and plant-ID apps for hobbyist and intermediate plant owners. The buyer is a person
keeping 3 to 30 houseplants who wants two things: "what is this plant?" and "how do I not kill it?"

## Competitors

| App          | Model     | Rough price       | Positioning                                          |
| ------------ | --------- | ----------------- | ---------------------------------------------------- |
| PictureThis  | Freemium  | ~$30/yr           | ID-first, huge species database, aggressive paywall  |
| Planta       | Freemium  | ~$36/yr           | Care-first, reminders and light meter, polished UX   |
| Blossom      | Freemium  | ~$40/yr           | ID plus care, heavy trial-then-subscribe funnel      |
| Greg         | Free-ish  | Free + upsells    | Community and watering algorithm, softer monetization |

## What we learned

- **The magic moment is identification.** Every competitor leads with "point your camera, get an ID."
  The apps that gate that moment behind a paywall convert worse on install-to-open than the ones that
  give the first ID away.
- **Care is the recurring problem, so a subscription is honest.** Keeping a plant alive is ongoing;
  reminders and diagnosis deliver value week after week. That maps cleanly to a monthly price.
- **Mid-market pricing is ~$30 to $40/yr.** Going above that needs a clear "why" (Family, expert
  help). Going below leaves money on the table without lifting conversion much.
- **Annual discounts drive LTV.** Every competitor discounts annual heavily to reduce churn and
  smooth revenue.

## Implication for Verdant

Give the ID-and-care magic away on a free tier to maximize installs (the site's whole job), charge
for depth on Plus, and add a Family tier for multi-person households. Full decision and the tier
table: see `memory/decisions.md` (2026-06-24) and `CLAUDE.md` (Pricing and business model).
