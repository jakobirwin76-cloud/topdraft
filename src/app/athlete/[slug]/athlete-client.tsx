"use client";

/**
 * Athlete page — the production template for every athlete on Topdraft.
 * Driven entirely by props (athlete) + sport-specific event pool. Same
 * template renders Mahomes, Messi, LeBron, anyone.
 */

import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { applyTrade, applyStatEvent, type PriceState } from "@/lib/pricing/amm";
import { MarqueeTicker } from "@/components/marquee-ticker";
import {
  ATHLETES,
  type Athlete,
  type Frame,
  type HistoryPoint,
  generateSessionSeed,
  generateTimeframeHistory,
} from "@/lib/athletes/data";
import {
  type StatEventDef,
  getEventPool,
  pickEventFromPool,
  computeMultiplier,
} from "@/lib/athletes/event-pools";

// ─────────────────────────────────────────────────────────────────────────────
//  TOKENS — dark cinema glassmorphism
// ─────────────────────────────────────────────────────────────────────────────
const tokens = {
  bg: "#09090B",
  glass: "rgba(255,255,255,0.04)",
  glass2: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.08)",
  borderBright: "rgba(255,255,255,0.16)",
  text: "#EDEDEF",
  textMute: "#94A3B8",
  textDim: "#5C616E",
  accent: "#8B5CF6",
  accentDeep: "#1E0640",
  win: "#10B981",
  winText: "#34D399",
  winSoft: "rgba(16,185,129,0.12)",
  winGlow: "rgba(16,185,129,0.35)",
  loss: "#EF4444",
  lossSoft: "rgba(239,68,68,0.12)",
  lossGlow: "rgba(239,68,68,0.35)",
};

const FONT_DISPLAY = "Inter, -apple-system, system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, 'SF Mono', monospace";

interface FeedEntry {
  id: string;
  ts: number;
  event: StatEventDef;
  multiplier: number;
  priceBefore: number;
  priceAfter: number;
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AthletePageClient({ athlete }: { athlete: Athlete }) {
  const [price, setPrice] = useState<PriceState>({
    basePrice: athlete.basePrice,
    currentPrice: athlete.initialPrice,
  });
  const [shares, setShares] = useState(5);
  const [holdings, setHoldings] = useState({ shares: 0, avgCost: 0 });
  // Realized P&L = profit locked in from completed sells.
  // Unrealized P&L = paper gain on shares still held.
  // Session total = realized + unrealized.
  const [realizedPnl, setRealizedPnl] = useState(0);
  const [tradeCount, setTradeCount] = useState(0);
  // Live feed pause/play (terminal control — accessibility + user preference)
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  // Ref-mirror of holdings so trade handler reads fresh values without stale closures.
  const holdingsRef = useRef(holdings);
  useEffect(() => {
    holdingsRef.current = holdings;
  }, [holdings]);
  const [frame, setFrame] = useState<Frame>("Session");
  const [sessionHistory, setSessionHistory] = useState<HistoryPoint[]>([]);
  const [dayHistory, setDayHistory] = useState<HistoryPoint[]>([]);
  const [weekHistory, setWeekHistory] = useState<HistoryPoint[]>([]);
  const [seasonHistory, setSeasonHistory] = useState<HistoryPoint[]>([]);
  const [now, setNow] = useState(Date.now());
  const startRef = useRef(athlete.initialPrice);
  const priceRef = useRef<PriceState>({
    basePrice: athlete.basePrice,
    currentPrice: athlete.initialPrice,
  });
  useEffect(() => {
    priceRef.current = price;
  }, [price]);

  // Reset on athlete change + seed all four histories on client
  useEffect(() => {
    startRef.current = athlete.initialPrice;
    priceRef.current = { basePrice: athlete.basePrice, currentPrice: athlete.initialPrice };
    setPrice({ basePrice: athlete.basePrice, currentPrice: athlete.initialPrice });
    setHoldings({ shares: 0, avgCost: 0 });
    setRealizedPnl(0);
    setTradeCount(0);
    setFeed([]);
    const ts = Date.now();
    setSessionHistory(generateSessionSeed(athlete, ts));
    setDayHistory(generateTimeframeHistory(athlete, "24h", ts));
    setWeekHistory(generateTimeframeHistory(athlete, "7d", ts));
    setSeasonHistory(generateTimeframeHistory(athlete, "Season", ts));
  }, [athlete]);

  // Clock for "Xs ago" labels
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Stat-event firing — sport + position pool + athlete-specific multiplier
  useEffect(() => {
    const pool = getEventPool(athlete.sport, athlete.position);
    function fire() {
      if (pausedRef.current) return;
      const ev = pickEventFromPool(pool);
      const prev = priceRef.current;
      const multiplier = computeMultiplier(ev);
      const next = applyStatEvent(prev, multiplier);
      priceRef.current = next;

      const ts = Date.now();
      const entry: FeedEntry = {
        id: `${ts}-${ev.code}`,
        ts,
        event: ev,
        multiplier,
        priceBefore: prev.currentPrice,
        priceAfter: next.currentPrice,
      };

      setPrice(next);
      setFeed((f) => [entry, ...f].slice(0, 8));
      setSessionHistory((h) => [...h, { t: ts, p: next.currentPrice }].slice(-60));
    }
    let id: ReturnType<typeof setTimeout>;
    const schedule = () => {
      id = setTimeout(() => {
        fire();
        schedule();
      }, 12_000 + Math.random() * 6_000);
    };
    schedule();
    return () => clearTimeout(id);
  }, [athlete]);

  const sessionDelta = (price.currentPrice - startRef.current) / startRef.current;
  const previewBuy = applyTrade(price, "buy", shares);
  const previewSell = applyTrade(price, "sell", shares);
  const buyImpact = ((previewBuy.currentPrice - price.currentPrice) / price.currentPrice) * 100;
  const sellImpact = ((previewSell.currentPrice - price.currentPrice) / price.currentPrice) * 100;
  const MAX_SHARES = 50;

  function handleTrade(side: "buy" | "sell") {
    if (shares <= 0) return;
    if (side === "sell" && holdings.shares < shares) return;
    const prev = priceRef.current;
    const next = applyTrade(prev, side, shares);
    priceRef.current = next;
    const tradePrice = side === "buy" ? next.currentPrice : prev.currentPrice;

    setPrice(next);
    setTradeCount((c) => c + 1);

    if (side === "sell") {
      // Lock in realized profit on this sell using the avg cost basis.
      const avgCost = holdingsRef.current.avgCost;
      const realized = shares * (tradePrice - avgCost);
      setRealizedPnl((r) => r + realized);
    }

    setHoldings((h) => {
      if (side === "buy") {
        const total = h.shares * h.avgCost + shares * tradePrice;
        const ns = h.shares + shares;
        return { shares: ns, avgCost: total / ns };
      }
      const ns = h.shares - shares;
      return { shares: ns, avgCost: ns > 0 ? h.avgCost : 0 };
    });
    setSessionHistory((hist) => {
      if (hist.length === 0) return [{ t: Date.now(), p: next.currentPrice }];
      const lastIdx = hist.length - 1;
      return hist.map((h, i) => (i === lastIdx ? { ...h, p: next.currentPrice } : h));
    });
  }

  // Display history depends on frame — for non-session frames, the last
  // point always reflects the current live price so the endpoint stays
  // in sync with the hero number.
  const displayHistory = useMemo(() => {
    if (frame === "Session") return sessionHistory;
    const base =
      frame === "24h" ? dayHistory :
      frame === "7d"  ? weekHistory :
                        seasonHistory;
    if (base.length === 0) return base;
    const last = base[base.length - 1]!;
    const live: HistoryPoint[] = base.slice(0, -1);
    live.push({ ...last, p: price.currentPrice });
    return live;
  }, [frame, sessionHistory, dayHistory, weekHistory, seasonHistory, price.currentPrice]);

  return (
    <div
      style={{ background: tokens.bg, color: tokens.text, minHeight: "100vh", fontFamily: FONT_DISPLAY }}
      className="relative overflow-x-hidden"
    >
      <RadialBackgrounds />
      <MarqueeTicker />
      <AthletePicker currentSlug={athlete.slug} />

      <main className="relative z-10 mx-auto max-w-[1600px] px-6 pt-6 pb-12">
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT — 65% */}
          <section className="col-span-12 lg:col-span-8 space-y-6">
            <TerminalMetaStrip
              tickCount={sessionHistory.length}
              lastUpdate={sessionHistory[sessionHistory.length - 1]?.t ?? now}
              now={now}
              paused={paused}
            />
            <HeroProfile
              athlete={athlete}
              price={price.currentPrice}
              sessionDelta={sessionDelta}
            />
            <PriceChart
              history={displayHistory}
              frame={frame}
              onFrameChange={setFrame}
              now={now}
            />
          </section>

          {/* RIGHT — 35% */}
          <aside className="col-span-12 lg:col-span-4 space-y-6">
            <TradePanel
              athlete={athlete}
              shares={shares}
              setShares={setShares}
              maxShares={MAX_SHARES}
              price={price.currentPrice}
              previewBuy={previewBuy.currentPrice}
              previewSell={previewSell.currentPrice}
              buyImpact={buyImpact}
              sellImpact={sellImpact}
              holdings={holdings}
              onTrade={handleTrade}
            />
            <PositionCard
              holdings={holdings}
              currentPrice={price.currentPrice}
              realizedPnl={realizedPnl}
            />
            <LiveFeed feed={feed} now={now} paused={paused} onTogglePause={() => setPaused((p) => !p)} />
          </aside>
        </div>
      </main>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STICKY WAITLIST BAR — slides up after 30s OR on first trade
// ─────────────────────────────────────────────────────────────────────────────
function StickyWaitlistBar({ tradeCount }: { tradeCount: number }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check dismissed flag once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("tpd_waitlist_dismissed");
    if (raw) {
      const at = Number(raw);
      const WEEK = 7 * 24 * 60 * 60 * 1000;
      if (Number.isFinite(at) && Date.now() - at < WEEK) {
        setDismissed(true);
      }
    }
  }, []);

  // Auto-show after 30s
  useEffect(() => {
    if (dismissed) return;
    const t = setTimeout(() => setVisible(true), 30_000);
    return () => clearTimeout(t);
  }, [dismissed]);

  // Show immediately on first trade
  useEffect(() => {
    if (tradeCount > 0 && !dismissed) setVisible(true);
  }, [tradeCount, dismissed]);

  function handleClose() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("tpd_waitlist_dismissed", String(Date.now()));
    }
    setVisible(false);
    setDismissed(true);
  }

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-50"
          style={{
            background: "rgba(9, 9, 11, 0.92)",
            backdropFilter: "blur(16px) saturate(140%)",
            WebkitBackdropFilter: "blur(16px) saturate(140%)",
            border: `1px solid ${tokens.borderBright}`,
            borderRadius: 16,
            boxShadow: `0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px ${tokens.accent}22 inset, 0 0 32px ${tokens.accent}22`,
            padding: 20,
          }}
        >
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div
                className="text-[10px] uppercase tracking-[0.22em] mb-2"
                style={{ color: tokens.winText, fontFamily: FONT_MONO }}
              >
                ● First 1,000 only
              </div>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  fontSize: 17,
                  letterSpacing: "-0.02em",
                  color: tokens.text,
                  lineHeight: 1.25,
                  marginBottom: 4,
                }}
              >
                Like trading? Lock in a Founder badge.
              </div>
              <p
                className="mb-4"
                style={{ fontSize: 12, color: tokens.textMute, lineHeight: 1.5 }}
              >
                Top 1,000 on the waitlist get permanent in-app status + first access at launch.
              </p>
              <Link
                href="/#waitlist"
                onClick={handleClose}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg w-full justify-center"
                style={{
                  background: `linear-gradient(180deg, ${tokens.accent} 0%, ${tokens.accentDeep} 100%)`,
                  color: "#fff",
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: "0.02em",
                  boxShadow: `0 0 20px ${tokens.accent}55`,
                }}
              >
                Join the waitlist →
              </Link>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Dismiss"
              className="shrink-0 h-7 w-7 rounded-md flex items-center justify-center transition-colors"
              style={{
                border: `1px solid ${tokens.border}`,
                color: tokens.textMute,
                background: "transparent",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path
                  d="M2 2L10 10M10 2L2 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  BACKGROUND — ambient radial glows
// ─────────────────────────────────────────────────────────────────────────────
function RadialBackgrounds() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <div className="absolute -top-32 -left-32 h-[40rem] w-[40rem] rounded-full opacity-40"
        style={{ background: `radial-gradient(circle, ${tokens.accent}33 0%, transparent 60%)`, filter: "blur(80px)" }} />
      <div className="absolute -bottom-40 -right-32 h-[36rem] w-[36rem] rounded-full opacity-30"
        style={{ background: `radial-gradient(circle, ${tokens.win}33 0%, transparent 60%)`, filter: "blur(80px)" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[32rem] w-[60rem] opacity-20"
        style={{ background: `radial-gradient(ellipse, ${tokens.accentDeep}80 0%, transparent 70%)`, filter: "blur(100px)" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ATHLETE PICKER — clickable bar of all athletes, current one highlighted
// ─────────────────────────────────────────────────────────────────────────────
function AthletePicker({ currentSlug }: { currentSlug: string }) {
  const all = Object.values(ATHLETES);
  return (
    <div
      className="relative z-10 border-b"
      style={{
        background: "rgba(9, 9, 11, 0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderColor: tokens.border,
      }}
    >
      <div className="mx-auto max-w-[1600px] px-6 py-3">
        <div className="flex items-center gap-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <span
            className="text-[10px] uppercase tracking-[0.22em] shrink-0 pr-2 border-r"
            style={{ color: tokens.textDim, fontFamily: FONT_MONO, borderColor: tokens.border }}
          >
            Switch athlete
          </span>
          {all.map((a) => {
            const active = a.slug === currentSlug;
            return (
              <Link
                key={a.slug}
                href={`/athlete/${a.slug}`}
                className="shrink-0 flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-all"
                style={{
                  background: active ? tokens.glass2 : "transparent",
                  border: `1px solid ${active ? tokens.accent : tokens.border}`,
                  boxShadow: active ? `0 0 16px ${tokens.accent}55, inset 0 0 0 1px ${tokens.accent}33` : "none",
                }}
              >
                <span
                  className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${tokens.accent} 0%, ${tokens.accentDeep} 100%)`,
                    color: "#fff",
                    fontFamily: FONT_DISPLAY,
                    letterSpacing: "-0.02em",
                    boxShadow: active ? `0 0 12px ${tokens.accent}66` : "none",
                  }}
                >
                  {a.initials}
                </span>
                <span
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 12,
                    fontWeight: 600,
                    color: active ? tokens.text : tokens.textMute,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {a.name.split(" ").pop()}
                </span>
                <span
                  className="hidden sm:inline"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    letterSpacing: "0.16em",
                    color: tokens.textDim,
                  }}
                >
                  {a.sport}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TERMINAL META STRIP — Bloomberg-style eyebrow row above the hero
// ─────────────────────────────────────────────────────────────────────────────
function TerminalMetaStrip({
  tickCount,
  lastUpdate,
  now,
  paused,
}: {
  tickCount: number;
  lastUpdate: number;
  now: number;
  paused: boolean;
}) {
  const secondsAgo = Math.max(0, Math.floor((now - lastUpdate) / 1000));
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-xl px-4 py-2.5"
      style={{
        background: "rgba(9, 9, 11, 0.5)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${tokens.border}`,
        fontFamily: FONT_MONO,
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      }}
    >
      <div className="flex items-center gap-4 min-w-0">
        <span className="flex items-center gap-1.5 shrink-0" style={{ color: paused ? tokens.loss : tokens.winText }}>
          <svg width="6" height="6" viewBox="0 0 6 6" aria-hidden="true">
            <circle cx="3" cy="3" r="3" fill="currentColor">
              {!paused && <animate attributeName="opacity" values="1;0.4;1" dur="1.4s" repeatCount="indefinite" />}
            </circle>
          </svg>
          {paused ? "Halted" : "Live"}
        </span>
        <span className="shrink-0" style={{ color: tokens.textDim }}>
          Session
        </span>
        <span style={{ color: tokens.text, fontVariantNumeric: "tabular-nums" }}>
          {tickCount} <span style={{ color: tokens.textDim, marginLeft: 4 }}>ticks</span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span style={{ color: tokens.textDim }}>Updated</span>
        <span style={{ color: tokens.textMute, fontVariantNumeric: "tabular-nums" }}>
          {secondsAgo}s ago
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  HERO PROFILE
// ─────────────────────────────────────────────────────────────────────────────
function HeroProfile({ athlete, price, sessionDelta }: { athlete: Athlete; price: number; sessionDelta: number }) {
  const up = sessionDelta >= 0;
  return (
    <GlassCard className="p-8 lg:p-10">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
        <div className="flex items-center gap-5">
          <div
            className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{
              background: `linear-gradient(135deg, ${tokens.accent} 0%, ${tokens.accentDeep} 100%)`,
              color: "#fff",
              boxShadow: `0 0 40px ${tokens.accent}55`,
              fontFamily: FONT_DISPLAY,
              letterSpacing: "-0.02em",
            }}
          >
            {athlete.initials}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] mb-2 flex items-center gap-2" style={{ color: tokens.textMute, fontFamily: FONT_MONO }}>
              {athlete.league} · {athlete.position} · {athlete.teamCode}
              <PulsingLive />
            </div>
            <h1 className="text-4xl lg:text-5xl" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1 }}>
              {athlete.name}
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: tokens.textMute }}>{athlete.team}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: tokens.textDim, fontFamily: FONT_MONO }}>
            Current price
          </div>
          <FlashOnChange value={price}>
            <div style={{ fontFamily: FONT_MONO, fontVariantNumeric: "tabular-nums", fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 700, letterSpacing: "-0.02em", color: tokens.text, lineHeight: 1 }}>
              ${price.toFixed(2)}
            </div>
          </FlashOnChange>
          <div className="mt-2 inline-flex items-center gap-1.5" style={{
            fontFamily: FONT_MONO,
            fontSize: 13,
            fontVariantNumeric: "tabular-nums",
            color: up ? tokens.winText : tokens.loss,
            textShadow: up ? `0 0 8px ${tokens.winGlow}` : `0 0 8px ${tokens.lossGlow}`,
          }}>
            {up ? "▲" : "▼"} {up ? "+" : ""}{(sessionDelta * 100).toFixed(2)}% · session
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function PulsingLive() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md" style={{
      background: tokens.winSoft, color: tokens.winText,
      fontFamily: FONT_MONO, fontSize: 10, letterSpacing: "0.16em",
    }}>
      <svg width="6" height="6" viewBox="0 0 6 6" aria-hidden="true">
        <circle cx="3" cy="3" r="3" fill={tokens.win}>
          <animate attributeName="opacity" values="1;0.4;1" dur="1.4s" repeatCount="indefinite" />
        </circle>
      </svg>
      LIVE
    </span>
  );
}

function FlashOnChange({ value, children }: { value: number; children: React.ReactNode }) {
  const lastRef = useRef(value);
  const [direction, setDirection] = useState<"up" | "down" | null>(null);
  useEffect(() => {
    if (value > lastRef.current) setDirection("up");
    else if (value < lastRef.current) setDirection("down");
    lastRef.current = value;
    const t = setTimeout(() => setDirection(null), 700);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <motion.div
      key={value}
      initial={{ scale: 0.985 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      style={{
        color: direction === "up" ? tokens.winText : direction === "down" ? tokens.loss : tokens.text,
        transition: "color 700ms ease-out",
      }}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PRICE CHART — frame state lifted to parent so pills swap data
// ─────────────────────────────────────────────────────────────────────────────
function PriceChart({
  history,
  frame,
  onFrameChange,
  now,
}: {
  history: HistoryPoint[];
  frame: Frame;
  onFrameChange: (f: Frame) => void;
  now: number;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const W = 1200;
  const H = 280;
  const padding = { top: 24, right: 24, bottom: 28, left: 24 };

  if (history.length < 2) {
    return (
      <GlassCard className="p-6">
        <div className="h-[280px] flex items-center justify-center" style={{ color: tokens.textDim, fontFamily: FONT_MONO, fontSize: 12 }}>
          Loading chart…
        </div>
      </GlassCard>
    );
  }

  const timestamps = history.map((h) => h.t);
  const tMin = timestamps[0]!;
  const tMax = timestamps[timestamps.length - 1]!;

  const prices = history.map((h) => h.p);
  const pMin = Math.min(...prices);
  const pMax = Math.max(...prices);
  const pRange = pMax - pMin;
  const pPad = Math.max(pRange * 0.15, pMax * 0.005);
  const yLo = pMin - pPad;
  const yHi = pMax + pPad;
  const yRange = Math.max(0.01, yHi - yLo);

  const innerW = W - padding.left - padding.right;
  const innerH = H - padding.top - padding.bottom;

  // X-axis is TRUE time. Each point's horizontal position reflects when it
  // happened. Quiet periods → flat stretches. Bursts → tighter clusters.
  const tRange = Math.max(1, tMax - tMin);

  const points = history.map((h) => ({
    x: padding.left + ((h.t - tMin) / tRange) * innerW,
    y: padding.top + innerH - ((h.p - yLo) / yRange) * innerH,
    t: h.t,
    p: h.p,
  }));

  const pathD = smoothPath(points.map((p) => [p.x, p.y]));
  const areaD = `${pathD} L ${points[points.length - 1]!.x} ${H - padding.bottom} L ${points[0]!.x} ${H - padding.bottom} Z`;

  const lastPoint = points[points.length - 1]!;
  const firstPrice = points[0]!.p;
  const lastPrice = lastPoint.p;
  const up = lastPrice >= firstPrice;
  const color = up ? tokens.win : tokens.loss;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < points.length; i++) {
      const d = Math.abs(points[i]!.x - svgX);
      if (d < best) { best = d; nearest = i; }
    }
    setHoverIdx(nearest);
  }

  const hoverPoint = hoverIdx !== null ? points[hoverIdx] : null;
  const tooltipW = 168;
  const cursorPct = hoverPoint ? (hoverPoint.x / W) * 100 : 0;

  // Frame-specific X-axis caption
  const spanLabel = (() => {
    const diff = tMax - tMin;
    if (frame === "Session") return `${Math.max(1, Math.round(diff / 60_000))} min ago`;
    if (frame === "24h") return "24h ago";
    if (frame === "7d") return "7 days ago";
    return "Season start";
  })();

  return (
    <GlassCard className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] mb-1" style={{ color: tokens.textMute, fontFamily: FONT_MONO }}>
            Price chart
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 18, color: tokens.text }}>
            {frame === "Session" ? `Live · ${history.length} ticks` : `${frame} · ${history.length} ticks`}
          </div>
        </div>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: tokens.glass, border: `1px solid ${tokens.border}` }}>
          {(["Session", "24h", "7d", "Season"] as Frame[]).map((f) => {
            const active = frame === f;
            return (
              <button
                key={f}
                onClick={() => onFrameChange(f)}
                className="px-3 py-1 rounded-md text-[11px] transition-all"
                style={{
                  background: active ? tokens.glass2 : "transparent",
                  color: active ? tokens.text : tokens.textMute,
                  fontFamily: FONT_MONO,
                  letterSpacing: "0.08em",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full block" style={{ height: H }} role="img" aria-label={`Price chart, current price $${lastPrice.toFixed(2)}, ${up ? "up" : "down"}`}>
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.32" />
              <stop offset="50%" stopColor={color} stopOpacity="0.10" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
            <filter id="strokeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="nodeGlow">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </radialGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((r, i) => {
            const y = padding.top + innerH * r;
            return <line key={i} x1={padding.left} y1={y} x2={W - padding.right} y2={y} stroke={tokens.border} strokeDasharray="2 4" strokeWidth="1" />;
          })}

          <path d={areaD} fill="url(#areaFill)" />
          <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter="url(#strokeGlow)" />

          {hoverPoint && (
            <g style={{ pointerEvents: "none" }}>
              {/* Vertical crosshair */}
              <line x1={hoverPoint.x} y1={padding.top} x2={hoverPoint.x} y2={H - padding.bottom} stroke={tokens.borderBright} strokeDasharray="3 3" strokeWidth="1" opacity="0.7" />
              {/* Horizontal crosshair */}
              <line x1={padding.left} y1={hoverPoint.y} x2={W - padding.right} y2={hoverPoint.y} stroke={tokens.borderBright} strokeDasharray="3 3" strokeWidth="1" opacity="0.5" />
              {/* Snap dot */}
              <circle cx={hoverPoint.x} cy={hoverPoint.y} r="5" fill={color} stroke="#09090B" strokeWidth="2" />
            </g>
          )}

          <circle cx={lastPoint.x} cy={lastPoint.y} r="20" fill="url(#nodeGlow)">
            <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={lastPoint.x} cy={lastPoint.y} r="5" fill={color} stroke="#09090B" strokeWidth="2">
            <animate attributeName="r" values="4;6;4" dur="1.4s" repeatCount="indefinite" />
          </circle>

          {!hoverPoint && (
            <text x={lastPoint.x - 8} y={lastPoint.y - 14} textAnchor="end" style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.18em" }} fill={tokens.textMute}>NOW</text>
          )}
        </svg>

        <div
          aria-hidden={!hoverPoint}
          className="absolute pointer-events-none transition-opacity duration-200"
          style={{
            opacity: hoverPoint ? 1 : 0,
            top: 12,
            left: `clamp(8px, calc(${cursorPct}% - ${tooltipW / 2}px), calc(100% - ${tooltipW + 8}px))`,
            width: tooltipW,
            background: "rgba(9, 9, 11, 0.92)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${tokens.borderBright}`,
            borderRadius: 10,
            padding: "10px 14px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: tokens.textDim, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4 }}>
            {hoverPoint ? fmtChartAgo(now - hoverPoint.t) : ""}
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: tokens.text, fontVariantNumeric: "tabular-nums", fontWeight: 600, letterSpacing: "-0.01em" }}>
            ${hoverPoint ? hoverPoint.p.toFixed(2) : "0.00"}
          </div>
        </div>
      </div>

      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.18em]" style={{ color: tokens.textDim, fontFamily: FONT_MONO }}>
        <span>{spanLabel}</span>
        <span>Updated {Math.max(1, Math.floor((now - history[history.length - 1]!.t) / 1000))}s ago</span>
      </div>
    </GlassCard>
  );
}

function smoothPath(pts: [number, number][]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0]![0]} ${pts[0]![1]}`;
  const d: string[] = [`M ${pts[0]![0].toFixed(2)} ${pts[0]![1].toFixed(2)}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(`C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`);
  }
  return d.join(" ");
}

function fmtChartAgo(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  TRADE PANEL
// ─────────────────────────────────────────────────────────────────────────────
function TradePanel({
  athlete, shares, setShares, maxShares, price, previewBuy, previewSell, buyImpact, sellImpact, holdings, onTrade,
}: {
  athlete: Athlete;
  shares: number;
  setShares: (n: number) => void;
  maxShares: number;
  price: number;
  previewBuy: number;
  previewSell: number;
  buyImpact: number;
  sellImpact: number;
  holdings: { shares: number; avgCost: number };
  onTrade: (side: "buy" | "sell") => void;
}) {
  const total = shares * price;
  const canSell = holdings.shares >= shares;
  return (
    <GlassCard className="p-6">
      <div className="text-[10px] uppercase tracking-[0.22em] mb-4" style={{ color: tokens.textMute, fontFamily: FONT_MONO }}>
        Order · {athlete.name.split(" ").pop()}
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3 items-end mb-3">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color: tokens.textDim, fontFamily: FONT_MONO }}>
            Shares
          </label>
          <input
            type="number"
            min={1}
            max={maxShares}
            value={shares}
            onChange={(e) => setShares(Math.max(1, Math.min(maxShares, Number(e.target.value) || 1)))}
            className="w-full rounded-lg px-3 py-2.5 outline-none transition-all"
            style={{ background: tokens.glass, border: `1px solid ${tokens.border}`, color: tokens.text, fontFamily: FONT_MONO, fontSize: 16, fontVariantNumeric: "tabular-nums" }}
          />
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: tokens.textDim, fontFamily: FONT_MONO }}>Est. total</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 22, fontVariantNumeric: "tabular-nums", color: tokens.text, fontWeight: 600 }}>
            ${total.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 mb-3">
        {[1, 5, 10, 25].map((n) => (
          <QuickPick key={n} active={shares === n} onClick={() => setShares(n)}>{n}</QuickPick>
        ))}
        <QuickPick active={shares === maxShares} onClick={() => setShares(maxShares)}>MAX</QuickPick>
      </div>

      <div className="rounded-md mb-4 overflow-hidden" style={{ background: tokens.glass, border: `1px solid ${tokens.border}` }}>
        <div className="flex items-center justify-between px-3 pt-2 pb-1" style={{ fontFamily: FONT_MONO, fontSize: 11, color: tokens.textMute }}>
          <span className="uppercase tracking-[0.14em]">Price impact</span>
          <div className="flex items-center gap-3">
            <span style={{ color: tokens.winText, fontVariantNumeric: "tabular-nums" }}>
              buy {buyImpact >= 0 ? "+" : ""}{buyImpact.toFixed(2)}%
            </span>
            <span style={{ color: tokens.loss, fontVariantNumeric: "tabular-nums" }}>
              sell {sellImpact >= 0 ? "+" : ""}{sellImpact.toFixed(2)}%
            </span>
          </div>
        </div>
        {/* Pressure bar — visualizes AMM impact balance proportionally */}
        <div className="relative h-1 mx-3 mb-2 mt-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
          {(() => {
            const totalMag = Math.abs(buyImpact) + Math.abs(sellImpact);
            const buyWidth = totalMag === 0 ? 50 : (Math.abs(buyImpact) / totalMag) * 100;
            return (
              <>
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-300"
                  style={{
                    width: `${buyWidth}%`,
                    background: `linear-gradient(90deg, ${tokens.win} 0%, ${tokens.winText} 100%)`,
                    boxShadow: `0 0 8px ${tokens.winGlow}`,
                  }}
                />
                <div
                  className="absolute inset-y-0 right-0 transition-all duration-300"
                  style={{
                    width: `${100 - buyWidth}%`,
                    background: `linear-gradient(90deg, ${tokens.loss} 0%, #B91C1C 100%)`,
                    boxShadow: `0 0 8px ${tokens.lossGlow}`,
                  }}
                />
              </>
            );
          })()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <TradeButton variant="buy" onClick={() => onTrade("buy")}>
          <span className="text-[10px] uppercase tracking-[0.18em] opacity-70">Buy →</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 15, fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>
            ${previewBuy.toFixed(2)}
          </span>
        </TradeButton>
        <TradeButton variant="sell" onClick={() => onTrade("sell")} disabled={!canSell}>
          <span className="text-[10px] uppercase tracking-[0.18em] opacity-70">Sell →</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 15, fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>
            ${previewSell.toFixed(2)}
          </span>
        </TradeButton>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed" style={{ color: tokens.textDim, fontFamily: FONT_MONO }}>
        Play money · AMM ±2% per trade cap · floor at 10% of base
      </p>
    </GlassCard>
  );
}

function QuickPick({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 py-2 rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        background: active ? tokens.glass2 : "transparent",
        border: `1px solid ${active ? tokens.accent : tokens.border}`,
        color: active ? tokens.text : tokens.textMute,
        fontFamily: FONT_MONO,
        fontSize: 11,
        letterSpacing: "0.14em",
        fontWeight: active ? 600 : 400,
        boxShadow: active ? `0 0 0 1px ${tokens.accent}33, inset 0 0 12px ${tokens.accent}11` : "none",
        ["--tw-ring-color" as string]: tokens.accent,
        ["--tw-ring-offset-color" as string]: tokens.bg,
      }}
    >
      {children}
    </button>
  );
}

function TradeButton({ variant, onClick, disabled, children }: { variant: "buy" | "sell"; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  const isBuy = variant === "buy";
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      whileHover={disabled ? undefined : { y: -1 }}
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-start gap-1 px-5 py-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 min-h-[68px]"
      style={{
        background: isBuy
          ? `linear-gradient(180deg, ${tokens.win} 0%, #0F9F70 100%)`
          : `linear-gradient(180deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.05) 100%)`,
        border: `1px solid ${isBuy ? tokens.win : tokens.loss + "66"}`,
        color: isBuy ? "#062818" : tokens.loss,
        boxShadow: isBuy
          ? `0 0 32px ${tokens.winGlow}, 0 8px 24px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.25)`
          : `0 0 16px rgba(239,68,68,0.20), inset 0 1px 0 rgba(255,255,255,0.05)`,
        ["--tw-ring-color" as string]: isBuy ? tokens.win : tokens.loss,
        ["--tw-ring-offset-color" as string]: tokens.bg,
      }}
    >
      {children}
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  POSITION CARD
// ─────────────────────────────────────────────────────────────────────────────
function PositionCard({
  holdings,
  currentPrice,
  realizedPnl,
}: {
  holdings: { shares: number; avgCost: number };
  currentPrice: number;
  realizedPnl: number;
}) {
  const unrealizedPnl = holdings.shares * (currentPrice - holdings.avgCost);
  const totalPnl = realizedPnl + unrealizedPnl;
  const up = totalPnl >= 0;
  const tone = up ? tokens.winText : tokens.loss;
  const sign = up ? "+" : "−";
  const absTotal = Math.abs(totalPnl);
  const hasActivity = holdings.shares > 0 || realizedPnl !== 0;

  return (
    <GlassCard className="p-6">
      {/* Headline: total session P&L */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: tokens.textMute, fontFamily: FONT_MONO }}>
          Session earnings
        </div>
        {hasActivity && (
          <div
            className="px-2 py-0.5 rounded uppercase tracking-[0.14em]"
            style={{
              background: up ? tokens.winSoft : tokens.lossSoft,
              color: tone,
              fontFamily: FONT_MONO,
              fontSize: 9,
              fontWeight: 600,
            }}
          >
            {up ? "Up" : "Down"}
          </div>
        )}
      </div>

      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 34,
          fontVariantNumeric: "tabular-nums",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: hasActivity ? tone : tokens.text,
          textShadow: hasActivity ? `0 0 16px ${up ? tokens.winGlow : tokens.lossGlow}` : "none",
          lineHeight: 1,
        }}
      >
        {hasActivity ? `${sign}$${absTotal.toFixed(2)}` : "$0.00"}
      </div>
      <div
        className="mt-1.5"
        style={{ fontFamily: FONT_MONO, fontSize: 11, color: tokens.textDim, letterSpacing: "0.04em" }}
      >
        play money · this session
      </div>

      {/* Breakdown — realized vs unrealized */}
      <div className="mt-5 pt-4 grid grid-cols-2 gap-4 border-t" style={{ borderColor: tokens.border }}>
        <PnlStat label="Realized" value={realizedPnl} />
        <PnlStat label="Unrealized" value={unrealizedPnl} />
      </div>

      {/* Current holdings line */}
      <div
        className="mt-4 pt-3 flex items-baseline justify-between border-t"
        style={{ borderColor: tokens.border, fontFamily: FONT_MONO, fontSize: 11 }}
      >
        <span className="uppercase tracking-[0.14em]" style={{ color: tokens.textDim }}>
          Holding
        </span>
        <span style={{ color: tokens.text, fontVariantNumeric: "tabular-nums" }}>
          {holdings.shares > 0
            ? `${holdings.shares} shares · avg $${holdings.avgCost.toFixed(2)}`
            : "—"}
        </span>
      </div>
    </GlassCard>
  );
}

function PnlStat({ label, value }: { label: string; value: number }) {
  const up = value >= 0;
  const tone = value === 0 ? tokens.textMute : up ? tokens.winText : tokens.loss;
  const sign = value === 0 ? "" : up ? "+" : "−";
  return (
    <div>
      <div
        className="text-[10px] uppercase tracking-[0.18em] mb-1"
        style={{ color: tokens.textDim, fontFamily: FONT_MONO }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 15,
          fontVariantNumeric: "tabular-nums",
          color: tone,
          fontWeight: 600,
        }}
      >
        {sign}${Math.abs(value).toFixed(2)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  LIVE FEED
// ─────────────────────────────────────────────────────────────────────────────
function LiveFeed({
  feed,
  now,
  paused,
  onTogglePause,
}: {
  feed: FeedEntry[];
  now: number;
  paused: boolean;
  onTogglePause: () => void;
}) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: tokens.border }}>
        <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: tokens.textMute, fontFamily: FONT_MONO }}>
          Live activity
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePause}
            aria-label={paused ? "Resume live feed" : "Pause live feed"}
            className="h-6 w-6 flex items-center justify-center rounded transition-colors"
            style={{
              border: `1px solid ${tokens.border}`,
              color: paused ? tokens.winText : tokens.textMute,
              background: paused ? tokens.winSoft : "transparent",
            }}
          >
            {paused ? (
              <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">
                <path d="M1 0.5L8 4.5L1 8.5V0.5Z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="8" height="9" viewBox="0 0 8 9" aria-hidden="true">
                <rect x="0" y="0.5" width="2.5" height="8" fill="currentColor" />
                <rect x="5.5" y="0.5" width="2.5" height="8" fill="currentColor" />
              </svg>
            )}
          </button>
          {paused ? (
            <span
              className="px-2 py-0.5 rounded uppercase tracking-[0.18em]"
              style={{
                background: tokens.lossSoft,
                color: tokens.loss,
                fontFamily: FONT_MONO,
                fontSize: 9,
                fontWeight: 600,
              }}
            >
              Paused
            </span>
          ) : (
            <PulsingLive />
          )}
        </div>
      </div>

      {feed.length === 0 ? (
        <div className="py-10 text-center" style={{ color: tokens.textDim, fontFamily: FONT_MONO, fontSize: 12 }}>
          Waiting for the next play…
        </div>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {feed.map((entry) => (
              <FeedRow key={entry.id} entry={entry} now={now} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </GlassCard>
  );
}

function FeedRow({ entry, now }: { entry: FeedEntry; now: number }) {
  const delta = (entry.priceAfter - entry.priceBefore) / entry.priceBefore;
  const up = entry.event.positive;
  const tone = up ? tokens.winText : tokens.loss;
  const soft = up ? tokens.winSoft : tokens.lossSoft;
  const ageMs = now - entry.ts;
  const flashing = ageMs < 1500;
  const ago = fmtFeedAgo(ageMs);

  return (
    <motion.li
      initial={{ opacity: 0, x: -12, backgroundColor: soft }}
      animate={{
        opacity: 1, x: 0,
        backgroundColor: flashing ? soft : "rgba(255,255,255,0.02)",
      }}
      exit={{ opacity: 0 }}
      transition={{
        opacity: { duration: 0.2 },
        x: { type: "spring", stiffness: 380, damping: 30 },
        backgroundColor: { duration: 1.5, ease: "easeOut" },
      }}
      className="flex items-center justify-between gap-3 rounded-md px-3 py-2.5"
      style={{
        border: `1px solid ${flashing ? (up ? tokens.win + "55" : tokens.loss + "55") : tokens.border}`,
        transition: "border-color 1.5s ease-out",
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="px-1.5 py-0.5 rounded uppercase tracking-[0.1em] shrink-0" style={{ background: soft, color: tone, fontFamily: FONT_MONO, fontSize: 9, fontWeight: 600 }}>
          {entry.event.code}
        </span>
        <span className="truncate text-sm" style={{ color: tokens.text }}>
          {entry.event.label}
        </span>
      </div>
      <div className="text-right shrink-0">
        <div style={{ fontFamily: FONT_MONO, fontSize: 12, fontVariantNumeric: "tabular-nums", color: tone, fontWeight: 600 }}>
          {delta >= 0 ? "+" : ""}{(delta * 100).toFixed(2)}%
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: tokens.textDim }}>{ago}</div>
      </div>
    </motion.li>
  );
}

function fmtFeedAgo(ms: number): string {
  const s = Math.max(1, Math.floor(ms / 1000));
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  GLASS CARD
// ─────────────────────────────────────────────────────────────────────────────
function GlassCard({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`relative rounded-2xl ${className}`}
      style={{
        background: tokens.glass,
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
        border: `1px solid ${tokens.border}`,
        boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 16px 32px rgba(0,0,0,0.4)",
      }}
    >
      {children}
    </div>
  );
}
