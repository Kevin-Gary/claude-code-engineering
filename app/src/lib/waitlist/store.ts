/**
 * Waitlist storage. An in-memory list keeps the demo dependency-free: it resets whenever the
 * dev server restarts. In production this would be a database table; the two exported
 * functions are the seam you would swap.
 */
import type { PlanId } from "./plans";

export type Signup = {
  name: string;
  email: string;
  plan: PlanId;
  createdAt: string;
};

const SEED: Signup[] = [
  { name: "Maya Okafor", email: "maya.okafor@example.com", plan: "plus", createdAt: "2026-09-28T16:02:00Z" },
  { name: "Jonas Weber", email: "jonas.weber@example.com", plan: "free", createdAt: "2026-09-29T09:41:00Z" },
  { name: "Priya Raman", email: "priya.raman@example.com", plan: "family", createdAt: "2026-09-30T18:15:00Z" },
];

// Keep the list on globalThis so it survives the dev server recompiling this module.
// (Same trick people use for a database client in Next.js dev.)
const holder = globalThis as typeof globalThis & { __verdantSignups?: Signup[] };
const signups = (holder.__verdantSignups ??= [...SEED]);

/** Add a signup and return the visitor's place in line (1-based). */
export function addSignup(signup: Signup): number {
  signups.push(signup);
  return signups.length;
}

/** The most recent signups, newest first. */
export function recentSignups(limit = 5): Signup[] {
  return signups.slice(-limit).reverse();
}
