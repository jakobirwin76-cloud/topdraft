import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export const runtime = "nodejs";

/**
 * Supabase email-verification + magic-link redirect handler. Called by Supabase
 * after the user clicks the link in their verification email — Supabase appends
 * `?code=<pkce_code>` (or `?error=...` on failure).
 *
 * Web: redirect to /auth/mfa to decide enroll vs. challenge.
 * Native (Phase 2.3): same route — Universal Links / app links will route the
 * deep link straight into this handler inside the Capacitor WebView.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  const base = env.get().NEXT_PUBLIC_APP_URL;

  if (error) {
    const dest = new URL("/login", base);
    dest.searchParams.set("error", errorDescription ?? error);
    return NextResponse.redirect(dest);
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login", base));
  }

  const sb = await getServerSupabase();
  const { error: exchangeError } = await sb.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    const dest = new URL("/login", base);
    dest.searchParams.set("error", "Could not verify your email. Try logging in.");
    return NextResponse.redirect(dest);
  }

  return NextResponse.redirect(new URL("/auth/mfa", base));
}
