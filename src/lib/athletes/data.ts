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
  /** Pool selector — see SPORT_POSITION_MATRIX in event-pools.ts */
  position: string;
  name: string;
  initials: string;
  team: string;
  teamCode: string;
  basePrice: number;
  initialPrice: number;
}

export const ATHLETES: Record<string, Athlete> = {
  // ── NFL ────────────────────────────────────────────────────────────
  mahomes: {
    slug: "mahomes",
    sport: "NFL", league: "NFL", position: "QB",
    name: "Patrick Mahomes", initials: "PM",
    team: "Kansas City Chiefs", teamCode: "KC",
    basePrice: 14, initialPrice: 20.1,
  },
  allen: {
    slug: "allen",
    sport: "NFL", league: "NFL", position: "QB",
    name: "Josh Allen", initials: "JA",
    team: "Buffalo Bills", teamCode: "BUF",
    basePrice: 12, initialPrice: 14.5,
  },
  jefferson: {
    slug: "jefferson",
    sport: "NFL", league: "NFL", position: "WR",
    name: "Justin Jefferson", initials: "JJ",
    team: "Minnesota Vikings", teamCode: "MIN",
    basePrice: 15, initialPrice: 18.5,
  },
  mccaffrey: {
    slug: "mccaffrey",
    sport: "NFL", league: "NFL", position: "RB",
    name: "Christian McCaffrey", initials: "CM",
    team: "San Francisco 49ers", teamCode: "SF",
    basePrice: 13, initialPrice: 16.7,
  },
  sewell: {
    slug: "sewell",
    sport: "NFL", league: "NFL", position: "OL",
    name: "Penei Sewell", initials: "PS",
    team: "Detroit Lions", teamCode: "DET",
    basePrice: 7, initialPrice: 8.2,
  },
  garrett: {
    slug: "garrett",
    sport: "NFL", league: "NFL", position: "DL",
    name: "Myles Garrett", initials: "MG",
    team: "Cleveland Browns", teamCode: "CLE",
    basePrice: 10, initialPrice: 13.1,
  },
  gardner: {
    slug: "gardner",
    sport: "NFL", league: "NFL", position: "CB",
    name: "Sauce Gardner", initials: "SG",
    team: "New York Jets", teamCode: "NYJ",
    basePrice: 9, initialPrice: 11.3,
  },
  hamilton: {
    slug: "hamilton",
    sport: "NFL", league: "NFL", position: "S",
    name: "Kyle Hamilton", initials: "KH",
    team: "Baltimore Ravens", teamCode: "BAL",
    basePrice: 8, initialPrice: 9.8,
  },
  // ── SOCCER ─────────────────────────────────────────────────────────
  haaland: {
    slug: "haaland",
    sport: "SOCCER", league: "Premier League", position: "ST",
    name: "Erling Haaland", initials: "EH",
    team: "Manchester City", teamCode: "MCI",
    basePrice: 18, initialPrice: 22.31,
  },
  messi: {
    slug: "messi",
    sport: "SOCCER", league: "MLS", position: "RW",
    name: "Lionel Messi", initials: "LM",
    team: "Inter Miami", teamCode: "MIA",
    basePrice: 22, initialPrice: 27.45,
  },
  alisson: {
    slug: "alisson",
    sport: "SOCCER", league: "Premier League", position: "GK",
    name: "Alisson Becker", initials: "AB",
    team: "Liverpool", teamCode: "LIV",
    basePrice: 10, initialPrice: 12.4,
  },
  vandijk: {
    slug: "vandijk",
    sport: "SOCCER", league: "Premier League", position: "DF",
    name: "Virgil van Dijk", initials: "VD",
    team: "Liverpool", teamCode: "LIV",
    basePrice: 8, initialPrice: 9.4,
  },
  debruyne: {
    slug: "debruyne",
    sport: "SOCCER", league: "Premier League", position: "MF",
    name: "Kevin De Bruyne", initials: "KB",
    team: "Manchester City", teamCode: "MCI",
    basePrice: 12, initialPrice: 15.2,
  },
  // ── NBA ────────────────────────────────────────────────────────────
  lebron: {
    slug: "lebron",
    sport: "NBA", league: "NBA", position: "SF",
    name: "LeBron James", initials: "LJ",
    team: "Los Angeles Lakers", teamCode: "LAL",
    basePrice: 13, initialPrice: 16.2,
  },
  curry: {
    slug: "curry",
    sport: "NBA", league: "NBA", position: "PG",
    name: "Stephen Curry", initials: "SC",
    team: "Golden State Warriors", teamCode: "GSW",
    basePrice: 16, initialPrice: 19.99,
  },
  embiid: {
    slug: "embiid",
    sport: "NBA", league: "NBA", position: "C",
    name: "Joel Embiid", initials: "JE",
    team: "Philadelphia 76ers", teamCode: "PHI",
    basePrice: 17, initialPrice: 20.8,
  },
  edwards: {
    slug: "edwards",
    sport: "NBA", league: "NBA", position: "SG",
    name: "Anthony Edwards", initials: "AE",
    team: "Minnesota Timberwolves", teamCode: "MIN",
    basePrice: 14, initialPrice: 17.8,
  },
  giannis: {
    slug: "giannis",
    sport: "NBA", league: "NBA", position: "PF",
    name: "Giannis Antetokounmpo", initials: "GA",
    team: "Milwaukee Bucks", teamCode: "MIL",
    basePrice: 19, initialPrice: 24.5,
  },
  jokic: {
    slug: "jokic",
    sport: "NBA", league: "NBA", position: "C",
    name: "Nikola Jokić", initials: "NJ",
    team: "Denver Nuggets", teamCode: "DEN",
    basePrice: 18, initialPrice: 22.6,
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
