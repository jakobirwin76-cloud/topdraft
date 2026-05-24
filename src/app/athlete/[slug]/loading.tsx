/**
 * Skeleton state for /athlete/[slug] — mirrors the real layout to prevent
 * layout shift when the client component mounts.
 */

const tokens = {
  bg: "#09090B",
  glass: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
};

export default function AthleteLoading() {
  return (
    <div style={{ background: tokens.bg, minHeight: "100vh", color: "#EDEDEF" }}>
      {/* Ticker bar placeholder */}
      <div
        className="border-b"
        style={{ borderColor: tokens.border, background: "rgba(9,9,11,0.7)" }}
      >
        <div className="h-12" />
      </div>

      {/* Athlete picker placeholder */}
      <div
        className="border-b"
        style={{ borderColor: tokens.border }}
      >
        <div className="mx-auto max-w-[1600px] px-6 py-3 flex gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-32 rounded-md skeleton-bar shrink-0" />
          ))}
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-[1600px] px-6 pt-6 pb-12">
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT — hero + chart */}
          <section className="col-span-12 lg:col-span-8 space-y-6">
            {/* Hero skeleton */}
            <div
              className="p-8 lg:p-10 rounded-2xl"
              style={{ background: tokens.glass, border: `1px solid ${tokens.border}` }}
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
                <div className="flex items-center gap-5">
                  <div className="h-20 w-20 rounded-full skeleton-bar" />
                  <div className="flex-1">
                    <div className="h-3 w-32 mb-3 rounded-sm skeleton-bar" />
                    <div className="h-10 w-3/4 mb-2 rounded-md skeleton-bar" />
                    <div className="h-4 w-1/2 rounded-sm skeleton-bar" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-3 w-24 mb-2 ml-auto rounded-sm skeleton-bar" />
                  <div className="h-14 w-44 mb-2 ml-auto rounded-md skeleton-bar" />
                  <div className="h-3 w-32 ml-auto rounded-sm skeleton-bar" />
                </div>
              </div>
            </div>

            {/* Chart skeleton */}
            <div
              className="p-6 lg:p-8 rounded-2xl"
              style={{ background: tokens.glass, border: `1px solid ${tokens.border}` }}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="h-3 w-24 mb-2 rounded-sm skeleton-bar" />
                  <div className="h-5 w-32 rounded-sm skeleton-bar" />
                </div>
                <div className="flex gap-1">
                  {[60, 50, 50, 70].map((w, i) => (
                    <div key={i} className="h-8 rounded-md skeleton-bar" style={{ width: w }} />
                  ))}
                </div>
              </div>
              <div className="h-[280px] rounded-md skeleton-bar" />
            </div>
          </section>

          {/* RIGHT — trade + position + feed */}
          <aside className="col-span-12 lg:col-span-4 space-y-6">
            <div
              className="p-6 rounded-2xl"
              style={{ background: tokens.glass, border: `1px solid ${tokens.border}` }}
            >
              <div className="h-3 w-24 mb-4 rounded-sm skeleton-bar" />
              <div className="h-12 mb-3 rounded-md skeleton-bar" />
              <div className="flex gap-1.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-7 flex-1 rounded-md skeleton-bar" />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="h-14 rounded-lg skeleton-bar" />
                <div className="h-14 rounded-lg skeleton-bar" />
              </div>
            </div>

            <div
              className="p-6 rounded-2xl"
              style={{ background: tokens.glass, border: `1px solid ${tokens.border}` }}
            >
              <div className="h-3 w-32 mb-4 rounded-sm skeleton-bar" />
              <div className="h-10 w-24 mb-5 rounded-sm skeleton-bar" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="h-3 w-16 mb-1 rounded-sm skeleton-bar" />
                  <div className="h-5 w-20 rounded-sm skeleton-bar" />
                </div>
                <div>
                  <div className="h-3 w-16 mb-1 rounded-sm skeleton-bar" />
                  <div className="h-5 w-20 rounded-sm skeleton-bar" />
                </div>
              </div>
            </div>

            <div
              className="p-5 rounded-2xl"
              style={{ background: tokens.glass, border: `1px solid ${tokens.border}` }}
            >
              <div className="h-3 w-24 mb-4 rounded-sm skeleton-bar" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 mb-2 rounded-md skeleton-bar" />
              ))}
            </div>
          </aside>
        </div>
      </main>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton-bar {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.04) 0%,
            rgba(255, 255, 255, 0.08) 50%,
            rgba(255, 255, 255, 0.04) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.4s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .skeleton-bar { animation: none; }
        }
      `}</style>
    </div>
  );
}
