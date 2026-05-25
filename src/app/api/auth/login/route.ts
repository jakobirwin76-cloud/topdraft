import { LoginInput } from "@/lib/zod";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { json, parseJson, badRequest, serverError } from "@/lib/http";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

export const runtime = "nodejs";

const LOCKOUT_MAX_FAILS = 10;
const LOCKOUT_WINDOW_SEC = 15 * 60;

let redis: Redis | null = null;
function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: env.get().UPSTASH_REDIS_REST_URL,
      token: env.get().UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

function lockoutKey(email: string): string {
  return `lockout:email:${email.toLowerCase()}`;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  const ipBlock = await checkRateLimit(req, "auth", `login:ip:${ip}`);
  if (ipBlock) return ipBlock;

  const parsed = await parseJson(req, LoginInput);
  if (parsed instanceof Response) return parsed;

  const passedTurnstile = await verifyTurnstile(parsed.turnstileToken, ip);
  if (!passedTurnstile) return badRequest("Bot check failed");

  const r = getRedis();
  const key = lockoutKey(parsed.email);
  const failCount = Number((await r.get<number>(key)) ?? 0);
  if (failCount >= LOCKOUT_MAX_FAILS) {
    return new Response(
      JSON.stringify({ error: "locked", message: "Too many failed attempts. Try again in 15 minutes." }),
      { status: 423, headers: { "Content-Type": "application/json" } },
    );
  }

  const sb = await getServerSupabase();
  const { data, error } = await sb.auth.signInWithPassword({
    email: parsed.email,
    password: parsed.password,
  });

  if (error || !data.user) {
    // Increment lockout counter, set TTL on first fail.
    const next = await r.incr(key);
    if (next === 1) await r.expire(key, LOCKOUT_WINDOW_SEC);
    return badRequest("Invalid email or password");
  }

  // Reset lockout counter on success.
  await r.del(key);

  // Check if the user has a verified TOTP factor → MFA challenge required.
  const { data: factors } = await sb.auth.mfa.listFactors();
  const totp = factors?.totp?.find((f) => f.status === "verified");

  const admin = getServiceSupabase();
  await admin.from("audit_logs").insert({
    user_id: data.user.id,
    action: "auth.login",
    ip_address: ip,
    user_agent: req.headers.get("user-agent") ?? null,
    metadata: { mfa_required: !!totp },
  });

  if (totp) {
    return json({ ok: true, mfaRequired: true, factorId: totp.id });
  }

  return json({ ok: true, mfaRequired: false });
}
