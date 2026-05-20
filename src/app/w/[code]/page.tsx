import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Referral link landing. Sets a cookie with the referral code, then redirects
 * to /waitlist where the form will include the code in the join payload.
 * Server component — no JS shipped to the client.
 */
export default async function ReferralRedirect({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const normalized = code.toLowerCase().trim();

  // Sanity guard — the referral_code column is 6–12 lowercase alphanumeric.
  if (!/^[a-z0-9]{6,12}$/.test(normalized)) {
    redirect("/waitlist");
  }

  const cookieJar = await cookies();
  cookieJar.set("ax_ref", normalized, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  redirect("/waitlist");
}
