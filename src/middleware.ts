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
 * Per-IP rate limiting moves to per-route limiters (already in each handler).
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match nothing — keeps the function bundle alive without ever running.
    // Re-enable matching when we re-introduce session refresh in node runtime.
    "/__never__",
  ],
};
