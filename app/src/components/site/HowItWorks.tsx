import { Icon, type IconName } from "@/components/ui/Icon";

/** Three-step "how it works" band on a soft sand surface. */
const STEPS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "scan-line",
    title: "Snap a photo",
    body: "Point your camera at any plant. Verdant identifies it from 17,000+ species in seconds.",
  },
  {
    icon: "calendar-heart",
    title: "Get a care plan",
    body: "A watering, light and feeding schedule tuned to your plant, your home, and the season.",
  },
  {
    icon: "bell",
    title: "Stay on track",
    body: "Gentle reminders exactly when each plant needs you, never a generic weekly buzz.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-[var(--bg-sunk)] py-[88px]">
      <div className="mx-auto max-w-[var(--content-max)] px-6 md:px-10">
        <div className="mx-auto mb-14 max-w-[620px] text-center">
          <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--forest-600)]">
            How it works
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-[32px] font-extrabold tracking-[-0.02em] text-[var(--forest-900)] md:text-[42px]">
            From “what is this?” to thriving - in three taps.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-[30px] shadow-[var(--shadow-sm)]"
            >
              <span className="mb-[18px] inline-flex h-[54px] w-[54px] items-center justify-center rounded-[var(--radius-md)] bg-[var(--forest-600)] text-[var(--sprout-300)]">
                <Icon name={s.icon} size={26} />
              </span>
              <div className="font-[family-name:var(--font-mono)] text-[12px] font-bold text-[var(--text-faint)]">
                0{i + 1}
              </div>
              <h3 className="mb-2.5 mt-1 font-[family-name:var(--font-display)] text-[22px] font-bold text-[var(--text-strong)]">
                {s.title}
              </h3>
              <p className="m-0 text-[16px] leading-[1.55] text-[var(--text-muted)]">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
