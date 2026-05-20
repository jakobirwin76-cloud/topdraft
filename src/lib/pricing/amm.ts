/**
 * Pure-function pricing engine. Mirrors the SQL implementation in
 * supabase/migrations/0003_functions.sql. Used in tests and for client-side
 * preview ("if you buy 50, the new price is roughly $X").
 *
 * Single source of truth: the SQL version is authoritative. This module
 * exists for unit testing and UI estimates only.
 */

export type Side = "buy" | "sell";

export interface PriceState {
  basePrice: number;
  currentPrice: number;
}

const MAX_TRADE_IMPACT = 0.02; // ±2% per single trade
const PRICE_FLOOR_RATIO = 0.10; // never below 10% of base
const SHARES_PER_PERCENT = 1000.0; // 1000 shares ≈ 0.4% impact at default sensitivity
const SENSITIVITY = 0.004;

export function applyTrade(state: PriceState, side: Side, shares: number): PriceState {
  if (!Number.isFinite(shares) || shares <= 0) {
    throw new Error("shares must be a positive finite number");
  }
  const rawImpact = (shares / SHARES_PER_PERCENT) * SENSITIVITY;
  const impact = side === "buy" ? Math.min(MAX_TRADE_IMPACT, rawImpact) : -Math.min(MAX_TRADE_IMPACT, rawImpact);

  const candidate = state.currentPrice * (1 + impact);
  const floor = state.basePrice * PRICE_FLOOR_RATIO;
  return {
    ...state,
    currentPrice: round4(Math.max(floor, candidate)),
  };
}

export function applyStatEvent(state: PriceState, multiplier: number): PriceState {
  if (!Number.isFinite(multiplier) || multiplier <= 0) {
    throw new Error("multiplier must be a positive finite number");
  }
  const candidate = state.currentPrice * multiplier;
  const floor = state.basePrice * PRICE_FLOOR_RATIO;
  return {
    ...state,
    currentPrice: round4(Math.max(floor, candidate)),
  };
}

/**
 * Off-season decay: prices drift toward base over time.
 * Pulls (currentPrice − basePrice) × decayRatePerHour toward zero.
 */
export function applyDecay(state: PriceState, hours: number, decayRatePerHour = 0.001): PriceState {
  if (!Number.isFinite(hours) || hours < 0) {
    throw new Error("hours must be a non-negative finite number");
  }
  const drift = (state.basePrice - state.currentPrice) * Math.min(1, hours * decayRatePerHour);
  return {
    ...state,
    currentPrice: round4(state.currentPrice + drift),
  };
}

/**
 * Inverse of applyStatEvent — used by the rollback path when SportsRadar
 * issues a correction within the 60-minute window described in the ToS.
 */
export function rollbackStatEvent(state: PriceState, multiplier: number): PriceState {
  if (!Number.isFinite(multiplier) || multiplier <= 0) {
    throw new Error("multiplier must be a positive finite number");
  }
  return {
    ...state,
    currentPrice: round4(state.currentPrice / multiplier),
  };
}

function round4(n: number): number {
  return Math.round(n * 10_000) / 10_000;
}
