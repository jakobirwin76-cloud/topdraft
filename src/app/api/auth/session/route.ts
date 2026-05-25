import { getServerSupabase } from "@/lib/supabase/server";
import { json } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  // Fail open when env isn't configured (preview deploys, local dev without
  // .env.local). Same pattern as middleware. Returning an unauthed shape lets
  // the rest of the app render without 500s.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return json({ user: null, profile: null, aal: null });
  }

  const sb = await getServerSupabase();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    return json({ user: null, profile: null, aal: null });
  }

  const { data: claims } = await sb.auth.getClaims();
  const aal = (claims?.claims?.aal as "aal1" | "aal2" | undefined) ?? "aal1";

  const { data: profile } = await sb
    .from("profiles")
    .select("user_id, display_name, virtual_balance, mfa_enrolled")
    .eq("user_id", user.id)
    .maybeSingle();

  return json({
    user: { id: user.id, email: user.email ?? null },
    profile: profile ?? null,
    aal,
  });
}
