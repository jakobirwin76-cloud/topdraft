import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Edge middleware runs on every request matched by `config.matcher`.
 *
 * Responsibilities:
 *   1. Refresh the Supabase auth cookie so server components see fresh tokens.
 *   2. Apply a coarse, per-IP backstop on /api/* (every route additionally
 *      enforces its own per-user limiter inside the handler).
 *
 * Note: the @upstash/ratelimit SDK uses a Node fetch impl; we keep middleware
 * on the default (Edge) runtime by restricting it to a redis REST call.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Gracefully skip Supabase session refresh when env vars are not configured
  // (e.g. preview deployments that haven't had secrets injected yet).
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

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
      await supabase.auth.getUser();
    } catch {
      // Fail open — a session refresh error should not block the request.
    }
  }

  // Coarse backstop on /api/* — 240 req/min per IP. Per-route limiters apply
  // tighter quotas inside each handler.
  if (request.nextUrl.pathname.startsWith("/api/")) {
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
