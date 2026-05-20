/**
 * Performance Index — weighted 0–100 score by sport + position.
 *
 * Pure function. No I/O. Easy to unit-test.
 * Dispatch on a discriminated union so each (sport × position) pair has its
 * own typed stat shape and weights.
 *
 * Add a new (sport, position) by:
 *   1. Adding its `*Stats` interface
 *   2. Adding it to the AthletePerformanceInput union
 *   3. Adding its `case` to `performanceIndex` + a calculator below
 */

export type Sport = "NFL" | "NBA" | "MLB" | "SOCCER";

// ─────────────────────────────────────────────────────────────────────────────
// Stat shapes per sport × position
// ─────────────────────────────────────────────────────────────────────────────

export interface MLBPitcherStats {
  era: number;   // earned run avg — lower is better
  whip: number;  // walks + hits / inning — lower is better
  k9: number;    // strikeouts per 9 — higher is better
}

export interface NBAGuardStats {
  ast: number;
  to: number;
  tsPct: number;   // true shooting %, 0–1
  usgPct: number;  // usage rate %, 0–100
  ppg: number;
}

export interface NBAForwardStats {
  per: number;     // player efficiency rating
  fgPct: number;   // 0–1
  reb: number;
  ppg: number;
}

export interface NBACenterStats {
  reb: number;
  blkPct: number;  // block rate %, 0–100
  fgPct: number;   // 0–1
  ppg: number;
}

export interface NFLQBStats {
  passerRating: number;  // 0–158.3
  tdToInt: number;       // TD ÷ INT ratio
  ypa: number;           // yards per attempt
}

export interface NFLRBStats {
  ypc: number;             // yards per carry
  tdPerSeason: number;
  hundredYdGames: number;
}

export interface NFLWRStats {
  receptions: number;
  yds: number;
  td: number;
}

export interface SoccerFWDStats {
  goalsPer90: number;
  xG: number;
  sotPct: number;  // shots on target %, 0–100
}

export interface SoccerMIDStats {
  assistsPer90: number;
  keyPasses: number;
  passPct: number;  // 0–100
}

export interface SoccerDEFStats {
  tkl: number;
  intc: number;
  clearances: number;
}

export interface SoccerGKStats {
  savePct: number;  // 0–100
  gaa: number;      // goals against avg — lower is better
}

// ─────────────────────────────────────────────────────────────────────────────
// Discriminated union — the single public input shape
// ─────────────────────────────────────────────────────────────────────────────

export type AthletePerformanceInput =
  | { sport: "MLB"; position: "P"; stats: MLBPitcherStats }
  | { sport: "NBA"; position: "G"; stats: NBAGuardStats }
  | { sport: "NBA"; position: "F"; stats: NBAForwardStats }
  | { sport: "NBA"; position: "C"; stats: NBACenterStats }
  | { sport: "NFL"; position: "QB"; stats: NFLQBStats }
  | { sport: "NFL"; position: "RB"; stats: NFLRBStats }
  | { sport: "NFL"; position: "WR"; stats: NFLWRStats }
  | { sport: "SOCCER"; position: "FWD"; stats: SoccerFWDStats }
  | { sport: "SOCCER"; position: "MID"; stats: SoccerMIDStats }
  | { sport: "SOCCER"; position: "DEF"; stats: SoccerDEFStats }
  | { sport: "SOCCER"; position: "GK"; stats: SoccerGKStats };

// ─────────────────────────────────────────────────────────────────────────────
// Public entry point
// ─────────────────────────────────────────────────────────────────────────────

export function performanceIndex(input: AthletePerformanceInput): number {
  switch (input.sport) {
    case "MLB":
      return mlbPitcher(input.stats);
    case "NBA":
      switch (input.position) {
        case "G": return nbaGuard(input.stats);
        case "F": return nbaForward(input.stats);
        case "C": return nbaCenter(input.stats);
      }
    case "NFL":
      switch (input.position) {
        case "QB": return nflQB(input.stats);
        case "RB": return nflRB(input.stats);
        case "WR": return nflWR(input.stats);
      }
    case "SOCCER":
      switch (input.position) {
        case "FWD": return soccerFWD(input.stats);
        case "MID": return soccerMID(input.stats);
        case "DEF": return soccerDEF(input.stats);
        case "GK": return soccerGK(input.stats);
      }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalization helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Clamp `value` into `[min, max]` and map to 0–100 (linear). */
function normalize(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || max === min) return 50;
  const clamped = Math.max(min, Math.min(max, value));
  return ((clamped - min) / (max - min)) * 100;
}

/** Inverted normalize — lower input = higher score (for ERA, WHIP, GAA). */
function invertNormalize(value: number, low: number, high: number): number {
  return 100 - normalize(value, low, high);
}

/** Sum weighted parts → final score rounded to 1 decimal. */
function weightedSum(parts: ReadonlyArray<readonly [number, number]>): number {
  const total = parts.reduce((acc, [v, w]) => acc + v * w, 0);
  return Math.round(total * 10) / 10;
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-position calculators
// Normalization ranges chosen from MLB/NBA/NFL/Premier-League league averages.
// ─────────────────────────────────────────────────────────────────────────────

function mlbPitcher(s: MLBPitcherStats): number {
  const era = invertNormalize(s.era, 1.5, 6.0);
  const whip = invertNormalize(s.whip, 0.9, 1.8);
  const k9 = normalize(s.k9, 6.0, 12.0);
  return weightedSum([[era, 0.4], [whip, 0.3], [k9, 0.3]]);
}

function nbaGuard(s: NBAGuardStats): number {
  const astTo = normalize(s.ast / Math.max(0.5, s.to), 1.0, 4.0);
  const ts = normalize(s.tsPct, 0.50, 0.65);
  const usg = normalize(s.usgPct, 18, 35);
  const ppg = normalize(s.ppg, 8, 32);
  return weightedSum([[astTo, 0.30], [ts, 0.30], [usg, 0.20], [ppg, 0.20]]);
}

function nbaForward(s: NBAForwardStats): number {
  const per = normalize(s.per, 12, 30);
  const fg = normalize(s.fgPct, 0.40, 0.60);
  const reb = normalize(s.reb, 4, 12);
  const ppg = normalize(s.ppg, 10, 30);
  return weightedSum([[per, 0.30], [fg, 0.25], [reb, 0.25], [ppg, 0.20]]);
}

function nbaCenter(s: NBACenterStats): number {
  const reb = normalize(s.reb, 6, 14);
  const blk = normalize(s.blkPct, 2, 6);
  const fg = normalize(s.fgPct, 0.45, 0.65);
  const ppg = normalize(s.ppg, 8, 25);
  return weightedSum([[reb, 0.35], [blk, 0.25], [fg, 0.25], [ppg, 0.15]]);
}

function nflQB(s: NFLQBStats): number {
  const rtg = normalize(s.passerRating, 70, 115);
  const td = normalize(s.tdToInt, 1.5, 5.0);
  const ypa = normalize(s.ypa, 6.0, 9.0);
  return weightedSum([[rtg, 0.40], [td, 0.30], [ypa, 0.30]]);
}

function nflRB(s: NFLRBStats): number {
  const ypc = normalize(s.ypc, 3.0, 6.0);
  const td = normalize(s.tdPerSeason, 4, 20);
  const hg = normalize(s.hundredYdGames, 0, 10);
  return weightedSum([[ypc, 0.35], [td, 0.30], [hg, 0.35]]);
}

function nflWR(s: NFLWRStats): number {
  const rec = normalize(s.receptions, 40, 120);
  const yds = normalize(s.yds, 600, 1800);
  const td = normalize(s.td, 4, 15);
  return weightedSum([[rec, 0.30], [yds, 0.35], [td, 0.35]]);
}

function soccerFWD(s: SoccerFWDStats): number {
  const g90 = normalize(s.goalsPer90, 0.2, 1.2);
  const xg = normalize(s.xG, 0.2, 1.0);
  const sot = normalize(s.sotPct, 30, 55);
  return weightedSum([[g90, 0.40], [xg, 0.30], [sot, 0.30]]);
}

function soccerMID(s: SoccerMIDStats): number {
  const a90 = normalize(s.assistsPer90, 0.1, 0.6);
  const kp = normalize(s.keyPasses, 1.0, 4.0);
  const pp = normalize(s.passPct, 80, 92);
  return weightedSum([[a90, 0.30], [kp, 0.35], [pp, 0.35]]);
}

function soccerDEF(s: SoccerDEFStats): number {
  const tkl = normalize(s.tkl, 1.0, 4.0);
  const intc = normalize(s.intc, 0.5, 2.5);
  const clr = normalize(s.clearances, 2.0, 8.0);
  return weightedSum([[tkl, 0.35], [intc, 0.35], [clr, 0.30]]);
}

function soccerGK(s: SoccerGKStats): number {
  const sv = normalize(s.savePct, 65, 80);
  const gaa = invertNormalize(s.gaa, 0.5, 1.8);
  return weightedSum([[sv, 0.60], [gaa, 0.40]]);
}
