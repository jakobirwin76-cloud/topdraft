import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

let redis: Redis | null = null;
function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: env.get().UPSTASH_REDIS_REST_URL,
      token: env.get().UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

/**
 * Pre-configured limiters. Each one is a sliding window keyed on user_id or IP.
 * Tune these against the load test before each major game day.
 */
export const limiters = {
  // Anything authenticated. Catch-all backstop.
  general: () =>
    new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(120, "60 s"),
      analytics: true,
      prefix: "rl:gen",
    }),

  // Trades: max 10 per minute. Prevents bot pump-and-dump.
  trade: () =>
    new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: true,
      prefix: "rl:trade",
    }),

  // Auth: max 20 attempts per 5 min per IP. Blocks credential stuffing without
  // breaking real users who fumble passwords or share IPs (NAT, office, family).
  auth: () =>
    new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(20, "300 s"),
      analytics: true,
      prefix: "rl:auth",
    }),

  // Chat: max 8 messages per 30s. Anti-spam.
  chat: () =>
    new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(8, "30 s"),
      analytics: true,
      prefix: "rl:chat",
    }),

  // Signup: max 30 per IP per hour. Anti-Sybil while leaving room for shared
  // IPs (households, offices, mobile carriers, dorms) and testing. Drop back
  // to 10 once we see real abuse patterns in production.
  signup: () =>
    new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(30, "3600 s"),
      analytics: true,
      prefix: "rl:signup",
    }),

  // Waitlist join: max 5 per IP per hour. A little looser than signup
  // because waitlist abuse is lower-impact (no account, no balance, no MFA).
  waitlist: () =>
    new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(5, "3600 s"),
      analytics: true,
      prefix: "rl:waitlist",
    }),
} as const;

export type LimiterName = keyof typeof limiters;

/**
 * Apply a limiter and return a 429 Response if exceeded, or null to continue.
 * Standard usage in a route handler:
 *
 *   const block = await checkRateLimit(req, "trade", userId);
 *   if (block) return block;
 */
export async function checkRateLimit(
  req: Request,
  name: LimiterName,
  identifier: string,
): Promise<Response | null> {
  const result = await limiters[name]().limit(identifier);
  if (result.success) return null;

  return new Response(
    JSON.stringify({
      error: "rate_limited",
      message: "Too many requests. Slow down.",
      reset: result.reset,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.reset),
        "Retry-After": String(Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))),
      },
    },
  );
}

/**
 * Resolve the most-trusted client IP from the incoming request.
 * Order: Cloudflare → standard XFF → fallback "unknown".
 */
export function getClientIp(req: Request): string {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? "unknown";
  return "unknown";
}
