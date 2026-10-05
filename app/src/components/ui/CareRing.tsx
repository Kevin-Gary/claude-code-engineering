import React from "react";

/**
 * Circular progress ring: health score, days-until-watering, hydration level.
 * Renders centered children (e.g. a value + caption).
 */
type Tone = "forest" | "sprout" | "water" | "sun" | "thriving" | "wilt";

const TONES: Record<Tone, string> = {
  forest: "var(--forest-600)",
  sprout: "var(--sprout-500)",
  water: "var(--water-500)",
  sun: "var(--sun-500)",
  thriving: "var(--thriving-500)",
  wilt: "var(--wilt-500)",
};

export interface CareRingProps {
  value?: number;
  size?: number;
  thickness?: number;
  tone?: Tone;
  track?: string;
  className?: string;
  children?: React.ReactNode;
}

export function CareRing({
  value = 70,
  size = 96,
  thickness = 9,
  tone = "thriving",
  track,
  className,
  children,
}: CareRingProps) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const stroke = TONES[tone] ?? TONES.thriving;

  return (
    <div
      className={className}
      style={{ position: "relative", width: size, height: size }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={track || "var(--sand-200)"}
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
          style={{ transition: "stroke-dashoffset var(--dur-slow) var(--ease-out)" }}
        />
      </svg>
      <div
        className="font-[family-name:var(--font-display)]"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "var(--text-strong)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
