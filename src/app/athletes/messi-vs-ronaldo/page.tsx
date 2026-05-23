"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  messiCareer,
  ronaldoCareer,
  mergeForChart,
  mergeForCompChart,
  uclTotals,
  type Award,
  type AwardType,
  type BigMatch,
} from "@/lib/mocks/career-data";

// ── Constants ─────────────────────────────────────────────────────────────────

const MESSI_COLOR  = "#3B82F6";   // blue
const CR7_COLOR    = "#EF4444";   // red
const LEAGUE_ALPHA = 1.0;
const UCL_ALPHA    = 0.70;
const CUPS_ALPHA   = 0.38;

type Metric = "goals" | "assists" | "price" | "comp";
const METRICS: { key: Metric; label: string }[] = [
  { key: "goals",   label: "Goals"       },
  { key: "assists", label: "Assists"     },
  { key: "price",   label: "Share Price" },
  { key: "comp",    label: "By League"   },
];

const AWARD_COLORS: Record<AwardType, string> = {
  ballon_dor:  "#F59E0B",
  golden_boot: "#F97316",
  ucl_title:   "#22C55E",
  tournament:  "#14B8A6",
  top_scorer:  "#A855F7",
};

const AWARD_SHORT: Record<AwardType, string> = {
  ballon_dor:  "BD'OR",
  golden_boot: "BOOT",
  ucl_title:   "UCL W",
  tournament:  "INT'L W",
  top_scorer:  "TOP SC",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function hexAlpha(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Tooltips ──────────────────────────────────────────────────────────────────

function LineTooltip({
  active, payload, label, metric,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  metric: Metric;
}) {
  if (!active || !payload?.length) return null;
  const fmt = (v: number) => metric === "price" ? `$${v.toFixed(4)}` : String(v);
  return (
    <div style={{
      background: "var(--color-surface-2, #1B1B22)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 8, padding: "10px 14px",
      fontFamily: "var(--font-data,'JetBrains Mono',monospace)",
      fontSize: 12, minWidth: 150,
    }}>
      <p style={{ color: "var(--color-text-mute,#A1A1AA)", marginBottom: 6 }}>{label}</p>
      {payload.map((e) => (
        <p key={e.name} style={{ color: e.color, margin: "2px 0" }}>
          {e.name.toUpperCase()}&nbsp;&nbsp;<span style={{ color: "#fff" }}>{fmt(e.value)}</span>
        </p>
      ))}
    </div>
  );
}

function BarTooltip({
  active, payload, label, playerColor,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
  playerColor: string;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((a, p) => a + (p.value ?? 0), 0);
  const names: Record<string, string> = { league: "League", ucl: "UCL", cups: "Cups" };
  return (
    <div style={{
      background: "var(--color-surface-2,#1B1B22)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 8, padding: "10px 14px",
      fontFamily: "var(--font-data,'JetBrains Mono',monospace)",
      fontSize: 12, minWidth: 130,
    }}>
      <p style={{ color: "var(--color-text-mute,#A1A1AA)", marginBottom: 6 }}>{label}</p>
      {[...payload].reverse().map((e) => e.value > 0 && (
        <p key={e.name} style={{ color: playerColor, margin: "2px 0" }}>
          {names[e.name] ?? e.name}&nbsp;&nbsp;<span style={{ color: "#fff" }}>{e.value}</span>
        </p>
      ))}
      <p style={{ color: "#fff", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 6, paddingTop: 6 }}>
        Total&nbsp;&nbsp;{total}
      </p>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{
      background: "var(--color-surface,#131318)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10, padding: "14px 18px", flex: 1, minWidth: 80,
    }}>
      <p style={{ color: "var(--color-text-dim,#52525B)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontFamily: "var(--font-mono,Inter)" }}>
        {label}
      </p>
      <p style={{ color, fontSize: 20, fontFamily: "var(--font-data,'JetBrains Mono',monospace)", fontWeight: 600, letterSpacing: "-0.02em" }}>
        {value}
      </p>
    </div>
  );
}

function AwardChip({ award }: { award: Award }) {
  const color = AWARD_COLORS[award.type];
  return (
    <div title={award.detail} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: hexAlpha(color, 0.12),
      border: `1px solid ${hexAlpha(color, 0.35)}`,
      borderRadius: 6, padding: "3px 8px", cursor: "default",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ fontFamily: "var(--font-data,'JetBrains Mono',monospace)", fontSize: 10, color, letterSpacing: "0.06em" }}>
        {AWARD_SHORT[award.type]}
      </span>
    </div>
  );
}

function EdgeBadge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontFamily: "var(--font-data,'JetBrains Mono',monospace)",
      fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase",
      color, background: hexAlpha(color, 0.10),
      border: `1px solid ${hexAlpha(color, 0.28)}`,
      borderRadius: 4, padding: "2px 6px",
    }}>
      {label}
    </span>
  );
}

// ── Skeleton helpers ──────────────────────────────────────────────────────────

function SkelBone({ w = "100%", h = 14, r = 6, style = {} }: { w?: number | string; h?: number | string; r?: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r, flexShrink: 0,
      background: "linear-gradient(90deg,rgba(255,255,255,0.00) 0%,rgba(255,255,255,0.06) 40%,rgba(255,255,255,0.00) 100%)",
      backgroundSize: "400px 100%",
      animation: "skel-shimmer 1.6s ease-in-out infinite",
      ...style,
    }} />
  );
}

function ChartSkeleton() {
  return (
    <>
      <style>{`@keyframes skel-shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
      <div style={{ background: "var(--color-surface,#131318)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "32px 16px 24px", marginBottom: 40 }}>
        {/* Legend row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingInline: 16, marginBottom: 24 }}>
          <SkelBone w={160} h={11} />
          <div style={{ display: "flex", gap: 16 }}>
            <SkelBone w={52} h={11} />
            <SkelBone w={40} h={11} />
          </div>
        </div>
        {/* Chart body */}
        <div style={{ display: "flex", gap: 12, height: 360 }}>
          {/* Y axis */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", paddingBottom: 24, width: 40 }}>
            {[0,1,2,3,4,5].map((i) => <SkelBone key={i} w={36} h={10} />)}
          </div>
          {/* Plot area */}
          <div style={{ flex: 1, position: "relative", borderRadius: 6, overflow: "hidden" }}>
            <SkelBone w="100%" h="100%" r={6} style={{ position: "absolute", inset: 0 }} />
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="none">
              <polyline points="0,320 60,260 120,200 180,150 240,100 300,70 360,95 420,130 480,175 540,220 600,270"
                fill="none" stroke="rgba(59,130,246,0.25)" strokeWidth="2.5" />
              <polyline points="0,330 60,285 120,240 180,195 240,155 300,110 360,75 420,110 480,155 540,210 600,270"
                fill="none" stroke="rgba(239,68,68,0.20)" strokeWidth="2.5" />
            </svg>
          </div>
        </div>
        {/* X axis */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingLeft: 52 }}>
          {Array.from({ length: 9 }).map((_, i) => <SkelBone key={i} w={24} h={9} />)}
        </div>
        {/* Caption */}
        <SkelBone w={300} h={10} style={{ margin: "16px auto 0" }} />
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MessiVsRonaldo() {
  const [metric, setMetric] = useState<Metric>("goals");
  const [compPlayer, setCompPlayer] = useState<"messi" | "ronaldo">("messi");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const lineData = metric !== "comp" ? mergeForChart(metric) : [];
  const compData = mergeForCompChart(compPlayer);
  const totals   = uclTotals();

  const messiTotal  = (k: "goals" | "assists") => messiCareer.seasons.reduce((a, s) => a + s[k], 0);
  const cr7Total    = (k: "goals" | "assists") => ronaldoCareer.seasons.reduce((a, s) => a + s[k], 0);

  const yLabel = metric === "price" ? "Share Price (USD)" : metric === "goals" ? "Goals" : "Assists";
  const tickFmt = (v: number) => metric === "price" ? `$${v.toFixed(2)}` : String(v);

  // Build awards timeline years
  const allYears = Array.from(new Set([
    ...messiCareer.awards.map((a) => a.year),
    ...ronaldoCareer.awards.map((a) => a.year),
  ])).sort((a, b) => a - b);

  const messiByYear  = new Map<number, Award[]>();
  const cr7ByYear    = new Map<number, Award[]>();
  messiCareer.awards.forEach((a) => { const arr = messiByYear.get(a.year) ?? []; arr.push(a); messiByYear.set(a.year, arr); });
  ronaldoCareer.awards.forEach((a) => { const arr = cr7ByYear.get(a.year) ?? []; arr.push(a); cr7ByYear.set(a.year, arr); });

  const playerColor = compPlayer === "messi" ? MESSI_COLOR : CR7_COLOR;
  const compPlayer2 = compPlayer === "messi" ? ronaldoCareer : messiCareer;
  const compPlayerData = compPlayer === "messi" ? messiCareer : ronaldoCareer;

  return (
    <main style={{ minHeight: "100vh", padding: "48px 24px", maxWidth: 1100, margin: "0 auto" }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontFamily: "var(--font-data,'JetBrains Mono',monospace)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-dim,#52525B)", marginBottom: 10 }}>
          TOPDRAFT / ATHLETE COMPARE
        </p>
        <h1 style={{ fontFamily: "var(--font-display,'Bowlby One',sans-serif)", fontSize: "clamp(40px,7vw,80px)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 8 }}>
          <span style={{ color: MESSI_COLOR }}>MESSI</span>
          <span style={{ color: "var(--color-text-dim,#52525B)" }}> vs </span>
          <span style={{ color: CR7_COLOR }}>RONALDO</span>
        </h1>
        <p style={{ color: "var(--color-text-mute,#A1A1AA)", fontSize: 14, fontFamily: "var(--font-mono,Inter)" }}>
          Full career · 2002–2026 · Simulated Topdraft share prices via AMM engine
        </p>
      </div>

      {/* ── "Who Wins" edge banner ───────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
        {/* Messi edges */}
        <div style={{ background: hexAlpha(MESSI_COLOR, 0.06), border: `1px solid ${hexAlpha(MESSI_COLOR, 0.20)}`, borderRadius: 10, padding: "14px 16px" }}>
          <p style={{ fontFamily: "var(--font-data,'JetBrains Mono',monospace)", fontSize: 10, letterSpacing: "0.10em", color: MESSI_COLOR, marginBottom: 8 }}>MESSI LEADS</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <EdgeBadge label="Ballon d'Or ×8" color={MESSI_COLOR} />
            <EdgeBadge label="Assists 365" color={MESSI_COLOR} />
            <EdgeBadge label="World Cup 2022" color={MESSI_COLOR} />
            <EdgeBadge label="Copa America ×2" color={MESSI_COLOR} />
            <EdgeBadge label="Peak season 73G" color={MESSI_COLOR} />
          </div>
        </div>
        {/* CR7 edges */}
        <div style={{ background: hexAlpha(CR7_COLOR, 0.06), border: `1px solid ${hexAlpha(CR7_COLOR, 0.20)}`, borderRadius: 10, padding: "14px 16px" }}>
          <p style={{ fontFamily: "var(--font-data,'JetBrains Mono',monospace)", fontSize: 10, letterSpacing: "0.10em", color: CR7_COLOR, marginBottom: 8 }}>CR7 LEADS</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <EdgeBadge label="Career Goals 827" color={CR7_COLOR} />
            <EdgeBadge label="UCL Goals 142" color={CR7_COLOR} />
            <EdgeBadge label="UCL Titles ×5" color={CR7_COLOR} />
            <EdgeBadge label="Euro 2016" color={CR7_COLOR} />
            <EdgeBadge label="900 Career Goals" color={CR7_COLOR} />
          </div>
        </div>
      </div>

      {/* ── Summary stat cards ───────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 40 }}>
        <div>
          <p style={{ fontFamily: "var(--font-data,'JetBrains Mono',monospace)", fontSize: 11, letterSpacing: "0.10em", color: MESSI_COLOR, marginBottom: 10, textTransform: "uppercase" }}>
            {messiCareer.name}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <StatCard label="Goals"      value={messiTotal("goals")}            color={MESSI_COLOR} />
            <StatCard label="Assists"    value={messiTotal("assists")}           color={MESSI_COLOR} />
            <StatCard label="UCL Goals"  value={totals.messi}                   color={MESSI_COLOR} />
            <StatCard label="Ballon d'Or" value={messiCareer.ballonerDors}      color="#F59E0B" />
            <StatCard label="UCL Titles" value={messiCareer.uclTitles}          color="#22C55E" />
          </div>
        </div>
        <div>
          <p style={{ fontFamily: "var(--font-data,'JetBrains Mono',monospace)", fontSize: 11, letterSpacing: "0.10em", color: CR7_COLOR, marginBottom: 10, textTransform: "uppercase" }}>
            {ronaldoCareer.name}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <StatCard label="Goals"      value={cr7Total("goals")}              color={CR7_COLOR} />
            <StatCard label="Assists"    value={cr7Total("assists")}            color={CR7_COLOR} />
            <StatCard label="UCL Goals"  value={totals.ronaldo}                 color={CR7_COLOR} />
            <StatCard label="Ballon d'Or" value={ronaldoCareer.ballonerDors}   color="#F59E0B" />
            <StatCard label="UCL Titles" value={ronaldoCareer.uclTitles}        color="#22C55E" />
          </div>
        </div>
      </div>

      {/* ── Tab strip ────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 4, background: "var(--color-surface,#131318)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 4, width: "fit-content", marginBottom: 24 }}>
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            style={{
              padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer",
              fontFamily: "var(--font-mono,Inter)", fontSize: 13, fontWeight: 500,
              letterSpacing: "-0.01em", transition: "all 150ms ease",
              background: metric === m.key ? "var(--color-accent,#6366F1)" : "transparent",
              color: metric === m.key ? "#fff" : "var(--color-text-mute,#A1A1AA)",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Chart card ───────────────────────────────────────────────────────── */}
      {!mounted ? (
        <ChartSkeleton />
      ) : null}
      <div style={{ background: "var(--color-surface,#131318)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "32px 16px 24px", marginBottom: 40, display: mounted ? undefined : "none" }}>

        {metric !== "comp" ? (
          /* Line chart — Goals / Assists / Share Price */
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingInline: 16, marginBottom: 24 }}>
              <p style={{ fontFamily: "var(--font-data,'JetBrains Mono',monospace)", fontSize: 11, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--color-text-dim,#52525B)" }}>
                {yLabel} by Season
              </p>
              <div style={{ display: "flex", gap: 16 }}>
                {[{ name: "MESSI", color: MESSI_COLOR }, { name: "CR7", color: CR7_COLOR }].map((l) => (
                  <span key={l.name} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-data,'JetBrains Mono',monospace)", fontSize: 11, color: "var(--color-text-mute,#A1A1AA)" }}>
                    <span style={{ width: 20, height: 2, borderRadius: 2, background: l.color, display: "inline-block" }} />
                    {l.name}
                  </span>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={lineData} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="season" tick={{ fill: "var(--color-text-dim,#52525B)", fontSize: 10, fontFamily: "JetBrains Mono,monospace" }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} interval={1} />
                <YAxis tickFormatter={tickFmt} tick={{ fill: "var(--color-text-dim,#52525B)", fontSize: 10, fontFamily: "JetBrains Mono,monospace" }} axisLine={false} tickLine={false} width={metric === "price" ? 64 : 36} />
                <Tooltip content={<LineTooltip metric={metric} />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
                {metric === "goals" && (
                  <ReferenceLine x="11/12"
                    stroke={hexAlpha(MESSI_COLOR, 0.45)}
                    strokeDasharray="4 3"
                    label={{ value: "▲ MESSI 73G  WORLD RECORD", position: "insideTopLeft", fill: MESSI_COLOR, fontSize: 9, fontFamily: "JetBrains Mono,monospace", fontWeight: 700 }}
                  />
                )}
                {metric === "goals" && (
                  <ReferenceLine x="14/15"
                    stroke={hexAlpha(CR7_COLOR, 0.35)}
                    strokeDasharray="4 3"
                    label={{ value: "▲ CR7 61G  PEAK", position: "insideTopLeft", fill: CR7_COLOR, fontSize: 9, fontFamily: "JetBrains Mono,monospace" }}
                  />
                )}
                {metric === "assists" && (
                  <ReferenceLine x="11/12"
                    stroke={hexAlpha(MESSI_COLOR, 0.45)}
                    strokeDasharray="4 3"
                    label={{ value: "▲ MESSI 29A  PEAK", position: "insideTopLeft", fill: MESSI_COLOR, fontSize: 9, fontFamily: "JetBrains Mono,monospace", fontWeight: 700 }}
                  />
                )}
                {metric === "assists" && (
                  <ReferenceLine x="11/12"
                    stroke={hexAlpha(CR7_COLOR, 0.25)}
                    strokeDasharray="2 4"
                    label={{ value: "CR7 21A", position: "insideBottomLeft", fill: hexAlpha(CR7_COLOR, 0.7), fontSize: 9, fontFamily: "JetBrains Mono,monospace" }}
                  />
                )}
                {metric === "price" && <ReferenceLine x="21/22" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" label={{ value: "MESSI PSG dip", position: "top", fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "JetBrains Mono,monospace" }} />}
                <Line type={metric === "price" ? "linear" : "monotone"} dataKey="messi"   name="messi" stroke={MESSI_COLOR} strokeWidth={2} dot={metric === "price" ? { r: 2.5, fill: MESSI_COLOR, strokeWidth: 0 } : false} activeDot={{ r: 4, fill: MESSI_COLOR,  stroke: "#0A0A0C", strokeWidth: 2 }} connectNulls />
                <Line type={metric === "price" ? "linear" : "monotone"} dataKey="ronaldo" name="cr7"   stroke={CR7_COLOR}   strokeWidth={2} dot={metric === "price" ? { r: 2.5, fill: CR7_COLOR,   strokeWidth: 0 } : false} activeDot={{ r: 4, fill: CR7_COLOR,    stroke: "#0A0A0C", strokeWidth: 2 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
            {metric === "goals" && (
              <p style={{ textAlign: "center", fontFamily: "JetBrains Mono,monospace", fontSize: 10, color: "var(--color-text-dim,#52525B)", marginTop: 12 }}>
                <span style={{ color: MESSI_COLOR }}>MESSI PEAK 73G</span> &nbsp;·&nbsp; <span style={{ color: CR7_COLOR }}>CR7 PEAK 61G</span> &nbsp;·&nbsp; Messi holds the all-time single-season record
              </p>
            )}
            {metric === "assists" && (
              <p style={{ textAlign: "center", fontFamily: "JetBrains Mono,monospace", fontSize: 10, color: "var(--color-text-dim,#52525B)", marginTop: 12 }}>
                <span style={{ color: MESSI_COLOR }}>MESSI PEAK 29A</span> &nbsp;·&nbsp; <span style={{ color: CR7_COLOR }}>CR7 PEAK 21A</span> &nbsp;·&nbsp; Messi leads assists in every era
              </p>
            )}
            {metric === "price" && (
              <p style={{ textAlign: "center", fontFamily: "JetBrains Mono,monospace", fontSize: 10, color: "var(--color-text-dim,#52525B)", marginTop: 12 }}>
                Avg athlete $5–$10 · Messi peak <span style={{ color: MESSI_COLOR }}>$28</span> · CR7 peak <span style={{ color: CR7_COLOR }}>$26</span> · Both careers start at $4.00
              </p>
            )}
          </>
        ) : (
          /* Stacked bar chart — By League */
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingInline: 16, marginBottom: 20 }}>
              <p style={{ fontFamily: "var(--font-data,'JetBrains Mono',monospace)", fontSize: 11, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--color-text-dim,#52525B)" }}>
                Goals by Competition
              </p>
              {/* Player toggle */}
              <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 3 }}>
                {(["messi", "ronaldo"] as const).map((p) => (
                  <button key={p} onClick={() => setCompPlayer(p)} style={{
                    padding: "5px 14px", borderRadius: 5, border: "none", cursor: "pointer",
                    fontFamily: "var(--font-data,'JetBrains Mono',monospace)", fontSize: 11,
                    transition: "all 150ms ease",
                    background: compPlayer === p ? (p === "messi" ? MESSI_COLOR : CR7_COLOR) : "transparent",
                    color: compPlayer === p ? "#fff" : "var(--color-text-mute,#A1A1AA)",
                  }}>
                    {p === "messi" ? "MESSI" : "CR7"}
                  </button>
                ))}
              </div>
            </div>

            {/* UCL callout */}
            <div style={{ display: "flex", gap: 12, paddingInline: 16, marginBottom: 20 }}>
              {[
                { label: "MESSI UCL Goals", value: totals.messi,   color: MESSI_COLOR, note: "" },
                { label: "CR7 UCL Goals",   value: totals.ronaldo, color: CR7_COLOR,   note: "All-time UCL record" },
              ].map((c) => (
                <div key={c.label} style={{ background: hexAlpha(c.color, 0.07), border: `1px solid ${hexAlpha(c.color, 0.20)}`, borderRadius: 8, padding: "10px 16px", flex: 1 }}>
                  <p style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 10, color: c.color, letterSpacing: "0.08em", marginBottom: 4 }}>{c.label}</p>
                  <p style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 24, fontWeight: 700, color: "#fff" }}>{c.value}</p>
                  {c.note && <p style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 9, color: "var(--color-text-dim,#52525B)", marginTop: 2 }}>{c.note}</p>}
                </div>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={compData} margin={{ top: 8, right: 24, left: 8, bottom: 8 }} barSize={compData.length > 18 ? 10 : 14}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="season" tick={{ fill: "var(--color-text-dim,#52525B)", fontSize: 9, fontFamily: "JetBrains Mono,monospace" }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} interval={1} />
                <YAxis tick={{ fill: "var(--color-text-dim,#52525B)", fontSize: 10, fontFamily: "JetBrains Mono,monospace" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<BarTooltip playerColor={playerColor} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="league" stackId="a" name="league" fill={hexAlpha(playerColor, LEAGUE_ALPHA)} radius={[0,0,0,0]}>
                  {compData.map((_, i) => <Cell key={i} fill={hexAlpha(playerColor, LEAGUE_ALPHA)} />)}
                </Bar>
                <Bar dataKey="ucl" stackId="a" name="ucl" fill={hexAlpha(playerColor, UCL_ALPHA)}>
                  {compData.map((_, i) => <Cell key={i} fill={hexAlpha(playerColor, UCL_ALPHA)} />)}
                </Bar>
                <Bar dataKey="cups" stackId="a" name="cups" fill={hexAlpha(playerColor, CUPS_ALPHA)} radius={[2,2,0,0]}>
                  {compData.map((_, i) => <Cell key={i} fill={hexAlpha(playerColor, CUPS_ALPHA)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 12 }}>
              {[
                { label: "League", alpha: LEAGUE_ALPHA },
                { label: "UCL",    alpha: UCL_ALPHA },
                { label: "Cups",   alpha: CUPS_ALPHA },
              ].map((l) => (
                <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "JetBrains Mono,monospace", fontSize: 10, color: "var(--color-text-mute,#A1A1AA)" }}>
                  <span style={{ width: 12, height: 8, borderRadius: 2, background: hexAlpha(playerColor, l.alpha), display: "inline-block" }} />
                  {l.label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Awards Timeline ───────────────────────────────────────────────────── */}
      <div style={{ background: "var(--color-surface,#131318)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden", marginBottom: 32 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontFamily: "var(--font-data,'JetBrains Mono',monospace)", fontSize: 11, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--color-text-dim,#52525B)" }}>
            Awards Timeline
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            {Object.entries(AWARD_COLORS).map(([k, c]) => (
              <span key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "JetBrains Mono,monospace", fontSize: 9, color: "var(--color-text-dim,#52525B)" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, display: "inline-block" }} />
                {AWARD_SHORT[k as AwardType]}
              </span>
            ))}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr>
                {["MESSI", "YR", "CRISTIANO"].map((h, i) => (
                  <th key={h} style={{
                    padding: "8px 16px", textAlign: i === 0 ? "right" : i === 1 ? "center" : "left",
                    fontFamily: "JetBrains Mono,monospace", fontSize: 10, letterSpacing: "0.08em",
                    color: i === 0 ? MESSI_COLOR : i === 2 ? CR7_COLOR : "var(--color-text-dim,#52525B)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 400,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allYears.map((year) => {
                const ma = messiByYear.get(year) ?? [];
                const ca = cr7ByYear.get(year) ?? [];
                return (
                  <tr key={year} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "10px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 5, justifyContent: "flex-end", flexWrap: "wrap" }}>
                        {ma.map((a, i) => <AwardChip key={i} award={a} />)}
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "center", fontFamily: "JetBrains Mono,monospace", fontSize: 11, color: "var(--color-text-dim,#52525B)", whiteSpace: "nowrap" }}>
                      {year}
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {ca.map((a, i) => <AwardChip key={i} award={a} />)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Big Matches ───────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        {[
          { player: messiCareer,   color: MESSI_COLOR },
          { player: ronaldoCareer, color: CR7_COLOR   },
        ].map(({ player, color }) => (
          <div key={player.id} style={{ background: "var(--color-surface,#131318)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color }}>
                {player.shortName} — Big Matches
              </p>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Event", "Yr", "Opp", "G", "A", "Res"].map((h, i) => (
                    <th key={h} style={{
                      padding: "8px 10px", textAlign: i <= 2 ? "left" : "center",
                      fontFamily: "JetBrains Mono,monospace", fontSize: 9, letterSpacing: "0.07em",
                      textTransform: "uppercase", color: "var(--color-text-dim,#52525B)",
                      borderBottom: "1px solid rgba(255,255,255,0.05)", fontWeight: 400,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {player.bigMatches.map((m: BigMatch, i) => (
                  <tr key={i} title={m.note ?? ""} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "8px 10px", fontFamily: "JetBrains Mono,monospace", fontSize: 10, color: "var(--color-text-mute,#A1A1AA)", maxWidth: 130 }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.event}</span>
                      {m.note && <span style={{ display: "block", fontSize: 9, color: "var(--color-text-dim,#52525B)" }}>{m.note}</span>}
                    </td>
                    <td style={{ padding: "8px 10px", fontFamily: "JetBrains Mono,monospace", fontSize: 10, color: "var(--color-text-dim,#52525B)" }}>{m.year}</td>
                    <td style={{ padding: "8px 10px", fontFamily: "JetBrains Mono,monospace", fontSize: 10, color: "var(--color-text-mute,#A1A1AA)", whiteSpace: "nowrap" }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 80 }}>{m.opponent}</span>
                    </td>
                    <td style={{ padding: "8px 10px", textAlign: "center", fontFamily: "JetBrains Mono,monospace", fontSize: 11, fontWeight: m.goals > 0 ? 700 : 400, color: m.goals > 0 ? color : "var(--color-text-dim,#52525B)" }}>
                      {m.goals}
                    </td>
                    <td style={{ padding: "8px 10px", textAlign: "center", fontFamily: "JetBrains Mono,monospace", fontSize: 11, color: m.assists > 0 ? "var(--color-text-mute,#A1A1AA)" : "var(--color-text-dim,#52525B)" }}>
                      {m.assists}
                    </td>
                    <td style={{ padding: "8px 10px", textAlign: "center" }}>
                      <span style={{
                        fontFamily: "JetBrains Mono,monospace", fontSize: 9, letterSpacing: "0.05em",
                        padding: "2px 7px", borderRadius: 4,
                        background: m.result === "W" ? "rgba(34,197,94,0.12)" : m.result === "L" ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.06)",
                        color: m.result === "W" ? "#22C55E" : m.result === "L" ? "#EF4444" : "var(--color-text-mute)",
                        border: `1px solid ${m.result === "W" ? "rgba(34,197,94,0.3)" : m.result === "L" ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.08)"}`,
                      }}>
                        {m.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* ── Season Log ────────────────────────────────────────────────────────── */}
      <div style={{ background: "var(--color-surface,#131318)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontFamily: "var(--font-data,'JetBrains Mono',monospace)", fontSize: 11, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--color-text-dim,#52525B)" }}>
            Season Log
          </p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Season","M · Club","G","A","Apps","—","CR7 · Club","G","A","Apps"].map((h, i) => (
                  <th key={i} style={{ padding: "10px 14px", textAlign: i === 0 ? "left" : "right", fontFamily: "JetBrains Mono,monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-dim,#52525B)", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 400 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mergeForChart("goals").map(({ season }) => {
                const m = messiCareer.seasons.find((s) => s.season === season);
                const r = ronaldoCareer.seasons.find((s) => s.season === season);
                // highlight the season where CR7 beats Messi on goals
                const cr7Wins = m && r && r.goals > m.goals;
                return (
                  <tr key={season} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: cr7Wins ? hexAlpha(CR7_COLOR, 0.03) : "transparent" }}>
                    <td style={{ padding: "9px 14px", fontFamily: "JetBrains Mono,monospace", fontSize: 12, color: "var(--color-text-mute,#A1A1AA)" }}>{season}</td>
                    <td style={{ padding: "9px 14px", textAlign: "right", fontFamily: "JetBrains Mono,monospace", fontSize: 11, color: m ? MESSI_COLOR : "var(--color-text-dim,#52525B)" }}>{m?.club ?? "—"}</td>
                    <td style={{ padding: "9px 14px", textAlign: "right", fontFamily: "JetBrains Mono,monospace", fontSize: 12, color: m ? "#fff" : "var(--color-text-dim)", fontWeight: m && m.goals >= 50 ? 700 : 400 }}>{m?.goals ?? "—"}</td>
                    <td style={{ padding: "9px 14px", textAlign: "right", fontFamily: "JetBrains Mono,monospace", fontSize: 12, color: "var(--color-text-mute,#A1A1AA)" }}>{m?.assists ?? "—"}</td>
                    <td style={{ padding: "9px 14px", textAlign: "right", fontFamily: "JetBrains Mono,monospace", fontSize: 12, color: "var(--color-text-dim,#52525B)" }}>{m?.apps ?? "—"}</td>
                    <td style={{ padding: "9px 14px", textAlign: "center", color: "rgba(255,255,255,0.08)", fontSize: 12 }}>│</td>
                    <td style={{ padding: "9px 14px", textAlign: "right", fontFamily: "JetBrains Mono,monospace", fontSize: 11, color: r ? CR7_COLOR : "var(--color-text-dim,#52525B)" }}>{r?.club ?? "—"}</td>
                    <td style={{ padding: "9px 14px", textAlign: "right", fontFamily: "JetBrains Mono,monospace", fontSize: 12, color: r ? "#fff" : "var(--color-text-dim)", fontWeight: r && r.goals >= 50 ? 700 : 400 }}>
                      {r ? (
                        <span style={{ color: cr7Wins ? CR7_COLOR : "#fff", fontWeight: cr7Wins ? 700 : (r.goals >= 50 ? 700 : 400) }}>{r.goals}</span>
                      ) : "—"}
                    </td>
                    <td style={{ padding: "9px 14px", textAlign: "right", fontFamily: "JetBrains Mono,monospace", fontSize: 12, color: "var(--color-text-mute,#A1A1AA)" }}>{r?.assists ?? "—"}</td>
                    <td style={{ padding: "9px 14px", textAlign: "right", fontFamily: "JetBrains Mono,monospace", fontSize: 12, color: "var(--color-text-dim,#52525B)" }}>{r?.apps ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ marginTop: 24, fontFamily: "JetBrains Mono,monospace", fontSize: 10, letterSpacing: "0.06em", color: "var(--color-text-dim,#52525B)", textAlign: "center" }}>
        Share prices simulated via Topdraft AMM engine · Base $10.00 · Not financial advice
      </p>
    </main>
  );
}
