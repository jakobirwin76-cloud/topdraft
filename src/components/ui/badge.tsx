import type { HTMLAttributes } from "react";

type Variant = "live" | "upcoming" | "settled" | "win" | "loss";

const VARIANT_CLASSES: Record<Variant, string> = {
  live: "text-win bg-win/10",
  upcoming: "text-text-mute border border-border",
  settled: "text-text-mute border border-border",
  win: "text-win bg-win/10",
  loss: "text-loss bg-loss/10",
};

const BASE =
  "inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-data uppercase tracking-[0.1em] rounded-md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: Variant;
}

export function Badge({ variant, className = "", children, ...props }: BadgeProps) {
  return (
    <span className={`${BASE} ${VARIANT_CLASSES[variant]} ${className}`} {...props}>
      {variant === "live" && (
        <svg aria-hidden="true" viewBox="0 0 6 6" className="live-pulse h-1.5 w-1.5">
          <circle cx="3" cy="3" r="3" className="fill-win" />
        </svg>
      )}
      {children ?? (variant === "live" ? "Live" : null)}
    </span>
  );
}
