/**
 * The plans a visitor can join the waitlist for. Labels must match the pricing tiers in the
 * root CLAUDE.md (Free, Plus, Family).
 */
export const PLANS = {
  free: { label: "Free" },
  plus: { label: "Plus" },
  family: { label: "Family" },
} as const;

export type PlanId = keyof typeof PLANS;

/**
 * Turn whatever the form or an older client sent into a known plan id.
 * Older forms sent free text such as "Plus", "pro" or "Premium", so input is trimmed and
 * lowercased, and anything unrecognised falls back to the free plan.
 */
export function normalizePlan(input: unknown): PlanId {
  const value = String(input ?? "").trim().toLowerCase();
  if (value.startsWith("p")) return "plus";
  return "free";
}
