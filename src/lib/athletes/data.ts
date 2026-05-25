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
  burrow: {
    slug: "burrow",
    sport: "NFL", league: "NFL", position: "QB",
    name: "Joe Burrow", initials: "JB",
    team: "Cincinnati Bengals", teamCode: "CIN",
    basePrice: 14, initialPrice: 18.2,
  },
  lamar: {
    slug: "lamar",
    sport: "NFL", league: "NFL", position: "QB",
    name: "Lamar Jackson", initials: "LJ",
    team: "Baltimore Ravens", teamCode: "BAL",
    basePrice: 16, initialPrice: 21.5,
  },
  stroud: {
    slug: "stroud",
    sport: "NFL", league: "NFL", position: "QB",
    name: "C.J. Stroud", initials: "CS",
    team: "Houston Texans", teamCode: "HOU",
    basePrice: 13, initialPrice: 16.4,
  },
  hurts: {
    slug: "hurts",
    sport: "NFL", league: "NFL", position: "QB",
    name: "Jalen Hurts", initials: "JH",
    team: "Philadelphia Eagles", teamCode: "PHI",
    basePrice: 14, initialPrice: 17.8,
  },
  saquon: {
    slug: "saquon",
    sport: "NFL", league: "NFL", position: "RB",
    name: "Saquon Barkley", initials: "SB",
    team: "Philadelphia Eagles", teamCode: "PHI",
    basePrice: 14, initialPrice: 19.2,
  },
  tyreek: {
    slug: "tyreek",
    sport: "NFL", league: "NFL", position: "WR",
    name: "Tyreek Hill", initials: "TH",
    team: "Miami Dolphins", teamCode: "MIA",
    basePrice: 16, initialPrice: 20.4,
  },
  ceedee: {
    slug: "ceedee",
    sport: "NFL", league: "NFL", position: "WR",
    name: "CeeDee Lamb", initials: "CL",
    team: "Dallas Cowboys", teamCode: "DAL",
    basePrice: 14, initialPrice: 17.6,
  },
  bowers: {
    slug: "bowers",
    sport: "NFL", league: "NFL", position: "TE",
    name: "Brock Bowers", initials: "BB",
    team: "Las Vegas Raiders", teamCode: "LV",
    basePrice: 12, initialPrice: 15.8,
  },
  parsons: {
    slug: "parsons",
    sport: "NFL", league: "NFL", position: "DL",
    name: "Micah Parsons", initials: "MP",
    team: "Dallas Cowboys", teamCode: "DAL",
    basePrice: 13, initialPrice: 16.5,
  },
  tjwatt: {
    slug: "tjwatt",
    sport: "NFL", league: "NFL", position: "DL",
    name: "T.J. Watt", initials: "TW",
    team: "Pittsburgh Steelers", teamCode: "PIT",
    basePrice: 12, initialPrice: 14.8,
  },
  surtain: {
    slug: "surtain",
    sport: "NFL", league: "NFL", position: "CB",
    name: "Patrick Surtain II", initials: "PS",
    team: "Denver Broncos", teamCode: "DEN",
    basePrice: 11, initialPrice: 13.2,
  },
  trentwilliams: {
    slug: "trentwilliams",
    sport: "NFL", league: "NFL", position: "OL",
    name: "Trent Williams", initials: "TW",
    team: "San Francisco 49ers", teamCode: "SF",
    basePrice: 9, initialPrice: 10.5,
  },
  hutchinson: {
    slug: "hutchinson",
    sport: "NFL", league: "NFL", position: "DL",
    name: "Aidan Hutchinson", initials: "AH",
    team: "Detroit Lions", teamCode: "DET",
    basePrice: 11, initialPrice: 13.6,
  },
  jaydendaniels: {
    slug: "jaydendaniels",
    sport: "NFL", league: "NFL", position: "QB",
    name: "Jayden Daniels", initials: "JD",
    team: "Washington Commanders", teamCode: "WAS",
    basePrice: 14, initialPrice: 17.6,
  },
  calebwilliams: {
    slug: "calebwilliams",
    sport: "NFL", league: "NFL", position: "QB",
    name: "Caleb Williams", initials: "CW",
    team: "Chicago Bears", teamCode: "CHI",
    basePrice: 13, initialPrice: 15.4,
  },
  bijan: {
    slug: "bijan",
    sport: "NFL", league: "NFL", position: "RB",
    name: "Bijan Robinson", initials: "BR",
    team: "Atlanta Falcons", teamCode: "ATL",
    basePrice: 13, initialPrice: 16.9,
  },
  harrisonjr: {
    slug: "harrisonjr",
    sport: "NFL", league: "NFL", position: "WR",
    name: "Marvin Harrison Jr.", initials: "MH",
    team: "Arizona Cardinals", teamCode: "ARI",
    basePrice: 12, initialPrice: 14.8,
  },
  // ── SOCCER ─────────────────────────────────────────────────────────
  haaland: {
    slug: "haaland",
    sport: "SOCCER", league: "Premier League", position: "ST",
    name: "Erling Haaland", initials: "EH",
    team: "Manchester City", teamCode: "MCI",
    basePrice: 18, initialPrice: 22.31,
  },
  yamal: {
    slug: "yamal",
    sport: "SOCCER", league: "La Liga", position: "RW",
    name: "Lamine Yamal", initials: "LY",
    team: "FC Barcelona", teamCode: "BAR",
    basePrice: 16, initialPrice: 22.5,
  },
  bellingham: {
    slug: "bellingham",
    sport: "SOCCER", league: "La Liga", position: "MF",
    name: "Jude Bellingham", initials: "JB",
    team: "Real Madrid", teamCode: "RMA",
    basePrice: 17, initialPrice: 21.8,
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
  mbappe: {
    slug: "mbappe",
    sport: "SOCCER", league: "La Liga", position: "ST",
    name: "Kylian Mbappé", initials: "KM",
    team: "Real Madrid", teamCode: "RMA",
    basePrice: 25, initialPrice: 31.0,
  },
  vinicius: {
    slug: "vinicius",
    sport: "SOCCER", league: "La Liga", position: "LW",
    name: "Vinícius Júnior", initials: "VJ",
    team: "Real Madrid", teamCode: "RMA",
    basePrice: 22, initialPrice: 27.0,
  },
  wirtz: {
    slug: "wirtz",
    sport: "SOCCER", league: "Premier League", position: "MF",
    name: "Florian Wirtz", initials: "FW",
    team: "Liverpool", teamCode: "LIV",
    basePrice: 18, initialPrice: 23.2,
  },
  musiala: {
    slug: "musiala",
    sport: "SOCCER", league: "Bundesliga", position: "MF",
    name: "Jamal Musiala", initials: "JM",
    team: "Bayern Munich", teamCode: "BAY",
    basePrice: 19, initialPrice: 24.0,
  },
  pedri: {
    slug: "pedri",
    sport: "SOCCER", league: "La Liga", position: "MF",
    name: "Pedri", initials: "PE",
    team: "FC Barcelona", teamCode: "BAR",
    basePrice: 16, initialPrice: 19.8,
  },
  gavi: {
    slug: "gavi",
    sport: "SOCCER", league: "La Liga", position: "MF",
    name: "Gavi", initials: "GV",
    team: "FC Barcelona", teamCode: "BAR",
    basePrice: 13, initialPrice: 16.2,
  },
  cubarsi: {
    slug: "cubarsi",
    sport: "SOCCER", league: "La Liga", position: "DF",
    name: "Pau Cubarsí", initials: "PC",
    team: "FC Barcelona", teamCode: "BAR",
    basePrice: 11, initialPrice: 14.5,
  },
  saka: {
    slug: "saka",
    sport: "SOCCER", league: "Premier League", position: "RW",
    name: "Bukayo Saka", initials: "BS",
    team: "Arsenal", teamCode: "ARS",
    basePrice: 19, initialPrice: 23.5,
  },
  foden: {
    slug: "foden",
    sport: "SOCCER", league: "Premier League", position: "MF",
    name: "Phil Foden", initials: "PF",
    team: "Manchester City", teamCode: "MCI",
    basePrice: 18, initialPrice: 22.0,
  },
  palmer: {
    slug: "palmer",
    sport: "SOCCER", league: "Premier League", position: "MF",
    name: "Cole Palmer", initials: "CP",
    team: "Chelsea", teamCode: "CHE",
    basePrice: 16, initialPrice: 19.5,
  },
  nicowilliams: {
    slug: "nicowilliams",
    sport: "SOCCER", league: "La Liga", position: "LW",
    name: "Nico Williams", initials: "NW",
    team: "Athletic Club", teamCode: "ATH",
    basePrice: 14, initialPrice: 17.6,
  },
  doue: {
    slug: "doue",
    sport: "SOCCER", league: "Ligue 1", position: "RW",
    name: "Désiré Doué", initials: "DD",
    team: "Paris Saint-Germain", teamCode: "PSG",
    basePrice: 13, initialPrice: 16.8,
  },
  dembele: {
    slug: "dembele",
    sport: "SOCCER", league: "Ligue 1", position: "RW",
    name: "Ousmane Dembélé", initials: "OD",
    team: "Paris Saint-Germain", teamCode: "PSG",
    basePrice: 16, initialPrice: 21.2,
  },
  pulisic: {
    slug: "pulisic",
    sport: "SOCCER", league: "Serie A", position: "MF",
    name: "Christian Pulisic", initials: "CP",
    team: "AC Milan", teamCode: "MIL",
    basePrice: 13, initialPrice: 16.4,
  },
  tchouameni: {
    slug: "tchouameni",
    sport: "SOCCER", league: "La Liga", position: "MF",
    name: "Aurélien Tchouaméni", initials: "AT",
    team: "Real Madrid", teamCode: "RMA",
    basePrice: 15, initialPrice: 18.2,
  },
  rudiger: {
    slug: "rudiger",
    sport: "SOCCER", league: "La Liga", position: "DF",
    name: "Antonio Rüdiger", initials: "AR",
    team: "Real Madrid", teamCode: "RMA",
    basePrice: 9, initialPrice: 10.8,
  },
  kimmich: {
    slug: "kimmich",
    sport: "SOCCER", league: "Bundesliga", position: "MF",
    name: "Joshua Kimmich", initials: "JK",
    team: "Bayern Munich", teamCode: "BAY",
    basePrice: 14, initialPrice: 17.4,
  },
  brunofernandes: {
    slug: "brunofernandes",
    sport: "SOCCER", league: "Premier League", position: "MF",
    name: "Bruno Fernandes", initials: "BF",
    team: "Manchester United", teamCode: "MUN",
    basePrice: 16, initialPrice: 19.5,
  },
  maignan: {
    slug: "maignan",
    sport: "SOCCER", league: "Serie A", position: "GK",
    name: "Mike Maignan", initials: "MM",
    team: "AC Milan", teamCode: "MIL",
    basePrice: 11, initialPrice: 13.8,
  },
  // ── NBA ────────────────────────────────────────────────────────────
  sga: {
    slug: "sga",
    sport: "NBA", league: "NBA", position: "SG",
    name: "Shai Gilgeous-Alexander", initials: "SG",
    team: "Oklahoma City Thunder", teamCode: "OKC",
    basePrice: 20, initialPrice: 25.8,
  },
  wemby: {
    slug: "wemby",
    sport: "NBA", league: "NBA", position: "C",
    name: "Victor Wembanyama", initials: "VW",
    team: "San Antonio Spurs", teamCode: "SAS",
    basePrice: 19, initialPrice: 24.2,
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
  tatum: {
    slug: "tatum",
    sport: "NBA", league: "NBA", position: "SF",
    name: "Jayson Tatum", initials: "JT",
    team: "Boston Celtics", teamCode: "BOS",
    basePrice: 19, initialPrice: 23.5,
  },
  jaylenbrown: {
    slug: "jaylenbrown",
    sport: "NBA", league: "NBA", position: "SG",
    name: "Jaylen Brown", initials: "JB",
    team: "Boston Celtics", teamCode: "BOS",
    basePrice: 14, initialPrice: 17.2,
  },
  mitchell: {
    slug: "mitchell",
    sport: "NBA", league: "NBA", position: "SG",
    name: "Donovan Mitchell", initials: "DM",
    team: "Cleveland Cavaliers", teamCode: "CLE",
    basePrice: 14, initialPrice: 17.6,
  },
  brunson: {
    slug: "brunson",
    sport: "NBA", league: "NBA", position: "PG",
    name: "Jalen Brunson", initials: "JB",
    team: "New York Knicks", teamCode: "NYK",
    basePrice: 15, initialPrice: 18.4,
  },
  trae: {
    slug: "trae",
    sport: "NBA", league: "NBA", position: "PG",
    name: "Trae Young", initials: "TY",
    team: "Atlanta Hawks", teamCode: "ATL",
    basePrice: 12, initialPrice: 14.6,
  },
  booker: {
    slug: "booker",
    sport: "NBA", league: "NBA", position: "SG",
    name: "Devin Booker", initials: "DB",
    team: "Phoenix Suns", teamCode: "PHX",
    basePrice: 16, initialPrice: 19.8,
  },
  luka: {
    slug: "luka",
    sport: "NBA", league: "NBA", position: "PG",
    name: "Luka Dončić", initials: "LD",
    team: "Los Angeles Lakers", teamCode: "LAL",
    basePrice: 22, initialPrice: 28.4,
  },
  kd: {
    slug: "kd",
    sport: "NBA", league: "NBA", position: "SF",
    name: "Kevin Durant", initials: "KD",
    team: "Houston Rockets", teamCode: "HOU",
    basePrice: 17, initialPrice: 21.0,
  },
  ad: {
    slug: "ad",
    sport: "NBA", league: "NBA", position: "PF",
    name: "Anthony Davis", initials: "AD",
    team: "Dallas Mavericks", teamCode: "DAL",
    basePrice: 16, initialPrice: 19.5,
  },
  haliburton: {
    slug: "haliburton",
    sport: "NBA", league: "NBA", position: "PG",
    name: "Tyrese Haliburton", initials: "TH",
    team: "Indiana Pacers", teamCode: "IND",
    basePrice: 14, initialPrice: 17.4,
  },
  lamelo: {
    slug: "lamelo",
    sport: "NBA", league: "NBA", position: "PG",
    name: "LaMelo Ball", initials: "LB",
    team: "Charlotte Hornets", teamCode: "CHA",
    basePrice: 11, initialPrice: 14.0,
  },
  cade: {
    slug: "cade",
    sport: "NBA", league: "NBA", position: "PG",
    name: "Cade Cunningham", initials: "CC",
    team: "Detroit Pistons", teamCode: "DET",
    basePrice: 12, initialPrice: 15.6,
  },
  banchero: {
    slug: "banchero",
    sport: "NBA", league: "NBA", position: "PF",
    name: "Paolo Banchero", initials: "PB",
    team: "Orlando Magic", teamCode: "ORL",
    basePrice: 14, initialPrice: 18.0,
  },
  jjj: {
    slug: "jjj",
    sport: "NBA", league: "NBA", position: "PF",
    name: "Jaren Jackson Jr.", initials: "JJ",
    team: "Memphis Grizzlies", teamCode: "MEM",
    basePrice: 12, initialPrice: 14.5,
  },
  ja: {
    slug: "ja",
    sport: "NBA", league: "NBA", position: "PG",
    name: "Ja Morant", initials: "JM",
    team: "Memphis Grizzlies", teamCode: "MEM",
    basePrice: 13, initialPrice: 16.6,
  },
  dame: {
    slug: "dame",
    sport: "NBA", league: "NBA", position: "PG",
    name: "Damian Lillard", initials: "DL",
    team: "Milwaukee Bucks", teamCode: "MIL",
    basePrice: 13, initialPrice: 15.8,
  },
  kat: {
    slug: "kat",
    sport: "NBA", league: "NBA", position: "C",
    name: "Karl-Anthony Towns", initials: "KT",
    team: "New York Knicks", teamCode: "NYK",
    basePrice: 15, initialPrice: 18.4,
  },
  markkanen: {
    slug: "markkanen",
    sport: "NBA", league: "NBA", position: "PF",
    name: "Lauri Markkanen", initials: "LM",
    team: "Utah Jazz", teamCode: "UTA",
    basePrice: 11, initialPrice: 13.6,
  },
  zion: {
    slug: "zion",
    sport: "NBA", league: "NBA", position: "PF",
    name: "Zion Williamson", initials: "ZW",
    team: "New Orleans Pelicans", teamCode: "NOP",
    basePrice: 13, initialPrice: 16.8,
  },
  herro: {
    slug: "herro",
    sport: "NBA", league: "NBA", position: "SG",
    name: "Tyler Herro", initials: "TH",
    team: "Miami Heat", teamCode: "MIA",
    basePrice: 11, initialPrice: 13.8,
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
