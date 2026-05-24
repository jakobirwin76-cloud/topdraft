"use client";

interface TickerItem {
  name: string;
  price: number;
  /** Change ratio (e.g. 0.05 = +5%). */
  delta: number;
}

interface LiveTickerProps {
  items: TickerItem[];
  className?: string;
}

function deltaColor(d: number): string {
  if (d > 0) return "text-win";
  if (d < 0) return "text-loss";
  return "text-text-dim";
}

function formatDelta(d: number): string {
  const pct = (d * 100).toFixed(1);
  return d > 0 ? `+${pct}%` : `${pct}%`;
}

export function LiveTicker({ items, className = "" }: LiveTickerProps) {
  if (items.length === 0) return null;
  // Duplicate items so the -50% translateX lands seamlessly on the second copy.
  const doubled = [...items, ...items];

  return (
    <div className={`overflow-hidden border-y border-border bg-surface/40 ${className}`}>
      <div className="flex gap-8 py-3 px-6 whitespace-nowrap animate-ticker hover:[animation-play-state:paused]">
        {doubled.map((item, i) => (
          <div
            key={`${item.name}-${i}`}
            className="flex items-center gap-2 font-data text-xs"
          >
            <span className="text-text-mute">{item.name}</span>
            <span className="text-text tabular-nums">${item.price.toFixed(2)}</span>
            <span className={`tabular-nums ${deltaColor(item.delta)}`}>
              {formatDelta(item.delta)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
