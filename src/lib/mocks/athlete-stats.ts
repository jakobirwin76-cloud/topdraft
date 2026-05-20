import type { AthletePerformanceInput } from "@/lib/pricing/performance-index";

/**
 * Mock per-athlete stats for the /athletes/[id] prototype.
 * Keyed by `external_id` from the SportsRadar-style ID in `supabase/seed.sql`.
 *
 * Replace with the real SportsRadar pipeline before launch — see
 * docs/COMPLIANCE_CHECKLIST.md §7.
 *
 * Each entry holds:
 *   • `input` — the typed shape consumed by `performanceIndex()`
 *   • `display` — pre-formatted `{label, value}` rows for the stats grid
 *     (keeps formatting out of the React component)
 */

export interface DisplayStat {
  label: string;
  value: string;
}

/** Athlete identity, mirroring what the `athletes` table returns. */
export interface MockAthleteMeta {
  fullName: string;
  teamCode: string | null;
  position: string | null;
  sport: string;
}

export interface MockAthleteStats {
  meta: MockAthleteMeta;
  input: AthletePerformanceInput;
  display: ReadonlyArray<DisplayStat>;
}

export const mockStatsByExternalId: Record<string, MockAthleteStats> = {
  // ── NFL ────────────────────────────────────────────────────────────────
  "sr:nfl:player:1": {
    meta: { fullName: "Patrick Mahomes", teamCode: "KC", position: "QB", sport: "NFL" },
    input: { sport: "NFL", position: "QB", stats: { passerRating: 105.2, tdToInt: 4.0, ypa: 7.8 } },
    display: [
      { label: "Passer Rtg", value: "105.2" },
      { label: "TD / INT", value: "4.0" },
      { label: "YPA", value: "7.8" },
    ],
  },
  "sr:nfl:player:2": {
    meta: { fullName: "Travis Kelce", teamCode: "KC", position: "TE", sport: "NFL" },
    input: { sport: "NFL", position: "WR", stats: { receptions: 93, yds: 984, td: 5 } },
    display: [
      { label: "Rec", value: "93" },
      { label: "Yds", value: "984" },
      { label: "TD", value: "5" },
    ],
  },
  "sr:nfl:player:3": {
    meta: { fullName: "Justin Jefferson", teamCode: "MIN", position: "WR", sport: "NFL" },
    input: { sport: "NFL", position: "WR", stats: { receptions: 108, yds: 1450, td: 9 } },
    display: [
      { label: "Rec", value: "108" },
      { label: "Yds", value: "1,450" },
      { label: "TD", value: "9" },
    ],
  },
  "sr:nfl:player:4": {
    meta: { fullName: "Lamar Jackson", teamCode: "BAL", position: "QB", sport: "NFL" },
    input: { sport: "NFL", position: "QB", stats: { passerRating: 102.4, tdToInt: 4.5, ypa: 7.2 } },
    display: [
      { label: "Passer Rtg", value: "102.4" },
      { label: "TD / INT", value: "4.5" },
      { label: "YPA", value: "7.2" },
    ],
  },

  // ── NBA ────────────────────────────────────────────────────────────────
  "sr:nba:player:1": {
    meta: { fullName: "LeBron James", teamCode: "LAL", position: "SF", sport: "NBA" },
    input: { sport: "NBA", position: "F", stats: { per: 23.8, fgPct: 0.525, reb: 7.6, ppg: 25.4 } },
    display: [
      { label: "PER", value: "23.8" },
      { label: "FG%", value: "52.5%" },
      { label: "REB", value: "7.6" },
      { label: "PPG", value: "25.4" },
    ],
  },
  "sr:nba:player:2": {
    meta: { fullName: "Stephen Curry", teamCode: "GSW", position: "PG", sport: "NBA" },
    input: { sport: "NBA", position: "G", stats: { ast: 6.5, to: 3.2, tsPct: 0.628, usgPct: 30.4, ppg: 28.1 } },
    display: [
      { label: "AST", value: "6.5" },
      { label: "TO", value: "3.2" },
      { label: "TS%", value: "62.8%" },
      { label: "USG%", value: "30.4%" },
      { label: "PPG", value: "28.1" },
    ],
  },
  "sr:nba:player:3": {
    meta: { fullName: "Nikola Jokić", teamCode: "DEN", position: "C", sport: "NBA" },
    input: { sport: "NBA", position: "C", stats: { reb: 12.1, blkPct: 2.4, fgPct: 0.582, ppg: 25.9 } },
    display: [
      { label: "REB", value: "12.1" },
      { label: "BLK%", value: "2.4%" },
      { label: "FG%", value: "58.2%" },
      { label: "PPG", value: "25.9" },
    ],
  },
  "sr:nba:player:4": {
    meta: { fullName: "Anthony Edwards", teamCode: "MIN", position: "SG", sport: "NBA" },
    input: { sport: "NBA", position: "G", stats: { ast: 5.4, to: 3.6, tsPct: 0.578, usgPct: 30.1, ppg: 26.3 } },
    display: [
      { label: "AST", value: "5.4" },
      { label: "TO", value: "3.6" },
      { label: "TS%", value: "57.8%" },
      { label: "USG%", value: "30.1%" },
      { label: "PPG", value: "26.3" },
    ],
  },

  // ── SOCCER ─────────────────────────────────────────────────────────────
  "sr:soc:player:1": {
    meta: { fullName: "Erling Haaland", teamCode: "MCI", position: "FW", sport: "SOCCER" },
    input: { sport: "SOCCER", position: "FWD", stats: { goalsPer90: 0.95, xG: 0.84, sotPct: 48.0 } },
    display: [
      { label: "Goals/90", value: "0.95" },
      { label: "xG", value: "0.84" },
      { label: "SOT%", value: "48.0%" },
    ],
  },
  "sr:soc:player:2": {
    meta: { fullName: "Kylian Mbappé", teamCode: "RMA", position: "FW", sport: "SOCCER" },
    input: { sport: "SOCCER", position: "FWD", stats: { goalsPer90: 0.88, xG: 0.78, sotPct: 50.5 } },
    display: [
      { label: "Goals/90", value: "0.88" },
      { label: "xG", value: "0.78" },
      { label: "SOT%", value: "50.5%" },
    ],
  },
  "sr:soc:player:3": {
    meta: { fullName: "Jude Bellingham", teamCode: "RMA", position: "MF", sport: "SOCCER" },
    input: { sport: "SOCCER", position: "MID", stats: { assistsPer90: 0.42, keyPasses: 2.8, passPct: 88.4 } },
    display: [
      { label: "Ast/90", value: "0.42" },
      { label: "Key Pass", value: "2.8" },
      { label: "Pass%", value: "88.4%" },
    ],
  },
  "sr:soc:player:4": {
    meta: { fullName: "Vinícius Júnior", teamCode: "RMA", position: "FW", sport: "SOCCER" },
    input: { sport: "SOCCER", position: "FWD", stats: { goalsPer90: 0.55, xG: 0.49, sotPct: 42.0 } },
    display: [
      { label: "Goals/90", value: "0.55" },
      { label: "xG", value: "0.49" },
      { label: "SOT%", value: "42.0%" },
    ],
  },
};

