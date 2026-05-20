import { z } from "zod";

/**
 * Validate environment variables at module load. Server-only.
 * Crashes the process on boot if anything required is missing — better than a
 * 500 in production.
 */
const ServerEnv = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),

  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(20),

  RESEND_API_KEY: z.string().startsWith("re_"),
  RESEND_FROM_EMAIL: z.string().min(5),

  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),

  SPORTRADAR_API_KEY: z.string().min(10),
  SPORTRADAR_WEBHOOK_SECRET: z.string().min(10),

  TURNSTILE_SECRET_KEY: z.string().min(10),

  /** HMAC secret for signing waitlist session/verification tokens. 32+ bytes. */
  APP_WAITLIST_SECRET: z.string().min(32),

  /** Public-facing URL used in transactional email links. */
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = (() => {
  // Lazy parse so tests can mock process.env before we read it.
  let cached: z.infer<typeof ServerEnv> | null = null;
  return {
    get(): z.infer<typeof ServerEnv> {
      if (cached) return cached;
      const parsed = ServerEnv.safeParse(process.env);
      if (!parsed.success) {
        const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
        throw new Error(`Invalid environment variables:\n${issues}`);
      }
      cached = parsed.data;
      return cached;
    },
  };
})();
