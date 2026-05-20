import { SignupInput } from "@/lib/zod";
import { getServiceSupabase } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { json, parseJson, badRequest, serverError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = getClientIp(req);

  const ipBlock = await checkRateLimit(req, "signup", `ip:${ip}`);
  if (ipBlock) return ipBlock;

  const parsed = await parseJson(req, SignupInput);
  if (parsed instanceof Response) return parsed;

  const passedTurnstile = await verifyTurnstile(parsed.turnstileToken, ip);
  if (!passedTurnstile) return badRequest("Bot check failed");

  const sb = getServiceSupabase();

  // Create the auth user with email_confirmed=false. Supabase sends the
  // verification email; the trigger below creates the profile row only after
  // first sign-in.
  const { data: created, error: createErr } = await sb.auth.admin.createUser({
    email: parsed.email,
    password: parsed.password,
    email_confirm: false,
    user_metadata: {
      display_name: parsed.displayName,
      date_of_birth: parsed.dateOfBirth,
      state_code: parsed.stateCode,
      country_code: parsed.countryCode,
      referral_code: parsed.referralCode ?? null,
    },
  });

  if (createErr || !created.user) {
    if (createErr?.message?.toLowerCase().includes("already")) {
      return badRequest("An account with that email already exists");
    }
    return serverError("Could not create account");
  }

  // Insert profile via service role (bypasses RLS).
  const { error: profileErr } = await sb.from("profiles").insert({
    user_id: created.user.id,
    display_name: parsed.displayName,
    date_of_birth: parsed.dateOfBirth,
    state_code: parsed.stateCode,
    country_code: parsed.countryCode,
    // referred_by resolved by SQL trigger / cron (see referral pipeline)
  });
  if (profileErr) {
    // Rollback the auth user so the next signup attempt isn't blocked.
    await sb.auth.admin.deleteUser(created.user.id);
    return serverError("Could not create profile");
  }

  await sb.from("audit_logs").insert({
    user_id: created.user.id,
    action: "auth.signup",
    ip_address: ip,
    user_agent: req.headers.get("user-agent") ?? null,
    metadata: { state_code: parsed.stateCode },
  });

  return json({ ok: true, message: "Check your email to confirm your account" }, { status: 201 });
}
