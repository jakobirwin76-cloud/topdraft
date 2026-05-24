/**
 * Athlete catalog + synthetic history generator.
 *
 * Currently static TypeScript — swap for Supabase queries later without
 * changing call sites. The Athlete shape mirrors the columns we'll need
 * in the `athletes` table.
 */

export type Sport = "NFL" | "NBA" | "SOCCER";

export interface Athlete {
  slug: string;
  sport: Sport;
  league: string;
  position: string;
  /** Position-specific event impact multiplier. NFL QB=0.55, WR=1.0, NBA=1.0, etc. */
  positionWeight: number;
  /** League quality modifier — Premier League/UCL=1.0+, MLS=0.7, friendly=0.3. */
  competitionModifier: number;
  name: string;
  initials: string;
  team: string;
  teamCode: string;
  basePrice: number;
  initialPrice: number;
}

export const ATHLETES: Record<string, Athlete> = {
  mahomes: {
    slug: "mahomes",
    sport: "NFL", league: "NFL",
    position: "QB", positionWeight: 0.55, competitionModifier: 1.0,
    name: "Patrick Mahomes", initials: "PM",
    team: "Kansas City Chiefs", teamCode: "KC",
    basePrice: 14, initialPrice: 20.1,
  },
  allen: {
    slug: "allen",
    sport: "NFL", league: "NFL",
    position: "QB", positionWeight: 0.55, competitionModifier: 1.0,
    name: "Josh Allen", initials: "JA",
    team: "Buffalo Bills", teamCode: "BUF",
    basePrice: 12, initialPrice: 14.5,
  },
  haaland: {
    slug: "haaland",
    sport: "SOCCER", league: "Premier League",
    position: "ST", positionWeight: 1.0, competitionModifier: 1.0,
    name: "Erling Haaland", initials: "EH",
    team: "Manchester City", teamCode: "MCI",
    basePrice: 18, initialPrice: 22.31,
  },
  messi: {
    slug: "messi",
    sport: "SOCCER", league: "MLS",
    position: "RW", positionWeight: 1.0, competitionModifier: 0.7,
    name: "Lionel Messi", initials: "LM",
    team: "Inter Miami", teamCode: "MIA",
    basePrice: 22, initialPrice: 27.45,
  },
  lebron: {
    slug: "lebron",
    sport: "NBA", league: "NBA",
    position: "SF", positionWeight: 1.0, competitionModifier: 1.0,
    name: "LeBron James", initials: "LJ",
    team: "Los Angeles Lakers", teamCode: "LAL",
    basePrice: 13, initialPrice: 16.2,
  },
  curry: {
    slug: "curry",
    sport: "NBA", league: "NBA",
    position: "PG", positionWeight: 1.0, competitionModifier: 1.0,
    name: "Stephen Curry", initials: "SC",
    team: "Golden State Warriors", teamCode: "GSW",
    basePrice: 16, initialPrice: 19.99,
  },
};

export type Frame = "Session" | "24h" | "7d" | "Season";

export interface HistoryPoint {
  t: number;
  p: number;
}

// ─────────────────────────────────────────────────────────────────────────────
//  SEEDED RANDOM — same slug → same chart shape across reloads
// ─────────────────────────────────────────────────────────────────────────────
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function slugSeed(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Generate synthetic historical price data for a given timeframe.
 * The series always ends at the athlete's initialPrice so the live endpoint
 * lines up. Deterministic per slug — chart shape is stable across reloads.
 */
export function generateTimeframeHistory(
  athlete: Athlete,
  frame: Exclude<Frame, "Session">,
  nowMs: number,
): HistoryPoint[] {
  const N = 30;
  const target = athlete.initialPrice;
  const startMultiplier = frame === "24h" ? 0.97 : frame === "7d" ? 0.90 : 0.78;
  const start = target * startMultiplier;
  const spanMs =
    frame === "24h" ? 24 * 60 * 60_000 :
    frame === "7d" ? 7 * 24 * 60 * 60_000 :
    120 * 24 * 60 * 60_000;
  const baseTs = nowMs - spanMs;
  const noise = frame === "24h" ? 0.012 : frame === "7d" ? 0.025 : 0.045;

  const frameOffset = frame === "24h" ? 1 : frame === "7d" ? 2 : 3;
  const rand = seededRandom(slugSeed(athlete.slug) + frameOffset);

  const out: HistoryPoint[] = [];
  for (let i = 0; i < N; i++) {
    const progress = i / (N - 1);
    const baseline = start + (target - start) * progress;
    const n = (rand() - 0.5) * 2 * noise * target;
    const p = baseline + n;
    out.push({
      t: baseTs + (i / (N - 1)) * spanMs,
      p: Number(p.toFixed(3)),
    });
  }
  // Force final point to exact target — endpoint lands flush with live price.
  out[N - 1] = { t: nowMs, p: target };
  return out;
}

/**
 * Generate the live session seed (damped walk into the current price).
 * Separate from timeframe generator because session uses real timestamps
 * and gets new points appended on stat events.
 */
export function generateSessionSeed(athlete: Athlete, nowMs: number): HistoryPoint[] {
  const N = 30;
  const target = athlete.initialPrice;
  const start = target * 0.94;
  const baseTs = nowMs - N * 60_000;
  const rand = seededRandom(slugSeed(athlete.slug));
  const seed: HistoryPoint[] = [];
  for (let i = 0; i < N; i++) {
    const progress = i / (N - 1);
    const baseline = start + (target - start) * progress;
    const noise = (rand() - 0.5) * 0.015 * target;
    seed.push({
      t: baseTs + i * 60_000,
      p: Number((baseline + noise).toFixed(3)),
    });
  }
  seed[seed.length - 1] = { t: nowMs, p: target };
  return seed;
}
