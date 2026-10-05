import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** Feature spotlight: the photo-based diagnosis, on the dark forest surface. */
const POINTS = [
  "Spot pests, over- and under-watering, and light problems early.",
  "Plain-language explanations. No jargon, no panic.",
  "A step-by-step recovery plan, with reminders to match.",
];

export function FeatureDiagnose() {
  return (
    <section className="mx-auto max-w-[var(--content-max)] px-6 py-24 md:px-10">
      <div className="grid grid-cols-1 items-center overflow-hidden rounded-[var(--radius-xl)] bg-[var(--bg-inverse)] md:grid-cols-2">
        <div className="p-10 md:px-[52px] md:py-14">
          <span className="inline-flex items-center gap-[7px] text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--sprout-300)]">
            <Icon name="stethoscope" size={15} /> Plant doctor
          </span>
          <h2 className="mb-[18px] mt-3.5 font-[family-name:var(--font-display)] text-[30px] font-extrabold leading-[1.12] tracking-[-0.02em] text-[var(--cream)] md:text-[38px]">
            Something looks off? Find out why.
          </h2>
          <p className="mb-[26px] mt-0 max-w-[420px] text-[17px] leading-[1.6] text-[rgba(248,245,238,0.78)]">
            Snap a photo of a struggling plant. Verdant tells you what&apos;s
            wrong, and exactly how to nurse it back.
          </p>
          <ul className="mb-[30px] mt-0 flex list-none flex-col gap-3.5 p-0">
            {POINTS.map((p) => (
              <li
                key={p}
                className="flex items-start gap-3 text-[16px] leading-[1.45] text-[var(--cream)]"
              >
                <span className="mt-px inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--sprout-500)] text-[var(--forest-900)]">
                  <Icon name="check" size={15} strokeWidth={2.8} />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <Button variant="accent" size="lg">
            Try a diagnosis
          </Button>
        </div>
        <div className="relative h-full min-h-[440px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=80"
            alt="Repotting a plant"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
