import { cookies } from "next/headers";
import { getServiceSupabase } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { verifyWaitlistToken } from "@/lib/waitlist";
import { json, unauthorized, serverError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  const cookieJar = await cookies();
  const token = cookieJar.get("ax_wl")?.value;
  if (!token) return unauthorized("Not on the waitlist");

  const payload = verifyWaitlistToken(token, env.get().APP_WAITLIST_SECRET ?? "");
  if (!payload) return unauthorized("Session expired");

  const sb = getServiceSupabase();
  const { data: row, error } = await sb
    .from("waitlist")
    .select("id, email, position, referral_code, referrals_count, email_verified, created_at")
    .eq("id", payload.wid)
    .single();
  if (error || !row) return serverError("Could not load your waitlist entry");
  if (row.email !== payload.email) return unauthorized("Token mismatch");

  // Rank approximation: 1-indexed position (bigserial is already monotonic).
  const referralUrl = `${env.get().NEXT_PUBLIC_APP_URL}/w/${row.referral_code}`;

  return json({
    email: row.email,
    position: Number(row.position),
    referralCode: row.referral_code,
    referralsCount: row.referrals_count,
    emailVerified: row.email_verified,
    referralUrl,
    createdAt: row.created_at,
  });
}
