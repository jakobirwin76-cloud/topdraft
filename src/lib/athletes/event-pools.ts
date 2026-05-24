/**
 * Per-sport, per-position stat-event pools.
 *
 * Each event carries a RAW delta. The final price multiplier is computed at
 * runtime as `1 + rawDelta × positionWeight × effectiveCompModifier`, where
 * `effectiveCompModifier = competitionModifier` for positives and `1.0` for
 * negatives. Rationale: a goal in MLS matters less than a goal in UCL
 * (audience prestige), but a lost possession is a lost possession in any
 * league. Asymmetric application keeps bad plays punitive everywhere.
 */

import type { Sport } from "./data";

export interface StatEventDef {
  code: string;
  label: string;
  rawDelta: number;
  weight: number;
  positive: boolean;
}

// ─── NFL (QB-tuned pool) ────────────────────────────────────────────────────
const NFL_QB_POOL: StatEventDef[] = [
  { code: "PASS_TD",     label: "Touchdown pass",        rawDelta:  0.060, weight: 14, positive: true  },
  { code: "BIG_PLAY",    label: "40+ yard completion",   rawDelta:  0.025, weight: 18, positive: true  },
  { code: "RED_ZONE_TD", label: "Red zone touchdown",    rawDelta:  0.015, weight: 6,  positive: true  },
  { code: "PASS_300",    label: "300+ passing yards",    rawDelta:  0.030, weight: 3,  positive: true  },
  { code: "INT",         label: "Interception",          rawDelta: -0.050, weight: 14, positive: false },
  { code: "SACK",        label: "Sacked",                rawDelta: -0.012, weight: 16, positive: false },
  { code: "FUMBLE",      label: "Fumble lost",           rawDelta: -0.040, weight: 5,  positive: false },
  { code: "STRIP_SACK",  label: "Strip-sack lost",       rawDelta: -0.070, weight: 3,  positive: false },
  { code: "PICK_SIX",    label: "Pick-six returned",     rawDelta: -0.090, weight: 2,  positive: false },
  { code: "INJURY",      label: "Injury — questionable", rawDelta: -0.100, weight: 1,  positive: false },
  { code: "MISS",        label: "Incompletion",          rawDelta: -0.005, weight: 9,  positive: false },
];

// ─── NBA ─────────────────────────────────────────────────────────────────────
const NBA_POOL: StatEventDef[] = [
  { code: "FG_3PT",        label: "Three-pointer made",  rawDelta:  0.008,  weight: 22, positive: true  },
  { code: "FG_2PT",        label: "Field goal made",     rawDelta:  0.004,  weight: 24, positive: true  },
  { code: "AST",           label: "Assist",              rawDelta:  0.0035, weight: 18, positive: true  },
  { code: "REB_OFF",       label: "Offensive rebound",   rawDelta:  0.004,  weight: 6,  positive: true  },
  { code: "STL",           label: "Steal",               rawDelta:  0.005,  weight: 8,  positive: true  },
  { code: "BLK",           label: "Block",               rawDelta:  0.005,  weight: 7,  positive: true  },
  { code: "BUZZER_BEATER", label: "Buzzer-beater",       rawDelta:  0.040,  weight: 1,  positive: true  },
  { code: "TO",            label: "Turnover",            rawDelta: -0.0035, weight: 12, positive: false },
  { code: "MISSED_FG",     label: "Missed shot",         rawDelta: -0.0015, weight: 14, positive: false },
  { code: "FOUL",          label: "Foul",                rawDelta: -0.0015, weight: 10, positive: false },
  { code: "FOUL_TECH",     label: "Technical foul",      rawDelta: -0.008,  weight: 2,  positive: false },
  { code: "FOUL_EJECT",    label: "Ejected",             rawDelta: -0.060,  weight: 1,  positive: false },
];

// ─── SOCCER · STRIKER (ST / CF) — goals dominate, fewer creative plays ──────
const SOCCER_STRIKER_POOL: StatEventDef[] = [
  // Positives
  { code: "GOAL",              label: "Goal scored",            rawDelta:  0.075, weight: 5,  positive: true  },
  { code: "HEADER_GOAL",       label: "Header goal",            rawDelta:  0.080, weight: 2,  positive: true  },
  { code: "PEN_GOAL",          label: "Penalty scored",         rawDelta:  0.055, weight: 2,  positive: true  },
  { code: "BIG_CHANCE",        label: "Big chance created",     rawDelta:  0.012, weight: 10, positive: true  },
  { code: "ON_TARGET",         label: "Shot on target",         rawDelta:  0.008, weight: 14, positive: true  },
  { code: "ASSIST",            label: "Assist",                 rawDelta:  0.025, weight: 4,  positive: true  },
  { code: "HOLD_UP_PLAY",      label: "Hold-up play",           rawDelta:  0.004, weight: 8,  positive: true  },
  // Negatives — meaningful magnitudes so the chart actually moves down
  { code: "SHOT_OFF",          label: "Shot off target",        rawDelta: -0.006, weight: 14, positive: false },
  { code: "OFFSIDE",           label: "Offside",                rawDelta: -0.008, weight: 10, positive: false },
  { code: "BAD_PASS",          label: "Bad pass",               rawDelta: -0.007, weight: 10, positive: false },
  { code: "LOST_POSSESSION",   label: "Lost possession",        rawDelta: -0.012, weight: 12, positive: false },
  { code: "MISSED_BIG_CHANCE", label: "Missed big chance",      rawDelta: -0.025, weight: 3,  positive: false },
  { code: "YELLOW",            label: "Yellow card",            rawDelta: -0.008, weight: 4,  positive: false },
  { code: "PEN_MISS",          label: "Penalty missed",         rawDelta: -0.050, weight: 1,  positive: false },
  { code: "RED",               label: "Red card",               rawDelta: -0.080, weight: 1,  positive: false },
];

// ─── SOCCER · WINGER (RW / LW / RM / LM) — creative play, dribbles, passes ──
const SOCCER_WINGER_POOL: StatEventDef[] = [
  // Positives
  { code: "GOAL",              label: "Goal scored",            rawDelta:  0.070, weight: 4,  positive: true  },
  { code: "ASSIST",            label: "Assist",                 rawDelta:  0.035, weight: 7,  positive: true  },
  { code: "THROUGH_BALL",      label: "Through ball",           rawDelta:  0.022, weight: 5,  positive: true  },
  { code: "KEY_PASS",          label: "Key pass",               rawDelta:  0.018, weight: 8,  positive: true  },
  { code: "DRIBBLE_OK",        label: "Successful dribble",     rawDelta:  0.010, weight: 12, positive: true  },
  { code: "BIG_CHANCE",        label: "Big chance created",     rawDelta:  0.012, weight: 8,  positive: true  },
  { code: "ON_TARGET",         label: "Shot on target",         rawDelta:  0.007, weight: 10, positive: true  },
  { code: "MOTM",              label: "Man of the match",       rawDelta:  0.018, weight: 1,  positive: true  },
  // Negatives — wingers lose possession a lot in 1v1s
  { code: "DRIBBLE_FAIL",      label: "Dribble dispossessed",   rawDelta: -0.008, weight: 10, positive: false },
  { code: "SHOT_OFF",          label: "Shot off target",        rawDelta: -0.005, weight: 10, positive: false },
  { code: "OFFSIDE",           label: "Offside",                rawDelta: -0.006, weight: 8,  positive: false },
  { code: "BAD_PASS",          label: "Bad pass",               rawDelta: -0.010, weight: 10, positive: false },
  { code: "LOST_POSSESSION",   label: "Lost possession",        rawDelta: -0.013, weight: 14, positive: false },
  { code: "YELLOW",            label: "Yellow card",            rawDelta: -0.008, weight: 4,  positive: false },
  { code: "PEN_MISS",          label: "Penalty missed",         rawDelta: -0.050, weight: 1,  positive: false },
  { code: "RED",               label: "Red card",               rawDelta: -0.080, weight: 1,  positive: false },
];

/**
 * Pick the right pool by sport AND position. Position-specific in soccer
 * because wingers vs strikers play very different games.
 */
export function getEventPool(sport: Sport, position: string): StatEventDef[] {
  if (sport === "SOCCER") {
    const pos = position.toUpperCase();
    if (pos === "ST" || pos === "CF") return SOCCER_STRIKER_POOL;
    if (["RW", "LW", "RM", "LM", "WG"].includes(pos)) return SOCCER_WINGER_POOL;
    // Future: CAM, CDM, CB, GK pools. For now strikers as fallback.
    return SOCCER_STRIKER_POOL;
  }
  if (sport === "NFL") return NFL_QB_POOL;
  return NBA_POOL;
}

export function pickEventFromPool(pool: StatEventDef[]): StatEventDef {
  const total = pool.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const e of pool) if ((r -= e.weight) <= 0) return e;
  return pool[0]!;
}

/**
 * Compute final price multiplier.
 *
 * For POSITIVE events:  1 + rawDelta × positionWeight × competitionModifier
 * For NEGATIVE events:  1 + rawDelta × positionWeight             (no comp scaling)
 *
 * Why asymmetric: competition modifier weighs the prestige of a successful
 * play (goal in UCL > goal in MLS). But a turnover, missed chance, or red
 * card is a bad play regardless of league. Symmetric scaling made Messi's
 * losses feel weak; asymmetric scaling keeps them punitive everywhere.
 */
export function computeMultiplier(
  ev: StatEventDef,
  positionWeight: number,
  competitionModifier: number,
): number {
  const effectiveComp = ev.positive ? competitionModifier : 1.0;
  return 1 + ev.rawDelta * positionWeight * effectiveComp;
}
