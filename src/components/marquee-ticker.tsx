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
  { name: "Mbappé",     price: 31.00, delta: 0.062, spark: [29.2, 29.6, 30.0, 30.3, 30.5, 30.7, 30.9, 31.0] },
  { name: "Mahomes",    price: 20.10, delta: 0.052, spark: [18, 18.4, 19.1, 18.8, 19.6, 20.2, 19.8, 20.1] },
  { name: "Yamal",      price: 22.50, delta: 0.084, spark: [20.5, 20.9, 21.3, 21.6, 22.0, 22.3, 22.4, 22.5] },
  { name: "Wemby",      price: 24.20, delta: 0.061, spark: [22.5, 22.8, 23.2, 23.6, 23.9, 24.0, 24.1, 24.2] },
  { name: "SGA",        price: 25.80, delta: 0.045, spark: [24.5, 24.7, 25.0, 25.2, 25.4, 25.6, 25.7, 25.8] },
  { name: "Vinicius",   price: 27.00, delta: 0.041, spark: [25.8, 26.1, 26.4, 26.6, 26.8, 26.9, 27.0, 27.0] },
  { name: "Haaland",    price: 22.31, delta: 0.030, spark: [21.5, 21.8, 22.0, 21.7, 22.2, 22.4, 22.3, 22.3] },
  { name: "Daniels",    price: 17.60, delta: 0.071, spark: [16.0, 16.3, 16.6, 16.9, 17.1, 17.3, 17.5, 17.6] },
  { name: "Musiala",    price: 24.00, delta: 0.038, spark: [22.8, 23.0, 23.2, 23.5, 23.7, 23.9, 23.95, 24.0] },
  { name: "Wirtz",      price: 23.20, delta: 0.052, spark: [21.5, 21.9, 22.2, 22.5, 22.7, 22.9, 23.1, 23.2] },
  { name: "Bellingham", price: 21.80, delta: 0.029, spark: [20.5, 20.8, 21.0, 21.2, 21.4, 21.6, 21.7, 21.8] },
  { name: "Saka",       price: 23.50, delta: 0.033, spark: [22.3, 22.5, 22.7, 23.0, 23.1, 23.3, 23.4, 23.5] },
  { name: "Foden",      price: 22.00, delta: 0.018, spark: [21.4, 21.5, 21.7, 21.8, 21.9, 21.95, 22.0, 22.0] },
  { name: "Palmer",     price: 19.50, delta: 0.046, spark: [18.2, 18.4, 18.7, 19.0, 19.2, 19.3, 19.4, 19.5] },
  { name: "Giannis",    price: 24.50, delta: 0.025, spark: [23.5, 23.7, 23.9, 24.0, 24.2, 24.3, 24.4, 24.5] },
  { name: "Bijan",      price: 16.90, delta: 0.054, spark: [15.5, 15.8, 16.0, 16.3, 16.5, 16.7, 16.8, 16.9] },
  { name: "Edwards",    price: 17.80, delta: -0.018, spark: [18.2, 18.0, 17.9, 17.8, 17.85, 17.9, 17.8, 17.8] },
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
