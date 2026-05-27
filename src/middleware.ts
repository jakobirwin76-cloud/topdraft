import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Edge middleware runs on every request matched by `config.matcher`.
 *
 * Responsibilities:
 *   1. Refresh the Supabase auth cookie so server components see fresh tokens.
 *   2. Apply a coarse, per-IP backstop on /api/*.
 *
 * Note: AAL2 enforcement happens at the **page level** (server components
 * check `supabase.auth.getClaims()` and redirect) rather than here. Edge
 * middleware that throws crashes the entire site with ERR_CONNECTION_RESET,
 * so we keep this surface minimal and fail open on everything.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
      await supabase.auth.getUser();
    } catch {
      // Fail open on any session-refresh error.
    }
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    try {
      const block = await edgeBackstop(request);
      if (block) return block;
    } catch {
      // Fail open on rate-limit infra errors.
    }
  }

  return response;
}

async function edgeBackstop(req: NextRequest): Promise<Response | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const ip =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  const key = `rl:edge:${ip}:${Math.floor(Date.now() / 60_000)}`;
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, 90],
    ]),
  });
  if (!res.ok) return null;
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
