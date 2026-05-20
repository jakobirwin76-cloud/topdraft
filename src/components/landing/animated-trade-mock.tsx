"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { mockStatsByExternalId } from "@/lib/mocks/athlete-stats";
import { performanceIndex } from "@/lib/pricing/performance-index";

/**
 * 3 athletes rotate through the landing hero's animated trade card.
 *
 * Each entry links to mockStatsByExternalId for identity + the typed stats
 * input. The Performance Index is computed from those stats and used to
 * DERIVE the athlete's base price (base = 200 + idx × 4). The index itself
 * is never displayed — it's a server-only signal at MVP.
 */
interface MockAthlete {
  externalId: string;
  events: readonly { label: string; pct: number }[];
}

const ATHLETES: readonly MockAthlete[] = [
  {
    externalId: "sr:nfl:player:1", // Patrick Mahomes (NFL · QB)
    events: [
      { label: "TD PASS · 38yd", pct: 5.2 },
      { label: "RUSH 1ST DOWN", pct: 1.1 },
      { label: "INC · 3rd & 8", pct: -0.4 },
    ],
  },
  {
    externalId: "sr:nba:player:1", // LeBron James (NBA · SF)
    events: [
      { label: "FASTBREAK DUNK", pct: 3.4 },
      { label: "AST · CORNER 3", pct: 1.8 },
      { label: "TURNOVER", pct: -1.2 },
    ],
  },
  {
    externalId: "sr:soc:player:1", // Erling Haaland (SOCCER · FW)
    events: [
      { label: "GOAL · 78'", pct: 8.0 },
      { label: "ASSIST · 84'", pct: 3.0 },
      { label: "OFFSIDE", pct: -0.6 },
    ],
  },
] as const;

const TICK_MS = 4000;
const TICKS_PER_ATHLETE = 3;
const COUNT_UP = { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

/**
 * Base price = anchor on the Performance Index.
 * Mirrors `derive_base_price(p_index)` in supabase/migrations/0005.
 */
function basePriceOf(externalId: string): number {
  const stats = mockStatsByExternalId[externalId];
  const idx = performanceIndex(stats.input);
  return Math.round((200 + idx * 4) * 100) / 100;
}

export function AnimatedTradeMock() {
  const [athleteIndex, setAthleteIndex] = useState(0);
  const [eventIndex, setEventIndex] = useState(0);
  const tickRef = useRef(0);
  const athleteIndexRef = useRef(0);

  const initialBase = basePriceOf(ATHLETES[0].externalId);
  const price = useMotionValue(initialBase);
  const display = useTransform(price, (v) => v.toFixed(2));

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current++;
      const localTick = tickRef.current % TICKS_PER_ATHLETE;

      if (localTick === 0) {
        const nextIdx = (athleteIndexRef.current + 1) % ATHLETES.length;
        athleteIndexRef.current = nextIdx;
        setAthleteIndex(nextIdx);
        setEventIndex(0);
        animate(price, basePriceOf(ATHLETES[nextIdx].externalId), COUNT_UP);
      } else {
        const athlete = ATHLETES[athleteIndexRef.current];
        const nextEvent = athlete.events[localTick - 1] ?? athlete.events[0];
        setEventIndex(localTick - 1);
        const newPrice = price.get() * (1 + nextEvent.pct / 100);
        animate(price, newPrice, COUNT_UP);
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [price]);

  const athlete = ATHLETES[athleteIndex];
  const stats = mockStatsByExternalId[athlete.externalId];
  const meta = stats.meta;
  const initials = initialsOf(meta.fullName);
  const currentEvent = eventIndex >= 0 ? athlete.events[eventIndex] : null;
  const positive = (currentEvent?.pct ?? 0) >= 0;

  return (
    <div
      className="glass-card p-6 md:p-7 select-none [overflow:visible]"
      aria-hidden="true"
    >
      {/* HEADER: portrait frame + name + change pill */}
      <div className="flex items-center gap-4 mb-8 [overflow:visible]">
        <PortraitFrame initials={initials} />
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={meta.fullName}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="font-secondary font-bold text-lg md:text-xl leading-tight tracking-[-0.02em] truncate text-text">
                {meta.fullName}
              </div>
              <div className="font-data text-[10px] uppercase tracking-widest text-text-mute">
                {meta.sport} · {meta.position} · {meta.teamCode}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        {currentEvent && <ChangePill positive={positive} pct={currentEvent.pct} />}
      </div>

      {/* CURRENT PRICE — the only number visible to the user */}
      <div className="mb-2">
        <div className="font-data text-[10px] uppercase tracking-[0.2em] text-text-dim mb-2">
          Current Price
        </div>
        <div className="flex items-baseline gap-2 font-data tabular-nums">
          <span className="text-text-mute text-3xl md:text-4xl font-medium">$</span>
          <motion.span className="text-text-mute text-5xl md:text-6xl font-bold leading-none tracking-tight">
            {display}
          </motion.span>
        </div>
      </div>

      {/* EVENT FEED */}
      <div className="mt-8 border-t border-accent-soft pt-6">
        <div className="font-data text-[10px] uppercase tracking-[0.2em] text-text-dim mb-4">
          Live · last 3 events
        </div>
        <div className="flex flex-col gap-3">
          {athlete.events.map((evt, i) => (
            <div
              key={`${athlete.externalId}-${evt.label}`}
              className="flex items-center justify-between text-xs"
              style={{ opacity: i <= eventIndex ? 1 : 0.35 }}
            >
              <span className="font-data text-text-mute uppercase tracking-wider truncate">
                {evt.label}
              </span>
              <span
                className={`font-data font-semibold tabular-nums ${evt.pct >= 0 ? "text-win" : "text-loss"}`}
              >
                {evt.pct >= 0 ? "+" : ""}
                {evt.pct.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Portrait frame — 3:4 ratio with violet-soft fill + ring + violet glow.
 * Initials inside (Bebas) like a jersey number. IP-safe stand-in for a draft
 * photo. Pass `photoUrl` to swap in a licensed PNG.
 */
function PortraitFrame({ initials, photoUrl }: { initials: string; photoUrl?: string }) {
  return (
    <div className="float-disc w-14 h-14 md:w-16 md:h-16 rounded-full bg-accent-soft ring-1 ring-accent/40 flex items-center justify-center shrink-0 overflow-hidden">
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="font-secondary font-bold text-xl md:text-2xl tracking-tight text-text leading-none">
          {initials}
        </span>
      )}
    </div>
  );
}

function ChangePill({ positive, pct }: { positive: boolean; pct: number }) {
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <div
      className={`inline-flex items-center gap-1 font-data font-semibold text-xs tabular-nums px-2 py-1 border ${
        positive ? "border-win/40 text-win" : "border-loss/40 text-loss"
      }`}
    >
      <Icon className="w-3 h-3" strokeWidth={2.5} />
      {positive ? "+" : ""}
      {pct.toFixed(1)}%
    </div>
  );
}

function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
