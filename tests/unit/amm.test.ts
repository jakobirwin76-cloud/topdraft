import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { applyTrade, applyStatEvent, applyDecay, rollbackStatEvent } from "@/lib/pricing/amm";

const baseState = { basePrice: 100, currentPrice: 100 };

describe("applyTrade", () => {
  it("buy raises the price", () => {
    const next = applyTrade(baseState, "buy", 1000);
    expect(next.currentPrice).toBeGreaterThan(baseState.currentPrice);
  });

  it("sell lowers the price", () => {
    const next = applyTrade(baseState, "sell", 1000);
    expect(next.currentPrice).toBeLessThan(baseState.currentPrice);
  });

  it("respects the ±2% per-trade cap even on huge orders", () => {
    const next = applyTrade(baseState, "buy", 10_000_000);
    expect(next.currentPrice).toBeLessThanOrEqual(baseState.currentPrice * 1.02 + 1e-6);
  });

  it("never goes below 10% of base", () => {
    let s = baseState;
    for (let i = 0; i < 1000; i++) s = applyTrade(s, "sell", 100_000);
    expect(s.currentPrice).toBeGreaterThanOrEqual(baseState.basePrice * 0.10 - 1e-6);
  });

  it("rejects non-positive shares", () => {
    expect(() => applyTrade(baseState, "buy", 0)).toThrow();
    expect(() => applyTrade(baseState, "sell", -1)).toThrow();
    expect(() => applyTrade(baseState, "buy", Number.NaN)).toThrow();
  });

  it("property: any positive share count produces a finite, positive price", () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.0001), max: Math.fround(1_000_000), noNaN: true }),
        fc.constantFrom("buy" as const, "sell" as const),
        (shares, side) => {
          const next = applyTrade(baseState, side, shares);
          return Number.isFinite(next.currentPrice) && next.currentPrice > 0;
        },
      ),
    );
  });
});

describe("applyStatEvent", () => {
  it("multiplier > 1 raises price, < 1 lowers", () => {
    expect(applyStatEvent(baseState, 1.05).currentPrice).toBeCloseTo(105, 4);
    expect(applyStatEvent(baseState, 0.96).currentPrice).toBeCloseTo(96, 4);
  });

  it("rejects non-positive multiplier", () => {
    expect(() => applyStatEvent(baseState, 0)).toThrow();
    expect(() => applyStatEvent(baseState, -0.5)).toThrow();
  });
});

describe("rollbackStatEvent", () => {
  it("inverts a previously-applied stat event exactly", () => {
    const after = applyStatEvent(baseState, 1.05);
    const back = rollbackStatEvent(after, 1.05);
    expect(back.currentPrice).toBeCloseTo(baseState.currentPrice, 3);
  });
});

describe("applyDecay", () => {
  it("pulls toward base price over time", () => {
    const elevated = { basePrice: 100, currentPrice: 130 };
    const after = applyDecay(elevated, 100);
    expect(after.currentPrice).toBeLessThan(elevated.currentPrice);
    expect(after.currentPrice).toBeGreaterThan(elevated.basePrice);
  });

  it("zero hours is a no-op", () => {
    expect(applyDecay(baseState, 0).currentPrice).toBe(baseState.currentPrice);
  });

  it("rejects negative hours", () => {
    expect(() => applyDecay(baseState, -1)).toThrow();
  });
});
