import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import {
  buildSessionPayload,
  signWaitlistToken,
  verifyWaitlistToken,
} from "@/lib/waitlist";
import { sendReferralCredited } from "@/lib/emails";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/waitlist?error=missing_token", url.origin));

  const payload = verifyWaitlistToken(token, env.get().APP_WAITLIST_SECRET);
  if (!payload) return NextResponse.redirect(new URL("/waitlist?error=invalid_token", url.origin));

  const sb = getServiceSupabase();

  // Fetch the row and confirm the email hasn't changed since the token was issued.
  const { data: row, error } = await sb
    .from("waitlist")
    .select("id, email, position, referral_code, referred_by, email_verified")
    .eq("id", payload.wid)
    .single();
  if (error || !row || row.email !== payload.email) {
    return NextResponse.redirect(new URL("/waitlist?error=stale_token", url.origin));
  }

  // Credit the referrer if this is the first verification.
  if (!row.email_verified && row.referred_by) {
    await sb.rpc("credit_referral", { p_referred_id: row.id });
    // Notify the referrer (non-blocking, best-effort).
    const { data: refRow } = await sb
      .from("waitlist")
      .select("email, referrals_count")
      .eq("id", row.referred_by)
      .single();
    if (refRow) {
      sendReferralCredited({
        to: refRow.email,
        referredEmail: row.email,
        newRefCount: refRow.referrals_count,
      }).catch(() => {});
    }
  } else if (!row.email_verified) {
    await sb.from("waitlist").update({ email_verified: true }).eq("id", row.id);
  }

  // Mint a 90-day session token and set the cookie.
  const sessionPayload = buildSessionPayload(row.id, row.email);
  const sessionToken = signWaitlistToken(sessionPayload, env.get().APP_WAITLIST_SECRET);

  const response = NextResponse.redirect(new URL("/waitlist/me", url.origin));
  response.cookies.set("ax_wl", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  return response;
}
