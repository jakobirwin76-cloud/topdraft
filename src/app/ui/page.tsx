"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Badge,
  Card,
  Input,
  AthletePrice,
  AvatarDisc,
  Skeleton,
  LiveTicker,
} from "@/components/ui";

// Light-mode v5 — lavender-tinted base, vibrant violet, colored hero band.
const lightTheme: React.CSSProperties = {
  ["--color-bg" as string]: "#F5F1FA",
  ["--color-surface" as string]: "#FFFFFF",
  ["--color-surface-2" as string]: "#EDE6F7",
  ["--color-border" as string]: "#D8CCEA",
  ["--color-text" as string]: "#1E0640",
  ["--color-text-mute" as string]: "#5C4B7A",
  ["--color-text-dim" as string]: "#9F92BD",
  ["--color-accent" as string]: "#1E0640",
  ["--color-accent-2" as string]: "#2E0E5A",
  ["--color-win" as string]: "#10B981",
  ["--color-loss" as string]: "#DC2626",
  fontFamily: "Inter, -apple-system, sans-serif",
  color: "#1E0640",
};

const stageStyle: React.CSSProperties = {
  background: "#F5F1FA",
  position: "relative",
  minHeight: "100vh",
};

const cardShadowStyle: React.CSSProperties = {
  boxShadow:
    "0 1px 2px rgba(30, 6, 64, 0.06), 0 4px 16px rgba(30, 6, 64, 0.08)",
};

const displayStyle: React.CSSProperties = {
  fontFamily: "'Inter Tight', Inter, sans-serif",
  letterSpacing: "-0.04em",
  fontWeight: 800,
};

const monoStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
};

// Pinstripe pattern for the hero band
const PINSTRIPE = `repeating-linear-gradient(
  90deg,
  rgba(255, 255, 255, 0.08) 0px,
  rgba(255, 255, 255, 0.08) 1px,
  transparent 1px,
  transparent 80px
)`;

export default function UIShowcase() {
  const [price, setPrice] = useState(482.8);

  useEffect(() => {
    const id = setInterval(() => {
      setPrice((p) => Number((p + (Math.random() - 0.5) * 20).toFixed(2)));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={stageStyle}>
      <main className="relative z-10" style={lightTheme}>
        <LiveTicker items={TICKER_ITEMS} />

        {/* Top utility bar */}
        <div className="border-b border-border bg-white/40 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between text-[10px] uppercase tracking-[0.18em]" style={monoStyle}>
            <span className="text-text-dim">TPD · v0.1.0 · live</span>
            <span className="text-text-mute">2026·05·23 · 14:02 UTC</span>
          </div>
        </div>

        {/* COLORED HERO BAND — vibrant violet stage that breaks up the white */}
        <div
          className="relative overflow-hidden"
          style={{ background: "#1E0640" }}
        >
          {/* Pinstripe overlay for tactile depth */}
          <div
            className="absolute inset-0"
            style={{ background: PINSTRIPE }}
            aria-hidden="true"
          />
          {/* Subtle emerald glow in bottom-right */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 40% 60% at 100% 100%, rgba(16, 185, 129, 0.18), transparent 60%)",
            }}
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-[1fr_auto] gap-12 items-end text-white">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/60 mb-6" style={monoStyle}>
                Design System / v5 / Light
              </div>
              <h1 className="text-7xl md:text-8xl leading-[0.92] uppercase text-white" style={displayStyle}>
                Topdraft
              </h1>
              <p className="mt-6 max-w-md text-base text-white/80 leading-relaxed">
                Skill-based fantasy sports trading. Buy fractional shares of athletes. Every play moves a price.
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/50 mb-1" style={monoStyle}>
                Total volume · 24h
              </div>
              <div className="text-4xl text-white tabular-nums" style={{ ...displayStyle, letterSpacing: "-0.02em" }}>
                $2,847,991
              </div>
              <div className="text-sm text-win tabular-nums mt-1 inline-flex items-center gap-1" style={monoStyle}>
                ▲ +12.4%
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 pt-16 pb-32">
          <Section title="Buttons" code="01">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Buy 5 shares</Button>
              <Button variant="ghost">Cancel</Button>
              <Button variant="danger">Sell all</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
            </div>
          </Section>

          <Section title="Badges" code="02">
            <div className="flex flex-wrap gap-3 items-center">
              <Badge variant="live" />
              <Badge variant="upcoming">Upcoming</Badge>
              <Badge variant="settled">Settled</Badge>
              <Badge variant="win">+12.4%</Badge>
              <Badge variant="loss">−3.1%</Badge>
            </div>
          </Section>

          <Section title="Cards" code="03">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="p-6" style={cardShadowStyle}>
                <div className="text-[10px] text-text-dim uppercase tracking-[0.18em] mb-2" style={monoStyle}>
                  Static
                </div>
                <div className="text-xl" style={displayStyle}>No hover lift</div>
              </Card>
              <Card interactive className="p-6" style={cardShadowStyle}>
                <div className="text-[10px] text-text-dim uppercase tracking-[0.18em] mb-2" style={monoStyle}>
                  Interactive
                </div>
                <div className="text-xl" style={displayStyle}>Hover lifts to surface-2</div>
              </Card>
            </div>
          </Section>

          <Section title="Input" code="04">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl">
              <Input placeholder="you@email.com" />
              <Input placeholder="Invalid input" error defaultValue="not-an-email" />
            </div>
          </Section>

          <Section title="Athlete price · live count-up" code="05">
            <Card className="p-7" style={cardShadowStyle}>
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <AvatarDisc name="Patrick Mahomes" size="md" />
                  <div>
                    <div className="text-base font-semibold">Patrick Mahomes</div>
                    <div className="text-[10px] text-text-mute uppercase tracking-[0.18em]" style={monoStyle}>
                      NFL · QB · KC
                    </div>
                  </div>
                </div>
                <Badge variant="live" />
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-5">
                <div>
                  <div className="text-[10px] text-text-dim uppercase tracking-[0.18em] mb-1" style={monoStyle}>
                    Current price
                  </div>
                  <AthletePrice value={price} delta={0.05} size="lg" />
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-text-dim uppercase tracking-[0.18em] mb-1" style={monoStyle}>
                    24h change
                  </div>
                  <div className="text-win text-base tabular-nums" style={monoStyle}>+5.2%</div>
                </div>
              </div>
            </Card>
          </Section>

          <Section title="Avatar disc" code="06">
            <div className="flex flex-wrap items-center gap-4">
              <AvatarDisc name="Patrick Mahomes" size="sm" />
              <AvatarDisc name="Patrick Mahomes" size="md" />
              <AvatarDisc name="Patrick Mahomes" size="lg" />
              <AvatarDisc name="Erling Haaland" size="md" />
              <AvatarDisc name="Lionel Messi" size="md" />
              <AvatarDisc name="LeBron James" size="md" />
              <AvatarDisc name="Caitlin Clark" size="md" />
            </div>
          </Section>

          <Section title="Skeleton" code="07">
            <div className="space-y-3 max-w-md">
              <Skeleton variant="text" />
              <Skeleton variant="text" className="w-2/3" />
              <Skeleton variant="text" className="w-1/2" />
              <Skeleton variant="card" />
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({ title, code, children }: { title: string; code: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <div className="flex items-baseline justify-between mb-5 pb-2 border-b border-border">
        <h2 className="text-[10px] uppercase tracking-[0.22em] text-text-mute" style={monoStyle}>
          {title}
        </h2>
        <span className="text-[10px] text-text-dim tabular-nums" style={monoStyle}>
          {code}
        </span>
      </div>
      {children}
    </section>
  );
}

const TICKER_ITEMS = [
  { name: "Mahomes", price: 482.8, delta: 0.052 },
  { name: "Haaland", price: 557.3, delta: 0.03 },
  { name: "Messi", price: 612.45, delta: -0.012 },
  { name: "LeBron", price: 391.2, delta: 0.018 },
  { name: "Curry", price: 428.99, delta: -0.024 },
  { name: "Allen", price: 365.5, delta: 0.044 },
  { name: "Mbappé", price: 598.1, delta: 0.011 },
  { name: "Tatum", price: 412.6, delta: -0.008 },
];
