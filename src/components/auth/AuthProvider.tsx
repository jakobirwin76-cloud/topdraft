"use client";

import { useEffect } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useAuthStore, type AuthProfile } from "@/store/useAuthStore";

interface SessionResponse {
  user: { id: string; email: string | null } | null;
  profile: AuthProfile | null;
  aal: "aal1" | "aal2" | null;
}

async function fetchSession(): Promise<SessionResponse | null> {
  try {
    const res = await fetch("/api/auth/session", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as SessionResponse;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setAal = useAuthStore((s) => s.setAal);
  const setLoading = useAuthStore((s) => s.setLoading);
  const reset = useAuthStore((s) => s.reset);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const session = await fetchSession();
      if (cancelled) return;
      if (!session || !session.user) {
        reset();
        return;
      }
      setUser({
        id: session.user.id,
        email: session.user.email,
      });
      setProfile(session.profile);
      setAal(session.aal);
      setLoading(false);
    }

    hydrate();

    // Skip the realtime auth listener when env isn't configured (preview /
    // local dev without .env.local). hydrate() above will have flipped loading
    // off via /api/auth/session.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return () => {
        cancelled = true;
      };
    }

    const supabase = getBrowserSupabase();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED" ||
        event === "MFA_CHALLENGE_VERIFIED"
      ) {
        hydrate();
      } else if (event === "SIGNED_OUT") {
        reset();
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [setUser, setProfile, setAal, setLoading, reset]);

  return <>{children}</>;
}
