/**
 * Skeleton state for /app — shows 8 placeholder cards while React mounts.
 * Same shape as a real AthleteCard so there's no layout shift on resolve.
 */

const tokens = {
  bg: "#09090B",
  glass: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
};

const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

export default function AppHomeLoading() {
  return (
    <div
      style={{ background: tokens.bg, minHeight: "100vh", color: "#EDEDEF" }}
      className="relative overflow-x-hidden"
    >
      <div className="relative z-10 mx-auto max-w-[1400px] px-5 md:px-8 pt-10 md:pt-16 pb-20">
        {/* Header skeleton */}
        <div className="mb-10 md:mb-14">
          <div className="h-3 w-40 mb-4 rounded-sm skeleton-bar" />
          <div className="h-12 md:h-16 w-3/4 mb-3 rounded-md skeleton-bar" />
          <div className="h-12 md:h-16 w-1/2 mb-5 rounded-md skeleton-bar" />
          <div className="h-4 w-2/3 max-w-md rounded-sm skeleton-bar" />
        </div>

        {/* Filter pills skeleton */}
        <div className="mb-6 flex gap-2">
          {[60, 60, 60, 80].map((w, i) => (
            <div
              key={i}
              className="h-9 rounded-md skeleton-bar"
              style={{ width: w }}
            />
          ))}
        </div>

        {/* Card grid skeleton — 8 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} delay={i * 60} />
          ))}
        </div>
      </div>

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

  function SkeletonCard({ delay }: { delay: number }) {
    return (
      <div
        className="p-5 rounded-2xl h-[200px]"
        style={{
          background: tokens.glass,
          border: `1px solid ${tokens.border}`,
          animationDelay: `${delay}ms`,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 rounded-full skeleton-bar" />
          <div className="h-5 w-20 rounded-md skeleton-bar" />
        </div>
        <div className="h-5 w-3/4 mb-2 rounded-sm skeleton-bar" />
        <div className="h-3 w-1/2 mb-6 rounded-sm skeleton-bar" />
        <div
          className="pt-4 flex items-end justify-between"
          style={{ borderTop: `1px solid ${tokens.border}` }}
        >
          <div>
            <div className="h-2 w-12 mb-1.5 rounded-sm skeleton-bar" />
            <div className="h-6 w-20 rounded-sm skeleton-bar" />
          </div>
          <div
            className="h-3 w-12 rounded-sm skeleton-bar"
            style={{ fontFamily: FONT_MONO }}
          />
        </div>
      </div>
    );
  }
}
