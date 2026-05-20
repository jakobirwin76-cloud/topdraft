import { getServerSupabase } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { json, unauthorized, serverError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const sb = await getServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();

  const block = await checkRateLimit(req, "general", `portfolio:${user.id}`);
  if (block) return block;

  // RLS already restricts to self — the explicit eq is defense in depth.
  const [{ data: profile, error: pErr }, { data: holdings, error: hErr }] = await Promise.all([
    sb.from("profiles").select("display_name, virtual_balance, mfa_enrolled").eq("user_id", user.id).single(),
    sb
      .from("holdings")
      .select("athlete_id, shares, avg_cost, athletes(full_name, sport, team_code, current_price)")
      .eq("user_id", user.id),
  ]);

  if (pErr || hErr) return serverError("Could not load portfolio");

  return json({ profile, holdings });
}
