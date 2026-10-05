"use client";

import { useEffect, useState } from "react";

/**
 * The "just joined" ticker under the waitlist form. Social proof: a few recent first names and
 * the plan they picked. Re-fetches whenever `refreshKey` changes (after a new signup).
 */
type Signup = { name: string; plan: string };

const PLAN_LABELS: Record<string, string> = { free: "Free", plus: "Plus", family: "Family" };

export function RecentSignups({ refreshKey = 0 }: { refreshKey?: number }) {
  const [signups, setSignups] = useState<Signup[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/waitlist")
      .then((response) => response.json())
      .then((data: { signups: Signup[] }) => {
        if (!cancelled) setSignups(data.signups);
      })
      .catch(() => {
        // The ticker is decoration. If it fails, the form still works, so stay quiet.
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (signups.length === 0) return null;

  return (
    <ul aria-label="Recent signups" className="mt-8 flex list-none flex-col gap-2 p-0">
      {signups.map((signup, index) => {
        const firstName = String(signup.name ?? "").split(" ")[0];
        const plan = PLAN_LABELS[signup.plan] ?? "Free";
        return (
          <li
            key={`${firstName}-${index}`}
            className="text-[14px] text-[var(--text-muted)]"
            dangerouslySetInnerHTML={{
              __html: `<strong>${firstName}</strong> just joined the ${plan} waitlist`,
            }}
          />
        );
      })}
    </ul>
  );
}
