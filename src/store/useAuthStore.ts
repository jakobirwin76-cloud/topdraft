"use client";

import { create } from "zustand";

/**
 * Client-side auth state. The source of truth is the Supabase session cookie
 * (refreshed by middleware); this store mirrors it for UI access.
 *
 * Set from a top-level <AuthProvider> client component that hydrates via
 * /api/auth/session and subscribes to supabase.auth.onAuthStateChange.
 *
 * `user` is intentionally a minimal shape — we only need id + email in the UI.
 */
export interface AuthUser {
  id: string;
  email: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  profile: AuthProfile | null;
  aalLevel: "aal1" | "aal2" | null;
  isLoading: boolean;

  setUser: (user: AuthUser | null) => void;
  setProfile: (profile: AuthProfile | null) => void;
  setAal: (aal: AuthState["aalLevel"]) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export interface AuthProfile {
  user_id: string;
  display_name: string;
  virtual_balance: number;
  mfa_enrolled: boolean;
  archetype_primary?: string | null;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  aalLevel: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setAal: (aalLevel) => set({ aalLevel }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, profile: null, aalLevel: null, isLoading: false }),
}));
