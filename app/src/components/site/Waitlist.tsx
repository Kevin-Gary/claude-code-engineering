"use client";

import { useState } from "react";
import { RecentSignups } from "./RecentSignups";
import { WaitlistForm } from "./WaitlistForm";

/**
 * Waitlist section: heading, signup form, and the "just joined" ticker.
 * A client component only because it coordinates the two children: a successful signup bumps
 * `refreshKey`, which tells the ticker to fetch again.
 */
export function Waitlist() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <section id="waitlist" className="bg-[var(--bg-sunk)] py-[88px]">
      <div className="mx-auto grid max-w-[var(--content-max)] grid-cols-1 gap-12 px-6 md:grid-cols-2 md:px-10">
        <div>
          <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--forest-600)]">
            Early access
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-[32px] font-extrabold tracking-[-0.02em] text-[var(--forest-900)] md:text-[42px]">
            Be first in line when Verdant reaches your phone.
          </h2>
          <p className="mt-3 max-w-[460px] text-[16.5px] leading-[1.55] text-[var(--text-muted)]">
            Tell us which plan fits your plants. We&apos;ll save your spot and send one email on
            launch day. No spam, ever.
          </p>
          <RecentSignups refreshKey={refreshKey} />
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-[30px] shadow-[var(--shadow-sm)]">
          <WaitlistForm onJoined={() => setRefreshKey((key) => key + 1)} />
        </div>
      </div>
    </section>
  );
}
