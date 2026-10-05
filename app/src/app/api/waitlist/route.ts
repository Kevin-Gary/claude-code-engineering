/**
 * Waitlist API.
 *   POST /api/waitlist  { name, email, plan }  ->  { ok, position, plan, planLabel }
 *   GET  /api/waitlist                         ->  { signups }  (feeds the "just joined" ticker)
 *
 * 📘 A Route Handler: Next.js's version of a small HTTP endpoint. Any stack: this is a Flask or
 * FastAPI view, an Express handler, a Spring controller method. Keep it thin and push the rules
 * into lib/ functions that have their own unit tests.
 */
import { PLANS, normalizePlan } from "@/lib/waitlist/plans";
import { addSignup, recentSignups } from "@/lib/waitlist/store";

// Always run on request. The signup list changes, so it must never be cached at build time.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  const plan = normalizePlan(body.plan);

  const position = addSignup({
    name: body.name,
    email: body.email,
    plan,
    createdAt: new Date().toISOString(),
  });

  return Response.json({ ok: true, position, plan, planLabel: PLANS[plan].label });
}

export async function GET() {
  return Response.json({ signups: recentSignups() });
}
