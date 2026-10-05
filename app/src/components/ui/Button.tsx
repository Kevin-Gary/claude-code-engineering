import React from "react";
import { cn } from "@/lib/cn";

/**
 * Verdant primary action button. Pill-shaped, calm hover (slight lift + darken)
 * and a tactile press (subtle scale-down), driven by Tailwind state variants so
 * it renders on the server without client JS.
 */
type Variant = "primary" | "accent" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "min-h-[36px] px-4 py-2 text-[13px] gap-1.5",
  md: "min-h-[44px] px-[22px] py-[11px] text-[15px] gap-2",
  lg: "min-h-[54px] px-7 py-[15px] text-[17px] gap-2.5",
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[var(--brand-primary)] text-[var(--text-on-forest)] shadow-[var(--shadow-sm)] hover:bg-[var(--brand-primary-hover)]",
  accent:
    "bg-[var(--brand-accent)] text-[var(--text-on-sprout)] font-bold shadow-[var(--shadow-accent)] hover:bg-[var(--brand-accent-hover)]",
  secondary:
    "bg-[var(--bg-surface)] text-[var(--text-strong)] border border-[var(--border-default)] shadow-[var(--shadow-xs)] hover:bg-[var(--bg-sunk)]",
  ghost:
    "bg-transparent text-[var(--brand-primary)] hover:bg-[var(--forest-50)]",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** When set, the button renders as an anchor, handy for in-page CTAs. */
  href?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  href,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-pill)]",
    "font-[family-name:var(--font-text)] font-semibold leading-none tracking-[-0.01em]",
    "cursor-pointer transition-[background-color,transform,box-shadow] duration-200 ease-[var(--ease-soft)]",
    "hover:-translate-y-px active:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-45",
    SIZES[size],
    VARIANTS[variant],
    fullWidth ? "w-full" : "w-auto",
    className,
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {leftIcon}
        {children}
        {rightIcon}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
