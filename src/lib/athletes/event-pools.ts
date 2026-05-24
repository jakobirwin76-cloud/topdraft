/**
 * SPORT_POSITION_MATRIX — multi-sport, 15-position pricing engine.
 *
 *   nextPrice = currentPrice × (1 + clamp(pctImpact, ±0.02))
 *
 * Each (sport, position) maps to a fixed pool of events with absolute
 * percentage impacts. No dynamic position weight, no league modifier —
 * values are absolute. The ±2% cap is enforced at compute time.
 */

import type { Sport } from "./data";

export interface StatEventDef {
  code: string;
  label: string;
  /** Per-event percentage impact, e.g. 0.015 = +1.5%. Hard-capped at ±0.02. */
  pctImpact: number;
  /** Selection probability weight within its pool. */
  weight: number;
  positive: boolean;
}

export const PER_EVENT_CAP = 0.02;

// ═════════════════════════════════════════════════════════════════════
//  SOCCER — 4 positions
// ═════════════════════════════════════════════════════════════════════

// GK · Alisson Becker
const SOCCER_GK_POOL: StatEventDef[] = [
  { code: "BIG_SAVE",      label: "Big save",            pctImpact:  0.0060, weight: 10, positive: true  },
  { code: "PEN_SAVE",      label: "Penalty saved",       pctImpact:  0.0150, weight: 1,  positive: true  },
  { code: "CLEAN_TICK",    label: "Clean sheet tick",    pctImpact:  0.0005, weight: 24, positive: true  },
  { code: "GOAL_CONCEDED", label: "Goal conceded",       pctImpact: -0.0140, weight: 2,  positive: false },
  { code: "ERROR_TO_SHOT", label: "Error led to shot",   pctImpact: -0.0075, weight: 3,  positive: false },
  { code: "RED_CARD",      label: "Red card",            pctImpact: -0.0200, weight: 1,  positive: false },
];

// DF · Virgil van Dijk
const SOCCER_DF_POOL: StatEventDef[] = [
  { code: "CLEAN_TICK",    label: "Clean sheet tick",    pctImpact:  0.0004, weight: 22, positive: true  },
  { code: "TACKLE_WON",    label: "Tackle won",          pctImpact:  0.0030, weight: 14, positive: true  },
  { code: "INTERCEPTION",  label: "Interception",        pctImpact:  0.0025, weight: 12, positive: true  },
  { code: "AERIAL_DUEL",   label: "Aerial duel won",     pctImpact:  0.0015, weight: 16, positive: true  },
  { code: "GOAL_CONCEDED", label: "Goal conceded",       pctImpact: -0.0100, weight: 2,  positive: false },
  { code: "DISPOSSESSED",  label: "Dispossessed",        pctImpact: -0.0030, weight: 8,  positive: false },
  { code: "FOUL_CONCEDED", label: "Foul conceded",       pctImpact: -0.0020, weight: 10, positive: false },
  { code: "YELLOW",        label: "Yellow card",         pctImpact: -0.0050, weight: 4,  positive: false },
];

// MF · Kevin De Bruyne
const SOCCER_MF_POOL: StatEventDef[] = [
  { code: "KEY_PASS",      label: "Key pass",            pctImpact:  0.0040, weight: 14, positive: true  },
  { code: "ASSIST",        label: "Assist",              pctImpact:  0.0085, weight: 6,  positive: true  },
  { code: "PASS_ACCURACY", label: "Pass accuracy block", pctImpact:  0.0020, weight: 14, positive: true  },
  { code: "INTERCEPTION",  label: "Interception",        pctImpact:  0.0020, weight: 10, positive: true  },
  { code: "DISPOSSESSED",  label: "Dispossessed",        pctImpact: -0.0035, weight: 12, positive: false },
  { code: "MISPLACED",     label: "Misplaced pass",      pctImpact: -0.0010, weight: 16, positive: false },
  { code: "FOUL_CONCEDED", label: "Foul conceded",       pctImpact: -0.0015, weight: 8,  positive: false },
];

// FW · Messi / Haaland
const SOCCER_FW_POOL: StatEventDef[] = [
  { code: "GOAL",          label: "Goal scored",         pctImpact:  0.0150, weight: 4,  positive: true  },
  { code: "ASSIST",        label: "Assist",              pctImpact:  0.0085, weight: 6,  positive: true  },
  { code: "ON_TARGET",     label: "Shot on target",      pctImpact:  0.0025, weight: 16, positive: true  },
  { code: "DRIBBLE",       label: "Successful dribble",  pctImpact:  0.0015, weight: 18, positive: true  },
  { code: "DISPOSSESSED",  label: "Dispossessed",        pctImpact: -0.0035, weight: 14, positive: false },
  { code: "OFFSIDE",       label: "Offside",             pctImpact: -0.0020, weight: 10, positive: false },
  { code: "PEN_MISS",      label: "Missed penalty",      pctImpact: -0.0120, weight: 1,  positive: false },
  { code: "OFF_TARGET",    label: "Shot off target",     pctImpact: -0.0015, weight: 14, positive: false },
];

// ═════════════════════════════════════════════════════════════════════
//  NBA — 5 positions
// ═════════════════════════════════════════════════════════════════════

// PG · Curry
const NBA_PG_POOL: StatEventDef[] = [
  { code: "AST",           label: "Assist",              pctImpact:  0.0040, weight: 18, positive: true  },
  { code: "FG_3PT",        label: "Three-pointer",       pctImpact:  0.0045, weight: 14, positive: true  },
  { code: "PT_MADE",       label: "Point made",          pctImpact:  0.0015, weight: 22, positive: true  },
  { code: "STL",           label: "Steal",               pctImpact:  0.0060, weight: 6,  positive: true  },
  { code: "TO",            label: "Turnover",            pctImpact: -0.0060, weight: 12, positive: false },
  { code: "MISSED_FG",     label: "Missed field goal",   pctImpact: -0.0020, weight: 14, positive: false },
  { code: "MISSED_FT",     label: "Missed free throw",   pctImpact: -0.0015, weight: 6,  positive: false },
];

// SG · Anthony Edwards
const NBA_SG_POOL: StatEventDef[] = [
  { code: "PT_MADE",       label: "Point made",          pctImpact:  0.0020, weight: 22, positive: true  },
  { code: "FG_3PT",        label: "Three-pointer",       pctImpact:  0.0040, weight: 12, positive: true  },
  { code: "FASTBREAK",     label: "Fastbreak points",    pctImpact:  0.0025, weight: 5,  positive: true  },
  { code: "STL",           label: "Steal",               pctImpact:  0.0050, weight: 6,  positive: true  },
  { code: "MISSED_FG",     label: "Missed field goal",   pctImpact: -0.0025, weight: 16, positive: false },
  { code: "TO",            label: "Turnover",            pctImpact: -0.0045, weight: 10, positive: false },
  { code: "FOUL_PERSONAL", label: "Personal foul",       pctImpact: -0.0020, weight: 8,  positive: false },
];

// SF · LeBron
const NBA_SF_POOL: StatEventDef[] = [
  { code: "PT_MADE",       label: "Point made",          pctImpact:  0.0018, weight: 22, positive: true  },
  { code: "REB",           label: "Rebound",             pctImpact:  0.0025, weight: 14, positive: true  },
  { code: "AST",           label: "Assist",              pctImpact:  0.0030, weight: 12, positive: true  },
  { code: "AND1",          label: "And-1",               pctImpact:  0.0050, weight: 3,  positive: true  },
  { code: "TO",            label: "Turnover",            pctImpact: -0.0050, weight: 10, positive: false },
  { code: "MISSED_FG",     label: "Missed field goal",   pctImpact: -0.0022, weight: 14, positive: false },
  { code: "OFF_FOUL",      label: "Offensive foul",      pctImpact: -0.0025, weight: 6,  positive: false },
];

// PF · Giannis Antetokounmpo
const NBA_PF_POOL: StatEventDef[] = [
  { code: "PAINT_PT",      label: "Paint point",         pctImpact:  0.0020, weight: 22, positive: true  },
  { code: "REB",           label: "Rebound",             pctImpact:  0.0030, weight: 16, positive: true  },
  { code: "BLK",           label: "Block",               pctImpact:  0.0050, weight: 7,  positive: true  },
  { code: "DUNK",          label: "Dunk",                pctImpact:  0.0015, weight: 10, positive: true  },
  { code: "MISSED_FT",     label: "Missed free throw",   pctImpact: -0.0025, weight: 8,  positive: false },
  { code: "TO",            label: "Turnover",            pctImpact: -0.0050, weight: 10, positive: false },
  { code: "OFF_FOUL",      label: "Offensive foul",      pctImpact: -0.0030, weight: 6,  positive: false },
];

// C · Jokić / Embiid
const NBA_C_POOL: StatEventDef[] = [
  { code: "REB",           label: "Rebound",             pctImpact:  0.0035, weight: 18, positive: true  },
  { code: "BLK",           label: "Block",               pctImpact:  0.0060, weight: 7,  positive: true  },
  { code: "AST",           label: "Assist",              pctImpact:  0.0045, weight: 12, positive: true  },
  { code: "SECOND_CHANCE", label: "Second-chance pts",   pctImpact:  0.0025, weight: 6,  positive: true  },
  { code: "TO",            label: "Turnover",            pctImpact: -0.0050, weight: 10, positive: false },
  { code: "FOUL_PERSONAL", label: "Personal foul",       pctImpact: -0.0030, weight: 8,  positive: false },
  { code: "MISS_PAINT",    label: "Missed paint shot",   pctImpact: -0.0025, weight: 14, positive: false },
];

// ═════════════════════════════════════════════════════════════════════
//  NFL — 7 positions (QB kept + 6 new per spec)
// ═════════════════════════════════════════════════════════════════════

// QB · Mahomes / Allen
const NFL_QB_POOL: StatEventDef[] = [
  { code: "PASS_TD",       label: "Touchdown pass",      pctImpact:  0.0120, weight: 10, positive: true  },
  { code: "PASS_DEEP",     label: "30+ yard pass",       pctImpact:  0.0060, weight: 8,  positive: true  },
  { code: "PASS_MEDIUM",   label: "15-yard completion",  pctImpact:  0.0030, weight: 12, positive: true  },
  { code: "PASS_SHORT",    label: "Short completion",    pctImpact:  0.0016, weight: 20, positive: true  },
  { code: "RUSH_QB",       label: "QB scramble",         pctImpact:  0.0040, weight: 4,  positive: true  },
  { code: "INT",           label: "Interception",        pctImpact: -0.0150, weight: 8,  positive: false },
  { code: "FUMBLE",        label: "Fumble",              pctImpact: -0.0100, weight: 4,  positive: false },
  { code: "SACK",          label: "Sacked",              pctImpact: -0.0044, weight: 12, positive: false },
  { code: "INCOMPLETION",  label: "Incompletion",        pctImpact: -0.0020, weight: 16, positive: false },
];

// RB · Christian McCaffrey
const NFL_RB_POOL: StatEventDef[] = [
  { code: "RUSH",          label: "Rushing yards",       pctImpact:  0.0030, weight: 16, positive: true  },
  { code: "REC",           label: "Receiving yards",     pctImpact:  0.0040, weight: 8,  positive: true  },
  { code: "TD",            label: "Touchdown",           pctImpact:  0.0135, weight: 6,  positive: true  },
  { code: "BROKEN_TACKLE", label: "Broken tackle",       pctImpact:  0.0015, weight: 10, positive: true  },
  { code: "FUMBLE_LOST",   label: "Fumble lost",         pctImpact: -0.0150, weight: 2,  positive: false },
  { code: "FUMBLE_REC",    label: "Fumble (recovered)",  pctImpact: -0.0050, weight: 3,  positive: false },
  { code: "TFL",           label: "Tackled for loss",    pctImpact: -0.0030, weight: 10, positive: false },
];

// WR · Justin Jefferson
const NFL_WR_POOL: StatEventDef[] = [
  { code: "REC_YDS",       label: "Receiving yards",     pctImpact:  0.0048, weight: 16, positive: true  },
  { code: "RECEPTION",     label: "Reception",           pctImpact:  0.0030, weight: 14, positive: true  },
  { code: "TD",            label: "Touchdown",           pctImpact:  0.0135, weight: 6,  positive: true  },
  { code: "BIG_PLAY",      label: "20+ yard big play",   pctImpact:  0.0040, weight: 8,  positive: true  },
  { code: "DROP",          label: "Drop",                pctImpact: -0.0050, weight: 6,  positive: false },
  { code: "FUMBLE_LOST",   label: "Fumble lost",         pctImpact: -0.0125, weight: 2,  positive: false },
  { code: "TFL",           label: "Tackled for loss",    pctImpact: -0.0020, weight: 8,  positive: false },
];

// OL · Penei Sewell
const NFL_OL_POOL: StatEventDef[] = [
  { code: "CLEAN_POCKET",  label: "Clean pocket",        pctImpact:  0.0020, weight: 24, positive: true  },
  { code: "PANCAKE",       label: "Pancake block",       pctImpact:  0.0040, weight: 6,  positive: true  },
  { code: "RUN_BLOCK",     label: "Run-block push",      pctImpact:  0.0015, weight: 16, positive: true  },
  { code: "SACK_ALLOWED",  label: "Sack allowed",        pctImpact: -0.0120, weight: 4,  positive: false },
  { code: "QBH_ALLOWED",   label: "QB hit allowed",      pctImpact: -0.0050, weight: 6,  positive: false },
  { code: "PENALTY_OL",    label: "Holding / false start", pctImpact: -0.0040, weight: 4,  positive: false },
];

// DL/EDGE · Myles Garrett
const NFL_DL_POOL: StatEventDef[] = [
  { code: "SACK",          label: "Sack",                pctImpact:  0.0150, weight: 4,  positive: true  },
  { code: "QB_HIT",        label: "QB hit",              pctImpact:  0.0050, weight: 10, positive: true  },
  { code: "TFL_DL",        label: "Tackle for loss",     pctImpact:  0.0060, weight: 10, positive: true  },
  { code: "FORCED_FUMBLE", label: "Forced fumble",       pctImpact:  0.0100, weight: 2,  positive: true  },
  { code: "OFFSIDE",       label: "Offside/encroachment",pctImpact: -0.0035, weight: 6,  positive: false },
  { code: "MISSED_TACKLE", label: "Missed tackle",       pctImpact: -0.0025, weight: 8,  positive: false },
];

// CB · Sauce Gardner
const NFL_CB_POOL: StatEventDef[] = [
  { code: "INT",           label: "Interception",        pctImpact:  0.0175, weight: 2,  positive: true  },
  { code: "PASS_DEFENDED", label: "Pass defended",       pctImpact:  0.0060, weight: 8,  positive: true  },
  { code: "FORCED_INC",    label: "Forced incompletion", pctImpact:  0.0030, weight: 10, positive: true  },
  { code: "PI_PENALTY",    label: "Pass interference",   pctImpact: -0.0075, weight: 4,  positive: false },
  { code: "REC_ALLOWED",   label: "Reception allowed",   pctImpact: -0.0025, weight: 12, positive: false },
  { code: "TD_ALLOWED",    label: "Touchdown allowed",   pctImpact: -0.0150, weight: 2,  positive: false },
];

// S · Kyle Hamilton
const NFL_S_POOL: StatEventDef[] = [
  { code: "INT",           label: "Interception",        pctImpact:  0.0150, weight: 2,  positive: true  },
  { code: "SOLO_TACKLE",   label: "Solo tackle",         pctImpact:  0.0025, weight: 18, positive: true  },
  { code: "TFL_BLITZ",     label: "TFL / blitz sack",    pctImpact:  0.0100, weight: 3,  positive: true  },
  { code: "PASS_DEFENDED", label: "Pass defended",       pctImpact:  0.0050, weight: 8,  positive: true  },
  { code: "BLOWN_COVER",   label: "Blown coverage TD",   pctImpact: -0.0125, weight: 3,  positive: false },
  { code: "MISSED_TACKLE", label: "Missed tackle",       pctImpact: -0.0040, weight: 8,  positive: false },
  { code: "PERSONAL_FOUL", label: "Personal foul",       pctImpact: -0.0050, weight: 4,  positive: false },
];

// ═════════════════════════════════════════════════════════════════════
//  DISPATCHER — getEventPool(sport, position)
// ═════════════════════════════════════════════════════════════════════

export function getEventPool(sport: Sport, position: string): StatEventDef[] {
  const p = position.toUpperCase();

  if (sport === "SOCCER") {
    if (p === "GK") return SOCCER_GK_POOL;
    if (["DF", "CB", "LB", "RB", "DEF"].includes(p)) return SOCCER_DF_POOL;
    if (["MF", "CM", "CDM", "CAM", "LM", "RM"].includes(p)) return SOCCER_MF_POOL;
    return SOCCER_FW_POOL; // ST, FW, RW, LW, CF, ATT
  }

  if (sport === "NBA") {
    if (p === "PG") return NBA_PG_POOL;
    if (p === "SG") return NBA_SG_POOL;
    if (p === "SF") return NBA_SF_POOL;
    if (p === "PF") return NBA_PF_POOL;
    return NBA_C_POOL; // C
  }

  // NFL
  if (p === "QB") return NFL_QB_POOL;
  if (p === "RB") return NFL_RB_POOL;
  if (p === "WR" || p === "TE") return NFL_WR_POOL;
  if (["OL", "OT", "OG", "OC"].includes(p)) return NFL_OL_POOL;
  if (["DL", "DE", "DT", "EDGE"].includes(p)) return NFL_DL_POOL;
  if (p === "CB") return NFL_CB_POOL;
  if (["S", "FS", "SS"].includes(p)) return NFL_S_POOL;
  return NFL_WR_POOL; // fallback
}

export function pickEventFromPool(pool: StatEventDef[]): StatEventDef {
  const total = pool.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const e of pool) if ((r -= e.weight) <= 0) return e;
  return pool[0]!;
}

/**
 * Hard-clamped event multiplier. ±2% per frame max, regardless of pool config.
 */
export function computeMultiplier(ev: StatEventDef): number {
  const capped = Math.max(-PER_EVENT_CAP, Math.min(PER_EVENT_CAP, ev.pctImpact));
  return 1 + capped;
}
