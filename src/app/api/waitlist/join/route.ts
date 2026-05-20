import { cookies } from "next/headers";
import { WaitlistJoinInput } from "@/lib/zod";
import { getServiceSupabase } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { env } from "@/lib/env";
import { buildVerificationPayload, signWaitlistToken } from "@/lib/waitlist";
import { sendWaitlistWelcome } from "@/lib/emails";
import { json, parseJson, badRequest, serverError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = getClientIp(req);

  const block = await checkRateLimit(req, "waitlist", `ip:${ip}`);
  if (block) return block;

  const parsed = await parseJson(req, WaitlistJoinInput);
  if (parsed instanceof Response) return parsed;

  const passedTurnstile = await verifyTurnstile(parsed.turnstileToken, ip);
  if (!passedTurnstile) return badRequest("Bot check failed");

  const sb = getServiceSupabase();
  const cookieJar = await cookies();

  // Resolve referrer if a referral code was supplied (or read from cookie).
  const cookieRef = cookieJar.get("ax_ref")?.value;
  const referralCode = parsed.referralCode ?? cookieRef;
  let referredBy: string | null = null;
  if (referralCode) {
    const { data: ref } = await sb
      .from("waitlist")
      .select("id")
      .eq("referral_code", referralCode)
      .single();
    referredBy = ref?.id ?? null;
  }

  // Atomic insert. The unique(email) constraint handles duplicates cleanly.
  const { data: row, error } = await sb
    .from("waitlist")
    .insert({
      email: parsed.email,
      referred_by: referredBy,
      source: parsed.source ?? (cookieRef ? "referral" : "organic"),
    })
    .select("id, email, position, referral_code")
    .single();

  if (error || !row) {
    if (/duplicate key|unique/i.test(error?.message ?? "")) {
      return badRequest("That email is already on the waitlist");
    }
    return serverError("Could not join waitlist");
  }

  // Build and sign the email-verification token.
  const verifyPayload = buildVerificationPayload(row.id, row.email);
  const token = signWaitlistToken(verifyPayload, env.get().APP_WAITLIST_SECRET);
  const verifyUrl = `${env.get().NEXT_PUBLIC_APP_URL}/api/waitlist/verify?token=${encodeURIComponent(token)}`;
  const referralUrl = `${env.get().NEXT_PUBLIC_APP_URL}/w/${row.referral_code}`;

  try {
    await sendWaitlistWelcome({
      to: row.email,
      verifyUrl,
      position: Number(row.position),
      referralUrl,
    });
  } catch {
    // Email failure is non-fatal — the user already has a row. Surface a soft warning.
  }

  // Clear the referrer cookie now that we've consumed it.
  if (cookieRef) {
    cookieJar.set("ax_ref", "", { maxAge: 0, path: "/" });
  }

  return json(
    {
      ok: true,
      position: Number(row.position),
      referralCode: row.referral_code,
      referralUrl,
    },
    { status: 201 },
  );
}
