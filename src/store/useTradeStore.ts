"use client";

import { create } from "zustand";

/**
 * Holds the in-flight trade sheet state (the athlete the user is about to
 * buy/sell). Routed through Zustand instead of URL/state to keep the sheet
 * available across routes (Live → Athlete profile → back).
 */
interface TradeSheetState {
  open: boolean;
  athleteId: string | null;
  athleteName: string | null;
  athletePrice: number | null;
  side: "buy" | "sell";

  openSheet: (athleteId: string, athleteName: string, price: number, side?: "buy" | "sell") => void;
  closeSheet: () => void;
  setSide: (side: "buy" | "sell") => void;
}

export const useTradeStore = create<TradeSheetState>((set) => ({
  open: false,
  athleteId: null,
  athleteName: null,
  athletePrice: null,
  side: "buy",

  openSheet: (athleteId, athleteName, athletePrice, side = "buy") =>
    set({ open: true, athleteId, athleteName, athletePrice, side }),
  closeSheet: () => set({ open: false }),
  setSide: (side) => set({ side }),
}));
