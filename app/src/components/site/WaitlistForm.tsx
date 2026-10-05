"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * Waitlist signup form. A client component because it holds form state and talks to
 * POST /api/waitlist. The acceptance criteria it should meet live in
 * docs/features/waitlist-signup.md.
 */
type Result = { position: number; planLabel: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD =
  "w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-[16px] text-[var(--text-strong)] focus:border-[var(--forest-600)] focus:outline-none";

export function WaitlistForm({ onJoined }: { onJoined?: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("plus");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!EMAIL.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, plan }),
      });
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);
      const data: Result = await response.json();
      setResult(data);
      onJoined?.();
    } catch {
      setError("Something went wrong. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <p
        role="status"
        className="flex items-start gap-3 rounded-[var(--radius-lg)] bg-[var(--forest-50)] p-6 text-[17px] leading-[1.5] text-[var(--forest-900)]"
      >
        <Icon name="check" size={22} className="mt-0.5 shrink-0 text-[var(--forest-600)]" />
        <span>
          You&apos;re on the <strong>{result.planLabel}</strong> waitlist. You&apos;re number{" "}
          {result.position} in line, and we&apos;ll email you the day Verdant lands.
        </span>
      </p>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-[var(--gap-stack)]">
      <div className="flex flex-col gap-2">
        <label htmlFor="waitlist-name" className="text-[14px] font-semibold text-[var(--text-strong)]">
          First name
        </label>
        <input
          id="waitlist-name"
          name="name"
          autoComplete="given-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={FIELD}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="waitlist-email" className="text-[14px] font-semibold text-[var(--text-strong)]">
          Email
        </label>
        <input
          id="waitlist-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "waitlist-error" : undefined}
          className={FIELD}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="waitlist-plan" className="text-[14px] font-semibold text-[var(--text-strong)]">
          Plan you&apos;re interested in
        </label>
        <select
          id="waitlist-plan"
          name="plan"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className={FIELD}
        >
          <option value="free">Free</option>
          <option value="plus">Plus</option>
          <option value="family">Family</option>
        </select>
      </div>

      {error && (
        <p id="waitlist-error" role="alert" className="m-0 text-[14px] font-semibold text-[var(--wilt-500)]">
          {error}
        </p>
      )}

      <Button type="submit" variant="accent" size="lg" fullWidth disabled={submitting}>
        {submitting ? "Saving your spot..." : "Join the waitlist"}
      </Button>
    </form>
  );
}
