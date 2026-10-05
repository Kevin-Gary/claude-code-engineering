import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * Pricing section: Verdant's freemium model: a free tier plus two paid tiers.
 * The model and its business rationale live in the product context (CLAUDE.md).
 * Built from design-system tokens and the shared <Button>/<Icon> components,
 * mirroring the data-array + map pattern in HowItWorks.tsx.
 */
type Tier = {
  name: string;
  tagline: string;
  price: string;
  cadence: string;
  annual: string;
  features: string[];
  cta: string;
  variant: "secondary" | "primary" | "accent";
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Free",
    tagline: "For your first few plants.",
    price: "$0",
    cadence: "forever",
    annual: "No card needed.",
    features: [
      "Identify up to 5 plants a month",
      "Care reminders for up to 3 plants",
      "Friendly plant community",
    ],
    cta: "Start free",
    variant: "secondary",
  },
  {
    name: "Plus",
    tagline: "For a growing collection.",
    price: "$5.99",
    cadence: "/month",
    annual: "or $39.99/year (save 44%)",
    features: [
      "Unlimited plant identification",
      "Unlimited care plans + smart seasonal reminders",
      "Photo diagnosis with Plant Doctor",
      "Light meter & room-by-room placement",
    ],
    cta: "Start free trial",
    variant: "accent",
    featured: true,
  },
  {
    name: "Family",
    tagline: "For the whole household.",
    price: "$9.99",
    cadence: "/month",
    annual: "or $79.99/year (save 33%)",
    features: [
      "Everything in Plus",
      "Up to 5 household members",
      "A shared plant library",
      "Priority help from real plant experts",
    ],
    cta: "Go Family",
    variant: "primary",
  },
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="mx-auto max-w-[var(--content-max)] px-6 pb-24 md:px-10"
    >
      <div className="mx-auto mb-14 max-w-[620px] text-center">
        <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--forest-600)]">
          Pricing
        </span>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-[32px] font-extrabold tracking-[-0.02em] text-[var(--forest-900)] md:text-[42px]">
          Start free. Upgrade when your collection grows.
        </h2>
        <p className="mx-auto mt-3 max-w-[520px] text-[16.5px] leading-[1.55] text-[var(--text-muted)]">
          Every plan keeps your plants thriving. Pick the one that fits your
          windowsill (or your whole house).
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={
              tier.featured
                ? "relative flex flex-col rounded-[var(--radius-lg)] border-2 border-[var(--forest-600)] bg-[var(--bg-surface)] p-[30px] shadow-[var(--shadow-lg)] md:-translate-y-3"
                : "relative flex flex-col rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-[30px] shadow-[var(--shadow-sm)]"
            }
          >
            {tier.featured && (
              <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--forest-600)] px-3.5 py-1.5 font-[family-name:var(--font-text)] text-[12px] font-bold tracking-[-0.01em] text-[var(--sprout-300)]">
                <Icon name="sparkles" size={13} />
                Most popular
              </span>
            )}

            <h3 className="font-[family-name:var(--font-display)] text-[22px] font-bold text-[var(--text-strong)]">
              {tier.name}
            </h3>
            <p className="mb-5 mt-1 text-[15px] leading-[1.45] text-[var(--text-muted)]">
              {tier.tagline}
            </p>

            <div className="flex items-baseline gap-1.5">
              <span className="font-[family-name:var(--font-display)] text-[40px] font-extrabold tracking-[-0.03em] text-[var(--forest-900)]">
                {tier.price}
              </span>
              <span className="text-[15px] font-medium text-[var(--text-muted)]">
                {tier.cadence}
              </span>
            </div>
            <p className="mt-1.5 text-[13px] font-medium text-[var(--text-faint)]">
              {tier.annual}
            </p>

            <ul className="mb-8 mt-6 flex list-none flex-col gap-3.5 p-0">
              {tier.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-[15px] leading-[1.45] text-[var(--text-body)]"
                >
                  <span className="mt-px inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[var(--forest-100)] text-[var(--forest-600)]">
                    <Icon name="check" size={13} strokeWidth={2.8} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              variant={tier.variant}
              size="lg"
              fullWidth
              className="mt-auto"
            >
              {tier.cta}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
