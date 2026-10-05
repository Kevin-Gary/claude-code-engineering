import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CareRing } from "@/components/ui/CareRing";
import { Icon } from "@/components/ui/Icon";

/** Hero: headline, value prop, app CTA, and a plant photo with a floating care card. */
export function Hero() {
  return (
    <header className="mx-auto grid max-w-[var(--content-max)] grid-cols-1 items-center gap-14 px-6 pb-[90px] pt-10 md:grid-cols-[1.05fr_0.95fr] md:px-10">
      <div>
        <span className="inline-flex items-center gap-[7px] rounded-[var(--radius-pill)] bg-[var(--forest-50)] px-[13px] py-1.5 text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--forest-600)]">
          <Icon name="sparkles" size={15} /> Your plants, finally figured out
        </span>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-[44px] font-extrabold leading-[1.04] tracking-[-0.03em] text-[var(--forest-900)] md:text-[60px]">
          Keep every plant
          <br />
          alive and{" "}
          <span className="text-[var(--forest-500)]">thriving.</span>
        </h1>
        <p className="mb-8 mt-[22px] max-w-[460px] text-[19px] leading-[1.55] text-[var(--text-body)]">
          Snap a photo to identify any plant, get a care schedule built for your
          home, and a gentle nudge exactly when it needs you.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="accent"
            size="lg"
            leftIcon={<Icon name="smartphone" size={20} />}
          >
            Download free
          </Button>
          <Button
            variant="ghost"
            size="lg"
            rightIcon={<Icon name="arrow-right" size={18} />}
          >
            See how it works
          </Button>
        </div>
        <div className="mt-[26px] flex items-center gap-2 text-[14px] text-[var(--text-muted)]">
          <Icon name="star" size={16} color="var(--sun-500)" />
          <strong className="text-[var(--text-strong)]">4.9</strong> · loved by
          200k+ plant parents
        </div>
      </div>

      <div className="relative">
        <div className="aspect-[4/5] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1545241047-6083a3684587?w=900&q=80"
            alt="A healthy rubber plant by a window"
            className="h-full w-full object-cover"
          />
        </div>
        {/* floating care card */}
        <div className="absolute -bottom-[22px] -left-[28px] flex items-center gap-3.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-lg)]">
          <CareRing value={88} tone="thriving" size={62} thickness={7}>
            <span className="text-[18px] font-extrabold">88</span>
          </CareRing>
          <div>
            <div className="font-[family-name:var(--font-display)] text-[16px] font-bold text-[var(--text-strong)]">
              Rubber Plant
            </div>
            <div className="mt-1">
              <Badge tone="thriving" dot>
                Thriving
              </Badge>
            </div>
          </div>
        </div>
        {/* floating reminder pill */}
        <div className="absolute -right-[22px] top-6 flex items-center gap-[9px] rounded-[var(--radius-pill)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-2.5 shadow-[var(--shadow-md)]">
          <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[var(--water-100)] text-[var(--water-500)]">
            <Icon name="droplet" size={16} />
          </span>
          <span className="text-[13px] font-semibold text-[var(--text-strong)]">
            Water the fern today
          </span>
        </div>
      </div>
    </header>
  );
}
