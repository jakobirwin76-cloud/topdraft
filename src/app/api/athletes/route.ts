import { getServerSupabase } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { json, serverError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sport = url.searchParams.get("sport") ?? undefined;

  const block = await checkRateLimit(req, "general", `athletes:${getClientIp(req)}`);
  if (block) return block;

  const sb = await getServerSupabase();
  let query = sb
    .from("athletes")
    .select("id, sport, full_name, team_code, position, current_price, base_price")
    .eq("is_active", true)
    .order("current_price", { ascending: false })
    .limit(200);

  if (sport) query = query.eq("sport", sport);

  const { data, error } = await query;
  if (error) return serverError("Could not load athletes");
  return json({ athletes: data });
}
