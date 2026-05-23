import { applyStatEvent } from "@/lib/pricing/amm";

// ── Core types ────────────────────────────────────────────────────────────────

export interface GoalsByComp {
  league: number;
  ucl: number;
  cups: number;
}

export interface CareerSeason {
  season: string;
  club: string;
  league: string;
  goals: number;
  assists: number;
  apps: number;
  goalsByComp: GoalsByComp;
}

export type AwardType = "ballon_dor" | "golden_boot" | "ucl_title" | "tournament" | "top_scorer";

export interface Award {
  year: number;
  type: AwardType;
  label: string;
  detail: string;
}

export type MatchResult = "W" | "L" | "D";

export interface BigMatch {
  event: string;
  year: number;
  opponent: string;
  goals: number;
  assists: number;
  result: MatchResult;
  score: string;
  note?: string;
}

export interface CareerPlayer {
  id: string;
  name: string;
  shortName: string;
  nationality: string;
  position: string;
  ballonerDors: number;
  uclTitles: number;
  seasons: CareerSeason[];
  awards: Award[];
  bigMatches: BigMatch[];
}

// ── Messi ─────────────────────────────────────────────────────────────────────

export const messiCareer: CareerPlayer = {
  id: "messi",
  name: "Lionel Messi",
  shortName: "MESSI",
  nationality: "Argentina",
  position: "FWD",
  ballonerDors: 8,
  uclTitles: 4,
  seasons: [
    { season: "04/05", club: "Barcelona",   league: "La Liga",    goals: 1,  assists: 0,  apps: 9,  goalsByComp: { league: 1,  ucl: 0, cups: 0 } },
    { season: "05/06", club: "Barcelona",   league: "La Liga",    goals: 8,  assists: 6,  apps: 25, goalsByComp: { league: 6,  ucl: 1, cups: 1 } },
    { season: "06/07", club: "Barcelona",   league: "La Liga",    goals: 14, assists: 5,  apps: 36, goalsByComp: { league: 13, ucl: 1, cups: 0 } },
    { season: "07/08", club: "Barcelona",   league: "La Liga",    goals: 16, assists: 13, apps: 40, goalsByComp: { league: 10, ucl: 6, cups: 0 } },
    { season: "08/09", club: "Barcelona",   league: "La Liga",    goals: 38, assists: 18, apps: 51, goalsByComp: { league: 23, ucl: 9, cups: 6 } },
    { season: "09/10", club: "Barcelona",   league: "La Liga",    goals: 47, assists: 11, apps: 53, goalsByComp: { league: 34, ucl: 8, cups: 5 } },
    { season: "10/11", club: "Barcelona",   league: "La Liga",    goals: 53, assists: 24, apps: 55, goalsByComp: { league: 31, ucl: 12, cups: 10 } },
    { season: "11/12", club: "Barcelona",   league: "La Liga",    goals: 73, assists: 29, apps: 60, goalsByComp: { league: 50, ucl: 14, cups: 9 } },
    { season: "12/13", club: "Barcelona",   league: "La Liga",    goals: 60, assists: 26, apps: 50, goalsByComp: { league: 46, ucl: 8,  cups: 6 } },
    { season: "13/14", club: "Barcelona",   league: "La Liga",    goals: 41, assists: 15, apps: 46, goalsByComp: { league: 28, ucl: 10, cups: 3 } },
    { season: "14/15", club: "Barcelona",   league: "La Liga",    goals: 58, assists: 27, apps: 57, goalsByComp: { league: 43, ucl: 10, cups: 5 } },
    { season: "15/16", club: "Barcelona",   league: "La Liga",    goals: 41, assists: 23, apps: 49, goalsByComp: { league: 26, ucl: 6,  cups: 9 } },
    { season: "16/17", club: "Barcelona",   league: "La Liga",    goals: 54, assists: 16, apps: 52, goalsByComp: { league: 37, ucl: 11, cups: 6 } },
    { season: "17/18", club: "Barcelona",   league: "La Liga",    goals: 45, assists: 18, apps: 54, goalsByComp: { league: 34, ucl: 6,  cups: 5 } },
    { season: "18/19", club: "Barcelona",   league: "La Liga",    goals: 51, assists: 22, apps: 50, goalsByComp: { league: 36, ucl: 12, cups: 3 } },
    { season: "19/20", club: "Barcelona",   league: "La Liga",    goals: 31, assists: 27, apps: 44, goalsByComp: { league: 25, ucl: 3,  cups: 3 } },
    { season: "20/21", club: "Barcelona",   league: "La Liga",    goals: 38, assists: 14, apps: 47, goalsByComp: { league: 30, ucl: 5,  cups: 3 } },
    { season: "21/22", club: "PSG",         league: "Ligue 1",    goals: 11, assists: 15, apps: 34, goalsByComp: { league: 9,  ucl: 0,  cups: 2 } },
    { season: "22/23", club: "PSG",         league: "Ligue 1",    goals: 21, assists: 20, apps: 41, goalsByComp: { league: 16, ucl: 1,  cups: 4 } },
    { season: "23/24", club: "Inter Miami", league: "MLS",        goals: 18, assists: 12, apps: 19, goalsByComp: { league: 18, ucl: 0,  cups: 0 } },
    { season: "24/25", club: "Inter Miami", league: "MLS",        goals: 22, assists: 14, apps: 36, goalsByComp: { league: 22, ucl: 0,  cups: 0 } },
    { season: "25/26", club: "Inter Miami", league: "MLS",        goals: 16, assists: 10, apps: 30, goalsByComp: { league: 16, ucl: 0,  cups: 0 } },
  ],
  awards: [
    { year: 2009, type: "ballon_dor",  label: "Ballon d'Or #1", detail: "27 PL goals, treble winner" },
    { year: 2010, type: "ballon_dor",  label: "Ballon d'Or #2", detail: "34 La Liga goals" },
    { year: 2010, type: "golden_boot", label: "La Liga Top Scorer", detail: "34 goals" },
    { year: 2011, type: "ballon_dor",  label: "Ballon d'Or #3", detail: "50 La Liga goals" },
    { year: 2011, type: "golden_boot", label: "Pichichi", detail: "50 goals — La Liga record" },
    { year: 2012, type: "ballon_dor",  label: "Ballon d'Or #4", detail: "73 goals in a calendar year" },
    { year: 2012, type: "golden_boot", label: "Pichichi", detail: "50 La Liga goals" },
    { year: 2014, type: "top_scorer",  label: "WC Golden Ball", detail: "Lost final to Germany 0-1" },
    { year: 2015, type: "ballon_dor",  label: "Ballon d'Or #5", detail: "43 league + UCL treble" },
    { year: 2019, type: "ballon_dor",  label: "Ballon d'Or #6", detail: "36 La Liga goals" },
    { year: 2019, type: "golden_boot", label: "Pichichi", detail: "36 goals" },
    { year: 2021, type: "ballon_dor",  label: "Ballon d'Or #7", detail: "Copa America winner" },
    { year: 2021, type: "tournament",  label: "Copa America", detail: "Won vs Brazil — first major intl title" },
    { year: 2022, type: "tournament",  label: "World Cup", detail: "2G in final vs France, Golden Ball + Boot" },
    { year: 2023, type: "ballon_dor",  label: "Ballon d'Or #8", detail: "Most ever — WC winner bonus" },
    { year: 2024, type: "tournament",  label: "Copa America", detail: "2nd Copa America title" },
  ],
  bigMatches: [
    { event: "UCL Final",      year: 2009, opponent: "Man United",  goals: 1, assists: 0, result: "W", score: "2–0" },
    { event: "UCL Final",      year: 2011, opponent: "Man United",  goals: 1, assists: 0, result: "W", score: "3–1" },
    { event: "UCL Final",      year: 2015, opponent: "Juventus",    goals: 1, assists: 0, result: "W", score: "3–1" },
    { event: "WC Quarter-Final",year:2006, opponent: "Germany",     goals: 0, assists: 1, result: "W", score: "3–0" },
    { event: "WC Semi-Final",  year: 2010, opponent: "Germany",     goals: 0, assists: 0, result: "L", score: "0–4" },
    { event: "WC Final",       year: 2014, opponent: "Germany",     goals: 0, assists: 0, result: "L", score: "0–1", note: "Golden Ball" },
    { event: "Copa Final",     year: 2021, opponent: "Brazil",      goals: 0, assists: 1, result: "W", score: "1–0", note: "First major intl title" },
    { event: "WC Final",       year: 2022, opponent: "France",      goals: 2, assists: 0, result: "W", score: "3–3 (pens)", note: "Golden Ball + Boot" },
    { event: "Copa Final",     year: 2024, opponent: "Colombia",    goals: 0, assists: 0, result: "W", score: "1–0" },
    { event: "El Clásico",     year: 2017, opponent: "Real Madrid", goals: 3, assists: 1, result: "W", score: "6–1", note: "Career best Clásico (26G total)" },
  ],
};

// ── Ronaldo ───────────────────────────────────────────────────────────────────

export const ronaldoCareer: CareerPlayer = {
  id: "ronaldo",
  name: "Cristiano Ronaldo",
  shortName: "CR7",
  nationality: "Portugal",
  position: "FWD",
  ballonerDors: 5,
  uclTitles: 5,
  seasons: [
    { season: "02/03", club: "Sporting CP", league: "Primeira Liga", goals: 5,  assists: 4,  apps: 31, goalsByComp: { league: 3,  ucl: 1,  cups: 1 } },
    { season: "03/04", club: "Man United",  league: "Premier League",goals: 4,  assists: 6,  apps: 40, goalsByComp: { league: 4,  ucl: 0,  cups: 0 } },
    { season: "04/05", club: "Man United",  league: "Premier League",goals: 9,  assists: 8,  apps: 50, goalsByComp: { league: 8,  ucl: 1,  cups: 0 } },
    { season: "05/06", club: "Man United",  league: "Premier League",goals: 12, assists: 9,  apps: 47, goalsByComp: { league: 9,  ucl: 3,  cups: 0 } },
    { season: "06/07", club: "Man United",  league: "Premier League",goals: 23, assists: 13, apps: 53, goalsByComp: { league: 17, ucl: 3,  cups: 3 } },
    { season: "07/08", club: "Man United",  league: "Premier League",goals: 42, assists: 20, apps: 49, goalsByComp: { league: 31, ucl: 8,  cups: 3 } },
    { season: "08/09", club: "Man United",  league: "Premier League",goals: 26, assists: 12, apps: 53, goalsByComp: { league: 18, ucl: 4,  cups: 4 } },
    { season: "09/10", club: "Real Madrid", league: "La Liga",        goals: 33, assists: 12, apps: 35, goalsByComp: { league: 26, ucl: 7,  cups: 0 } },
    { season: "10/11", club: "Real Madrid", league: "La Liga",        goals: 53, assists: 16, apps: 54, goalsByComp: { league: 40, ucl: 6,  cups: 7 } },
    { season: "11/12", club: "Real Madrid", league: "La Liga",        goals: 60, assists: 21, apps: 55, goalsByComp: { league: 50, ucl: 10, cups: 0 } },
    { season: "12/13", club: "Real Madrid", league: "La Liga",        goals: 55, assists: 13, apps: 55, goalsByComp: { league: 34, ucl: 12, cups: 9 } },
    { season: "13/14", club: "Real Madrid", league: "La Liga",        goals: 51, assists: 17, apps: 52, goalsByComp: { league: 31, ucl: 17, cups: 3 } },
    { season: "14/15", club: "Real Madrid", league: "La Liga",        goals: 61, assists: 18, apps: 54, goalsByComp: { league: 48, ucl: 10, cups: 3 } },
    { season: "15/16", club: "Real Madrid", league: "La Liga",        goals: 51, assists: 18, apps: 48, goalsByComp: { league: 35, ucl: 16, cups: 0 } },
    { season: "16/17", club: "Real Madrid", league: "La Liga",        goals: 42, assists: 18, apps: 56, goalsByComp: { league: 25, ucl: 12, cups: 5 } },
    { season: "17/18", club: "Real Madrid", league: "La Liga",        goals: 44, assists: 17, apps: 44, goalsByComp: { league: 26, ucl: 15, cups: 3 } },
    { season: "18/19", club: "Juventus",    league: "Serie A",        goals: 28, assists: 10, apps: 43, goalsByComp: { league: 21, ucl: 6,  cups: 1 } },
    { season: "19/20", club: "Juventus",    league: "Serie A",        goals: 37, assists: 5,  apps: 46, goalsByComp: { league: 31, ucl: 4,  cups: 2 } },
    { season: "20/21", club: "Juventus",    league: "Serie A",        goals: 36, assists: 4,  apps: 44, goalsByComp: { league: 29, ucl: 4,  cups: 3 } },
    { season: "21/22", club: "Man United",  league: "Premier League", goals: 24, assists: 3,  apps: 39, goalsByComp: { league: 18, ucl: 3,  cups: 3 } },
    { season: "22/23", club: "Al-Nassr",    league: "Saudi Pro",      goals: 14, assists: 3,  apps: 16, goalsByComp: { league: 13, ucl: 0,  cups: 1 } },
    { season: "23/24", club: "Al-Nassr",    league: "Saudi Pro",      goals: 50, assists: 11, apps: 49, goalsByComp: { league: 42, ucl: 0,  cups: 8 } },
    { season: "24/25", club: "Al-Nassr",    league: "Saudi Pro",      goals: 40, assists: 9,  apps: 45, goalsByComp: { league: 33, ucl: 0,  cups: 7 } },
    { season: "25/26", club: "Al-Nassr",    league: "Saudi Pro",      goals: 27, assists: 6,  apps: 38, goalsByComp: { league: 23, ucl: 0,  cups: 4 } },
  ],
  awards: [
    { year: 2007, type: "top_scorer",  label: "PL Top Scorer", detail: "17 goals — first major scoring title" },
    { year: 2008, type: "ballon_dor",  label: "Ballon d'Or #1", detail: "42 goals, PL Golden Boot (31), UCL winner" },
    { year: 2008, type: "golden_boot", label: "PL Golden Boot", detail: "31 Premier League goals" },
    { year: 2008, type: "ucl_title",   label: "UCL Title #1", detail: "Man United beat Chelsea on pens" },
    { year: 2013, type: "ballon_dor",  label: "Ballon d'Or #2", detail: "55 goals — Ribery denied him the year before" },
    { year: 2014, type: "ballon_dor",  label: "Ballon d'Or #3", detail: "Pichichi + UCL record 17 goals" },
    { year: 2014, type: "ucl_title",   label: "UCL Title #2", detail: "La Décima — RM beat Atlético 4-1 AET" },
    { year: 2014, type: "top_scorer",  label: "UCL Record", detail: "17 UCL goals — tournament record at the time" },
    { year: 2015, type: "golden_boot", label: "Pichichi", detail: "48 La Liga goals" },
    { year: 2016, type: "ballon_dor",  label: "Ballon d'Or #4", detail: "Euro 2016 winner + UCL" },
    { year: 2016, type: "ucl_title",   label: "UCL Title #3", detail: "RM beat Atlético on pens" },
    { year: 2016, type: "tournament",  label: "Euro 2016", detail: "Portugal beat France 1-0 AET — first major intl title" },
    { year: 2017, type: "ballon_dor",  label: "Ballon d'Or #5", detail: "44 goals, UCL + La Liga double" },
    { year: 2017, type: "ucl_title",   label: "UCL Title #4", detail: "RM beat Juventus 4-1" },
    { year: 2018, type: "ucl_title",   label: "UCL Title #5", detail: "RM beat Liverpool 3-1 — unique 3-in-a-row" },
    { year: 2019, type: "tournament",  label: "Nations League", detail: "Portugal beat Netherlands 1-0" },
    { year: 2021, type: "top_scorer",  label: "All-time UCL scorer", detail: "Surpassed Raúl's record — 130+ UCL goals" },
    { year: 2023, type: "top_scorer",  label: "900 Career Goals", detail: "First player to reach 900 club + international goals" },
  ],
  bigMatches: [
    { event: "UCL Final",      year: 2008, opponent: "Chelsea",     goals: 0, assists: 0, result: "W", score: "1–1 (pens)", note: "UCL Title #1 with Man United" },
    { event: "UCL Final",      year: 2014, opponent: "Atlético",    goals: 1, assists: 0, result: "W", score: "4–1 AET",    note: "La Décima — equalized 93'" },
    { event: "UCL Final",      year: 2016, opponent: "Atlético",    goals: 1, assists: 0, result: "W", score: "1–1 (pens)", note: "Scored in final + clinching pen" },
    { event: "UCL Final",      year: 2017, opponent: "Juventus",    goals: 1, assists: 0, result: "W", score: "4–1" },
    { event: "UCL Final",      year: 2018, opponent: "Liverpool",   goals: 0, assists: 0, result: "W", score: "3–1",        note: "3 UCL titles in a row" },
    { event: "WC Quarter-Final",year:2006, opponent: "England",     goals: 0, assists: 0, result: "W", score: "0–0 (pens)", note: "Scored winning penalty" },
    { event: "Euro Final",     year: 2004, opponent: "Greece",      goals: 0, assists: 0, result: "L", score: "0–1",        note: "Host nation Portugal stunned" },
    { event: "Euro Final",     year: 2016, opponent: "France",      goals: 0, assists: 0, result: "W", score: "1–0 AET",    note: "Injured 25' — coached from touchline" },
    { event: "Nations League Final",year:2019,opponent:"Netherlands",goals:0,assists:1, result:"W", score:"1–0" },
    { event: "El Clásico",     year: 2012, opponent: "Barcelona",   goals: 3, assists: 0, result: "W", score: "2–1",        note: "Hat-trick — career Clásico: 18G total" },
  ],
};

// ── AMM price simulation ──────────────────────────────────────────────────────
// Stock-graph model: each season the price goes UP or DOWN based on how that
// season's performance compares to a neutral threshold (0.55 contributions/game).
// Hash-based noise creates season-to-season jitter so the lines zigzag like a
// real stock even when performance is steady. Average athlete sits at $5–10;
// Messi and Ronaldo start at $4 as raw teenagers and grow well above average.
//
// League discount: Saudi Pro / MLS perceived lower than elite European leagues,
// capping late-career appreciation.

export interface PricePoint {
  season: string;
  price: number;
}

// Price arc simulation — peaks at the athlete's actual best season.
// Each season's multiplier is driven by performance vs career avg so
// good seasons rise faster and poor seasons rise slower (or fall after peak).
// All prices are normalised so the peak season hits targetPeak exactly.
// The result is displayed with type="linear" + dots so every individual
// season's up/down movement is visible — stock-graph look, career-arc shape.

interface ArcSimOpts {
  seed: number;
  startPrice: number;
  targetPeak: number;
  peakSeason: string;       // season label where price must peak ("11/12" etc.)
  noiseAmp?: number;        // default 0.038 — season-to-season rate variation
  leagueMod?: Record<string, number>;
}

function simulatePriceHistoryArc(
  player: CareerPlayer,
  opts: ArcSimOpts,
): PricePoint[] {
  const { seed, startPrice, targetPeak, peakSeason, noiseAmp = 0.038, leagueMod = {} } = opts;

  const seasons = player.seasons;
  const n = seasons.length;
  const peakIdx = Math.max(0, seasons.findIndex(s => s.season === peakSeason));

  // Geometric multipliers: rise startPrice→targetPeak, fall targetPeak→endPrice
  const endPrice = startPrice * 1.6;   // end well above start — still elite
  const riseMult = Math.pow(targetPeak / startPrice, 1 / (peakIdx + 1));
  const fallMult = Math.pow(endPrice / targetPeak, 1 / Math.max(1, n - peakIdx - 1));

  let state = { basePrice: startPrice, currentPrice: startPrice };
  const history: PricePoint[] = [];

  for (let i = 0; i < n; i++) {
    const s = seasons[i];
    const isFalling = i > peakIdx;
    const arcMult = isFalling ? fallMult : riseMult;

    // Performance modulates the RATE of rise/fall within each phase
    const perf = (s.goals + s.assists * 0.4) / Math.max(1, s.apps);
    const perfNorm = Math.max(-1, Math.min(1, (perf - 0.65) / 0.80));
    const perfMod = perfNorm * Math.abs(arcMult - 1) * 0.30;

    // Hash noise — independent per season, creates visible jitter between dots
    const h = Math.sin(seed * 9301.0 + i * 49297.0 + perf * 233.0) * 98765.4321;
    const noise = (h - Math.floor(h) - 0.5) * 2.0 * noiseAmp;

    const leagueAdj = leagueMod[s.league] ?? 0;
    const raw = arcMult + perfMod + noise + leagueAdj;

    // Direction is locked: always rising before peak, always falling after
    const mult = isFalling
      ? Math.max(0.82, Math.min(0.995, raw))
      : Math.max(1.005, Math.min(1.42, raw));

    state = applyStatEvent(state, mult);
    history.push({ season: s.season, price: state.currentPrice });
  }

  // Normalise so the peak season lands at exactly targetPeak
  const maxPrice = Math.max(...history.map(p => p.price));
  const scale = targetPeak / maxPrice;
  return history.map(p => ({ season: p.season, price: Math.round(p.price * scale * 100) / 100 }));
}

// Messi's best year: 11/12 (73G — world record).  Peak price: $27.
// CR7's best year:  14/15 (61G — peak Madrid season). Peak price: $26.
// Average athlete sits at $5–10; these two peak at $26–27 — far above the rest.
export const messiPrices = simulatePriceHistoryArc(messiCareer, {
  seed: 42,
  startPrice: 4.0,
  targetPeak: 27.0,
  peakSeason: "11/12",
  noiseAmp: 0.038,
  leagueMod: { "Ligue 1": -0.014, "MLS": -0.022 },
});

export const ronaldoPrices = simulatePriceHistoryArc(ronaldoCareer, {
  seed: 7,
  startPrice: 4.0,
  targetPeak: 26.0,
  peakSeason: "14/15",
  noiseAmp: 0.038,
  leagueMod: { "Saudi Pro": -0.028 },
});

// ── Chart merge helpers ───────────────────────────────────────────────────────

export function mergeForChart(
  metric: "goals" | "assists" | "apps" | "price"
): Array<{ season: string; messi: number | null; ronaldo: number | null }> {
  const messiSeasonMap  = new Map(messiCareer.seasons.map((s) => [s.season, s]));
  const ronaldoSeasonMap = new Map(ronaldoCareer.seasons.map((s) => [s.season, s]));
  const messiPriceMap   = new Map(messiPrices.map((p) => [p.season, p.price]));
  const ronaldoPriceMap = new Map(ronaldoPrices.map((p) => [p.season, p.price]));

  const allSeasons = Array.from(
    new Set([
      ...messiCareer.seasons.map((s) => s.season),
      ...ronaldoCareer.seasons.map((s) => s.season),
    ])
  ).sort();

  return allSeasons.map((season) => {
    const m = messiSeasonMap.get(season);
    const r = ronaldoSeasonMap.get(season);
    if (metric === "price") {
      return { season, messi: messiPriceMap.get(season) ?? null, ronaldo: ronaldoPriceMap.get(season) ?? null };
    }
    return { season, messi: m ? m[metric] : null, ronaldo: r ? r[metric] : null };
  });
}

export function mergeForCompChart(player: "messi" | "ronaldo"): Array<{
  season: string;
  league: number;
  ucl: number;
  cups: number;
}> {
  const src = player === "messi" ? messiCareer : ronaldoCareer;
  return src.seasons.map((s) => ({
    season: s.season,
    league: s.goalsByComp.league,
    ucl: s.goalsByComp.ucl,
    cups: s.goalsByComp.cups,
  }));
}

export function uclTotals() {
  const messiUCL   = messiCareer.seasons.reduce((a, s) => a + s.goalsByComp.ucl, 0);
  const ronaldoUCL = ronaldoCareer.seasons.reduce((a, s) => a + s.goalsByComp.ucl, 0);
  return { messi: messiUCL, ronaldo: ronaldoUCL };
}
