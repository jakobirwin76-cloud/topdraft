"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { type Athlete, type Sport } from "@/lib/athletes/data";

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
};

const FONT_DISPLAY = "Inter, -apple-system, system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

type Filter = "ALL" | Sport;

const FILTERS: Filter[] = ["ALL", "NFL", "NBA", "SOCCER"];
const FILTER_LABEL: Record<Filter, string> = {
  ALL: "All",
  NFL: "NFL",
  NBA: "NBA",
  SOCCER: "Soccer",
};

export default function AppHomeClient({ athletes }: { athletes: Athlete[] }) {
  const [filter, setFilter] = useState<Filter>("ALL");

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { ALL: athletes.length, NFL: 0, NBA: 0, SOCCER: 0 };
    for (const a of athletes) c[a.sport]++;
    return c;
  }, [athletes]);

  const filtered = filter === "ALL" ? athletes : athletes.filter((a) => a.sport === filter);

  return (
    <div
      style={{
        background: tokens.bg,
        color: tokens.text,
        minHeight: "100vh",
        fontFamily: FONT_DISPLAY,
      }}
      className="relative overflow-x-hidden"
    >
      <RadialBackgrounds />

      <div className="relative z-10 mx-auto max-w-[1400px] px-5 md:px-8 pt-10 md:pt-16 pb-20">
        {/* Header */}
        <header className="mb-10 md:mb-14">
          <div
            className="text-[10px] uppercase tracking-[0.24em] mb-3"
            style={{ color: tokens.textMute, fontFamily: FONT_MONO }}
          >
            All athletes · {athletes.length} live
          </div>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl"
            style={{
              fontFamily: "'Inter Tight', Inter, sans-serif",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
            }}
          >
            Pick a player.
            <br />
            <span style={{ color: tokens.textMute }}>Trade their next play.</span>
          </h1>
          <p
            className="mt-5 max-w-lg text-base md:text-lg leading-relaxed"
            style={{ color: tokens.textMute }}
          >
            Every athlete has a live share price. Buy before kickoff, sell after a touchdown.
            Play money only. 18+.
          </p>
        </header>

        {/* Filter pills */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="shrink-0 px-4 py-2 rounded-md transition-all"
                style={{
                  background: active ? tokens.glass2 : "transparent",
                  border: `1px solid ${active ? tokens.accent : tokens.border}`,
                  color: active ? tokens.text : tokens.textMute,
                  fontFamily: FONT_MONO,
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: active ? 600 : 400,
                  boxShadow: active ? `0 0 16px ${tokens.accent}33` : "none",
                }}
              >
                {FILTER_LABEL[f]}{" "}
                <span style={{ color: tokens.textDim, marginLeft: 4 }}>{counts[f]}</span>
              </button>
            );
          })}
        </div>

        {/* Athlete grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((a, i) => (
            <AthleteCard key={a.slug} athlete={a} delay={i * 0.04} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div
            className="text-center py-16"
            style={{ color: tokens.textDim, fontFamily: FONT_MONO, fontSize: 12 }}
          >
            No athletes in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}

function AthleteCard({ athlete, delay }: { athlete: Athlete; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 280, damping: 28 }}
    >
      <Link href={`/athlete/${athlete.slug}`}>
        <div
          className="group p-5 rounded-2xl transition-all cursor-pointer h-full"
          style={{
            background: tokens.glass,
            backdropFilter: "blur(20px) saturate(140%)",
            WebkitBackdropFilter: "blur(20px) saturate(140%)",
            border: `1px solid ${tokens.border}`,
          }}
        >
          {/* Top: avatar + sport pill */}
          <div className="flex items-center justify-between mb-4">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center text-base font-bold"
              style={{
                background: `linear-gradient(135deg, ${tokens.accent} 0%, ${tokens.accentDeep} 100%)`,
                color: "#fff",
                fontFamily: FONT_DISPLAY,
                letterSpacing: "-0.02em",
                boxShadow: `0 0 20px ${tokens.accent}33`,
              }}
            >
              {athlete.initials}
            </div>
            <span
              className="px-2 py-0.5 rounded-md"
              style={{
                background: tokens.glass2,
                border: `1px solid ${tokens.border}`,
                color: tokens.textMute,
                fontFamily: FONT_MONO,
                fontSize: 9,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              {athlete.league} · {athlete.position}
            </span>
          </div>

          {/* Name */}
          <h3
            className="mb-1"
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
            }}
          >
            {athlete.name}
          </h3>
          <div
            className="text-sm mb-5"
            style={{ color: tokens.textDim, fontFamily: FONT_DISPLAY }}
          >
            {athlete.team}
          </div>

          {/* Price + CTA */}
          <div
            className="pt-4 flex items-end justify-between border-t"
            style={{ borderColor: tokens.border }}
          >
            <div>
              <div
                className="text-[10px] uppercase tracking-[0.18em] mb-0.5"
                style={{ color: tokens.textDim, fontFamily: FONT_MONO }}
              >
                Current
              </div>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 22,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  color: tokens.text,
                }}
              >
                ${athlete.initialPrice.toFixed(2)}
              </div>
            </div>
            <div
              className="opacity-50 group-hover:opacity-100 transition-opacity"
              style={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                color: tokens.accent,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Trade →
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function RadialBackgrounds() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <div
        className="absolute -top-32 -left-32 h-[40rem] w-[40rem] rounded-full opacity-40"
        style={{
          background: `radial-gradient(circle, ${tokens.accent}33 0%, transparent 60%)`,
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute -bottom-40 -right-32 h-[36rem] w-[36rem] rounded-full opacity-30"
        style={{
          background: `radial-gradient(circle, ${tokens.win}33 0%, transparent 60%)`,
          filter: "blur(80px)",
        }}
      />
    </div>
  );
}
