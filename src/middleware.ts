import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Routes that require AAL2 (signed in + MFA verified).
 * Unauthed → /login?next=<path>. AAL1 → /auth/mfa?next=<path>.
 */
const PROTECTED_PREFIXES = ["/app", "/portfolio", "/leaderboard", "/live", "/quest"];
const PROTECTED_API_PREFIXES = ["/api/trade"];

function isProtectedPath(pathname: string): boolean {
  if (PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  if (PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  return false;
}

/**
 * Edge middleware runs on every request matched by `config.matcher`.
 *
 * Responsibilities:
 *   1. Refresh the Supabase auth cookie so server components see fresh tokens.
 *   2. Gate protected routes behind AAL2 (signed in + MFA verified).
 *   3. Apply a coarse, per-IP backstop on /api/*.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  let aal: "aal1" | "aal2" | null = null;
  let userId: string | null = null;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (toSet: { name: string; value: string; options?: CookieOptions }[]) => {
            for (const { name, value } of toSet) {
              request.cookies.set(name, value);
            }
            response = NextResponse.next({ request });
            for (const { name, value, options } of toSet) {
              response.cookies.set(name, value, options);
            }
          },
        },
      });
      // Refreshes the session if needed and propagates the cookies onto `response`.
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;

      if (user) {
        const { data: claims } = await supabase.auth.getClaims();
        aal = (claims?.claims?.aal as "aal1" | "aal2" | undefined) ?? "aal1";
      }
    } catch {
      // Fail open on session-refresh errors — gating below handles unauthed case.
    }
  }

  // AAL gate — applies to both pages and protected API routes.
  if (isProtectedPath(pathname)) {
    if (!userId) {
      // Protected API → 401 JSON. Protected page → redirect to /login.
      if (pathname.startsWith("/api/")) {
        return new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      const dest = new URL("/login", request.url);
      dest.searchParams.set("next", pathname + request.nextUrl.search);
      return NextResponse.redirect(dest);
    }
    if (aal !== "aal2") {
      if (pathname.startsWith("/api/")) {
        return new Response(JSON.stringify({ error: "mfa_required" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      const dest = new URL("/auth/mfa", request.url);
      dest.searchParams.set("next", pathname + request.nextUrl.search);
      return NextResponse.redirect(dest);
    }
  }

  // Coarse backstop on /api/* — 240 req/min per IP.
  if (pathname.startsWith("/api/")) {
    const block = await edgeBackstop(request);
    if (block) return block;
  }

  return response;
}

async function edgeBackstop(req: NextRequest): Promise<Response | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null; // missing infra → fail open in dev

  const ip =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  const key = `rl:edge:${ip}:${Math.floor(Date.now() / 60_000)}`;
  // INCR + EXPIRE in one call via Upstash REST pipeline
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, 90],
    ]),
  });
  if (!res.ok) return null; // fail open if redis is degraded
  const result = (await res.json()) as Array<{ result: number }>;
  const count = result?.[0]?.result ?? 0;

  if (count > 240) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": "60" },
    });
  }
  return null;
}

export const config = {
  matcher: [
    /*
     * Skip Next.js internals and static assets. Match everything else (so the
     * Supabase session is kept fresh on full page loads as well).
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
