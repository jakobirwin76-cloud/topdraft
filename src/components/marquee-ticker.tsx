"use client";

/**
 * Shared scrolling marquee ticker. Used on /app and /athlete/[slug] for a
 * consistent terminal-style top bar. Decorative — data is currently static.
 */

const tokens = {
  win: "#10B981",
  winText: "#34D399",
  loss: "#EF4444",
  text: "#EDEDEF",
  textMute: "#94A3B8",
  border: "rgba(255,255,255,0.08)",
};

const FONT_DISPLAY = "Inter, -apple-system, system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

const TICKER_ROWS = [
  { name: "Mahomes",  price: 20.10, delta: 0.052, spark: [18, 18.4, 19.1, 18.8, 19.6, 20.2, 19.8, 20.1] },
  { name: "Haaland",  price: 22.31, delta: 0.030, spark: [21.5, 21.8, 22.0, 21.7, 22.2, 22.4, 22.3, 22.3] },
  { name: "Messi",    price: 27.45, delta: -0.012, spark: [27.9, 27.8, 27.6, 27.7, 27.5, 27.4, 27.5, 27.45] },
  { name: "LeBron",   price: 16.20, delta: 0.018, spark: [15.8, 15.9, 16.0, 16.1, 16.0, 16.2, 16.1, 16.2] },
  { name: "Curry",    price: 19.99, delta: -0.024, spark: [20.5, 20.3, 20.1, 20.2, 20.0, 19.9, 20.0, 19.99] },
  { name: "Allen",    price: 14.50, delta: 0.044, spark: [13.8, 13.9, 14.1, 14.2, 14.3, 14.4, 14.5, 14.5] },
  { name: "Giannis",  price: 24.50, delta: 0.038, spark: [23.5, 23.7, 23.9, 24.0, 24.2, 24.3, 24.4, 24.5] },
  { name: "Garrett",  price: 13.10, delta: -0.018, spark: [13.4, 13.3, 13.2, 13.1, 13.0, 13.05, 13.1, 13.1] },
];

export function MarqueeTicker() {
  const doubled = [...TICKER_ROWS, ...TICKER_ROWS];
  return (
    <div
      className="sticky top-0 z-20 w-full backdrop-blur-md border-b"
      style={{
        background: "rgba(9, 9, 11, 0.7)",
        borderColor: tokens.border,
        maskImage: "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
      }}
    >
      <div className="flex gap-10 py-3 px-6 whitespace-nowrap animate-marquee hover:[animation-play-state:paused]">
        {doubled.map((it, i) => {
          const up = it.delta >= 0;
          return (
            <div key={`${it.name}-${i}`} className="flex items-center gap-3 shrink-0">
              <span
                className="text-[11px] uppercase tracking-[0.14em]"
                style={{ color: tokens.textMute, fontFamily: FONT_DISPLAY, fontWeight: 500 }}
              >
                {it.name}
              </span>
              <span style={{ fontFamily: FONT_MONO, fontVariantNumeric: "tabular-nums", color: tokens.text, fontSize: 13 }}>
                ${it.price.toFixed(2)}
              </span>
              <span
                className="inline-flex items-center gap-0.5"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  fontVariantNumeric: "tabular-nums",
                  color: up ? tokens.winText : tokens.loss,
                }}
              >
                {up ? "▲" : "▼"} {up ? "+" : ""}{(it.delta * 100).toFixed(1)}%
              </span>
              <MicroSparkline points={it.spark} up={up} />
            </div>
          );
        })}
      </div>
      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee { animation: none; }
        }
      `}</style>
    </div>
  );
}

function MicroSparkline({ points, up }: { points: number[]; up: boolean }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(0.01, max - min);
  const W = 48;
  const H = 14;
  const step = W / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${(H - ((p - min) / range) * (H - 2) - 1).toFixed(1)}`)
    .join(" ");
  const color = up ? tokens.win : tokens.loss;
  return (
    <svg width={W} height={H} className="shrink-0" aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
