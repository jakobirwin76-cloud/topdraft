import { type NextRequest, NextResponse } from "next/server";

/**
 * Edge middleware — minimal pass-through.
 *
 * Earlier versions of this file refreshed the Supabase auth cookie here. That
 * worked when env vars were absent (the Supabase call was guarded out) but
 * crashed the entire site once env vars landed on Netlify, because the
 * @supabase/ssr createServerClient call ran inside the Edge runtime and a
 * fetch/cookie/JWT error could not be safely surfaced — Netlify served
 * ERR_CONNECTION_RESET to every request.
 *
 * Session refresh now happens:
 *   - Client-side via Supabase's auto-refresh in <AuthProvider>
 *   - Server-side via getServerSupabase() inside individual server components
 *
 * Per-IP rate limiting moves to a follow-up. Per-route limiters (in each
 * handler) already cover the abuse-defense case.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match nothing for now — keeps the function bundle alive without running
    // anywhere. Re-enable broad matching when we re-add session refresh in a
    // node runtime.
    "/__never__",
  ],
};
