/**
 * Topdraft wordmark + custom mark.
 *
 * Mark concept: a solid violet "draft card" tile with a stock-chart line cut
 * through it via the page bg color. Reads as: athlete card + chart-going-up
 * — the product in one glyph. Distinctive (no generic chevron, no triangle).
 *
 * Use:
 *   <Logo size="md" />                          nav, default
 *   <Logo size="sm" />                          footer
 *   <Logo size="lg" />                          hero
 *   <Logo size="md" wordmarkOnly />             text only
 *   <Logo size="md" textClassName="text-accent">  color override on wordmark
 */
export interface LogoProps {
  size?: "sm" | "md" | "lg";
  textClassName?: string;
  wordmarkOnly?: boolean;
}

const SIZES = {
  sm: { tile: 18, text: "text-sm md:text-base", gap: "gap-2", radius: 3, stroke: 1.6 },
  md: { tile: 26, text: "text-xl md:text-2xl",  gap: "gap-2.5", radius: 4, stroke: 1.9 },
  lg: { tile: 44, text: "text-3xl md:text-4xl", gap: "gap-3.5", radius: 6, stroke: 2.4 },
} as const;

export function Logo({ size = "md", textClassName = "text-text", wordmarkOnly }: LogoProps) {
  const s = SIZES[size];
  return (
    <span className={`inline-flex items-center ${s.gap} leading-none align-middle`}>
      {!wordmarkOnly && <Mark size={s.tile} radius={s.radius} stroke={s.stroke} />}
      <span
        className={`font-secondary font-bold ${s.text} tracking-[-0.02em] ${textClassName}`}
      >
        Topdraft
      </span>
    </span>
  );
}

/**
 * The mark. Filled indigo tile with a multi-segment "stock chart" path
 * stroked in the page background color (knockout effect).
 */
function Mark({ size, radius, stroke }: { size: number; radius: number; stroke: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="text-accent shrink-0"
    >
      {/* Draft-card tile — solid indigo, rounded just enough to read as a card */}
      <rect x="2" y="2" width="28" height="28" rx={radius} fill="currentColor" />
      {/* Stock chart line: low-left → small dip → high-right.
          Stroked in the page-bg color so it reads as a notch through the tile. */}
      <path
        d="M7 23 L12 17 L16 19 L20 13 L25 8"
        stroke="var(--color-bg)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Sharp terminal dot at the top of the line — emphasizes the rise */}
      <circle cx="25" cy="8" r={stroke * 0.9} fill="var(--color-bg)" />
    </svg>
  );
}
