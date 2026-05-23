// Skeleton shown by Next.js Suspense while the page JS loads.
// Dark shimmer only — never a white flash.

const MESSI  = "#3B82F6";
const CR7    = "#EF4444";

function Bone({
  w = "100%",
  h = 16,
  radius = 6,
  style = {},
}: {
  w?: number | string;
  h?: number | string;
  radius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="skel-bone"
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        background: "rgba(255,255,255,0.06)",
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

function StatCardSkel({ color }: { color: string }) {
  return (
    <div style={{
      background: "var(--color-surface,#131318)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10, padding: "14px 18px", flex: 1, minWidth: 80,
    }}>
      <Bone w={48} h={9} style={{ marginBottom: 8 }} />
      <Bone w={56} h={22} radius={4} style={{ background: `rgba(${color === MESSI ? "59,130,246" : "239,68,68"},0.15)` }} />
    </div>
  );
}

export default function MessiVsRonaldoLoading() {
  return (
    <main style={{ minHeight: "100vh", padding: "48px 24px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Shimmer keyframe */}
      <style>{`
        @keyframes skel-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .skel-bone {
          background-image: linear-gradient(
            90deg,
            rgba(255,255,255,0.00) 0%,
            rgba(255,255,255,0.06) 40%,
            rgba(255,255,255,0.00) 100%
          );
          background-size: 400px 100%;
          animation: skel-shimmer 1.6s ease-in-out infinite;
        }
      `}</style>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <Bone w={220} h={11} style={{ marginBottom: 14 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
          <Bone w={160} h={56} radius={6} style={{ background: `rgba(59,130,246,0.12)` }} />
          <Bone w={48}  h={28} radius={4} style={{ background: "rgba(255,255,255,0.04)" }} />
          <Bone w={200} h={56} radius={6} style={{ background: `rgba(239,68,68,0.12)` }} />
        </div>
        <Bone w={380} h={13} style={{ marginBottom: 4 }} />
      </div>

      {/* ── Edge banner ───────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
        {[MESSI, CR7].map((c) => (
          <div key={c} style={{
            background: `rgba(${c === MESSI ? "59,130,246" : "239,68,68"},0.06)`,
            border: `1px solid rgba(${c === MESSI ? "59,130,246" : "239,68,68"},0.18)`,
            borderRadius: 10, padding: "14px 16px",
          }}>
            <Bone w={80} h={9} style={{ marginBottom: 10 }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[90, 70, 110, 80, 100].map((w, i) => <Bone key={i} w={w} h={22} radius={4} />)}
            </div>
          </div>
        ))}
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 40 }}>
        {[MESSI, CR7].map((c) => (
          <div key={c}>
            <Bone w={120} h={11} style={{ marginBottom: 14 }} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[0, 1, 2, 3, 4].map((i) => <StatCardSkel key={i} color={c} />)}
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab strip ─────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", gap: 4, background: "var(--color-surface,#131318)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 4,
        width: "fit-content", marginBottom: 24,
      }}>
        {[90, 70, 100, 80].map((w, i) => <Bone key={i} w={w} h={34} radius={7} />)}
      </div>

      {/* ── Chart area ────────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--color-surface,#131318)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12, padding: 24, marginBottom: 40,
      }}>
        {/* Legend */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <Bone w={180} h={12} />
          <div style={{ display: "flex", gap: 16 }}>
            <Bone w={60} h={12} />
            <Bone w={44} h={12} />
          </div>
        </div>
        {/* Y-axis labels */}
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", paddingBottom: 24 }}>
            {[0, 1, 2, 3, 4].map((i) => <Bone key={i} w={36} h={10} />)}
          </div>
          {/* Chart body — simulated jagged lines */}
          <div style={{ flex: 1, height: 260, position: "relative", overflow: "hidden", borderRadius: 6 }}>
            <Bone w="100%" h="100%" radius={6} style={{ position: "absolute", inset: 0 }} />
            {/* Fake Messi line */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="none">
              <polyline
                points="0,220 60,180 120,145 180,110 240,80 300,55 360,78 420,100 480,130 540,160 600,185"
                fill="none" stroke={`rgba(59,130,246,0.25)`} strokeWidth="2"
              />
              <polyline
                points="0,230 60,200 120,175 180,148 240,120 300,90 360,105 420,130 480,155 540,185 600,210"
                fill="none" stroke={`rgba(239,68,68,0.20)`} strokeWidth="2"
              />
            </svg>
          </div>
        </div>
        {/* X-axis */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingLeft: 52 }}>
          {Array.from({ length: 8 }, (_, i) => <Bone key={i} w={26} h={9} />)}
        </div>
      </div>

      {/* ── Awards timeline header ────────────────────────────────────────── */}
      <div style={{
        background: "var(--color-surface,#131318)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12, padding: 24,
      }}>
        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          <Bone w={160} h={12} />
          {[50, 56, 62, 58, 64].map((w, i) => <Bone key={i} w={w} h={12} />)}
        </div>
        {/* Row header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 10, marginBottom: 8 }}>
          <Bone w={50} h={10} />
          <Bone w={24} h={10} />
          <Bone w={80} h={10} />
        </div>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              {i % 3 === 0 && <Bone w={56} h={22} radius={4} style={{ background: "rgba(59,130,246,0.10)" }} />}
              {i % 2 === 0 && <Bone w={64} h={22} radius={4} style={{ background: "rgba(59,130,246,0.10)" }} />}
            </div>
            <Bone w={32} h={12} />
            <div style={{ display: "flex", gap: 6 }}>
              {i % 2 === 1 && <Bone w={56} h={22} radius={4} style={{ background: "rgba(239,68,68,0.10)" }} />}
              {i % 3 === 2 && <Bone w={64} h={22} radius={4} style={{ background: "rgba(239,68,68,0.10)" }} />}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
