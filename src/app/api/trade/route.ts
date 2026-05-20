import { TradeInput } from "@/lib/zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { json, parseJson, unauthorized, badRequest, forbidden, serverError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const sb = await getServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();

  // MFA gate: require AAL2 for trades.
  const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") {
    return forbidden("MFA required for trading");
  }

  const block = await checkRateLimit(req, "trade", `trade:${user.id}`);
  if (block) return block;

  const parsed = await parseJson(req, TradeInput);
  if (parsed instanceof Response) return parsed;

  const { data, error } = await sb.rpc("place_trade", {
    p_athlete_id: parsed.athleteId,
    p_side: parsed.side,
    p_shares: parsed.shares,
  });

  if (error) {
    const code = error.message ?? "trade_failed";
    if (code.includes("insufficient_balance")) return badRequest("Insufficient balance");
    if (code.includes("insufficient_shares")) return badRequest("Not enough shares to sell");
    if (code.includes("athlete_inactive")) return badRequest("Athlete not available");
    if (code.includes("invalid_shares")) return badRequest("Invalid quantity");
    return serverError("Trade failed");
  }

  return json({ ok: true, trade: data });
}
