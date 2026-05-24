import crypto from "node:crypto";
import { StatEventPayload } from "@/lib/zod";
import { getServiceSupabase } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { json, badRequest, unauthorized } from "@/lib/http";

export const runtime = "nodejs";

/**
 * SportsRadar (or any push-stat) webhook.
 * Verifies HMAC signature → dedupes by external event id → applies stat
 * multiplier via apply_stat_event() RPC. Returns fast; the broadcaster service
 * picks up the price_history change via Supabase Realtime.
 */
export async function POST(req: Request) {
  const signature = req.headers.get("x-topdraft-signature") ?? "";
  const raw = await req.text();

  const webhookSecret = env.get().SPORTRADAR_WEBHOOK_SECRET;
  if (!webhookSecret) return unauthorized("Webhook not configured");

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(raw)
    .digest("hex");

  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return unauthorized("Invalid signature");
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return badRequest("Invalid JSON");
  }
  const parsed = StatEventPayload.safeParse(body);
  if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

  const sb = getServiceSupabase();

  // Look up the athlete by external id.
  const { data: athlete } = await sb
    .from("athletes")
    .select("id")
    .eq("external_id", parsed.data.athleteExternalId)
    .single();
  if (!athlete) return json({ ok: true, skipped: "unknown_athlete" });

  // Idempotent insert (unique on external_event_id). Fail-fast if dup.
  const { error: insErr } = await sb.from("stat_events").insert({
    external_event_id: parsed.data.eventId,
    athlete_id: athlete.id,
    sport: parsed.data.sport,
    event_type: parsed.data.eventType,
    payload: parsed.data,
  });
  if (insErr && !/duplicate key/i.test(insErr.message)) {
    return json({ ok: false, error: insErr.message }, { status: 500 });
  }

  const multiplier = MULTIPLIERS[parsed.data.eventType] ?? 1.0;
  const { error: rpcErr } = await sb.rpc("apply_stat_event", {
    p_event_id: parsed.data.eventId,
    p_athlete_id: athlete.id,
    p_multiplier: multiplier,
  });
  if (rpcErr) return json({ ok: false, error: rpcErr.message }, { status: 500 });

  return json({ ok: true });
}

const MULTIPLIERS: Record<string, number> = {
  TD: 1.05,
  INT: 0.96,
  FUM: 0.97,
  GOAL: 1.08,
  ASSIST: 1.03,
  RED_CARD: 0.92,
  INJURY: 0.65,
};
