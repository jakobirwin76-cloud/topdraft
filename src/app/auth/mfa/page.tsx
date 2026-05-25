import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Decides whether the user needs to enroll TOTP or challenge an existing factor.
 * Single codepath on web + native — middleware sends every AAL1 user here.
 */
export default async function MfaRouterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sb = await getServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const next = (await searchParams).next ?? "/app";
  const safeNext = next.startsWith("/") ? next : "/app";

  const { data: factors } = await sb.auth.mfa.listFactors();
  const verified = factors?.totp?.find((f) => f.status === "verified");

  if (verified) {
    const qs = new URLSearchParams({ factorId: verified.id, next: safeNext });
    redirect(`/auth/mfa/challenge?${qs.toString()}`);
  }

  redirect(`/auth/mfa/enroll?next=${encodeURIComponent(safeNext)}`);
}
