import { z } from "zod";

/**
 * Validate environment variables at module load. Server-only.
 *
 * Required: app won't start without these.
 * Optional: guarded at call-site — features degrade gracefully when missing.
 */
const ServerEnv = z.object({
  // ── Core (required) ──────────────────────────────────────────────────────
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // ── Rate limiting (required — Upstash free tier) ──────────────────────────
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(20),

  // ── Email — Resend (optional: waitlist emails degrade without it) ─────────
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),

  // ── Bot protection — Cloudflare Turnstile (optional: forms work without) ──
  TURNSTILE_SECRET_KEY: z.string().optional(),

  // ── Waitlist HMAC token signing (optional: waitlist verify degrades) ───────
  APP_WAITLIST_SECRET: z.string().optional(),

  // ── Stripe — Phase 2, not needed at MVP ──────────────────────────────────
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // ── SportsRadar — Phase 1.5, not needed at MVP ───────────────────────────
  SPORTRADAR_API_KEY: z.string().optional(),
  SPORTRADAR_WEBHOOK_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof ServerEnv>;

export const env = (() => {
  let cached: Env | null = null;
  return {
    get(): Env {
      if (cached) return cached;
      const parsed = ServerEnv.safeParse(process.env);
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
          .join("\n");
        throw new Error(`Missing required environment variables:\n${issues}`);
      }
      cached = parsed.data;
      return cached;
    },
  };
})();
