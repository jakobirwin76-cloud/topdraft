import { MfaVerifyInput } from "@/lib/zod";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { json, parseJson, unauthorized, badRequest, serverError } from "@/lib/http";
import { isEnvReady, serviceUnconfiguredResponse } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isEnvReady()) {
    return serviceUnconfiguredResponse(
      "MFA verify is not available right now. Server credentials are missing.",
    );
  }

  try {
    const sb = await getServerSupabase();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return unauthorized();

    const block = await checkRateLimit(req, "auth", `mfa-verify:${user.id}`);
    if (block) return block;

    const parsed = await parseJson(req, MfaVerifyInput);
    if (parsed instanceof Response) return parsed;

    const { error } = await sb.auth.mfa.verify({
      factorId: parsed.factorId,
      challengeId: parsed.challengeId,
      code: parsed.code,
    });
    if (error) return badRequest("Invalid code");

    const admin = getServiceSupabase();
    await admin.from("profiles").update({ mfa_enrolled: true }).eq("user_id", user.id);
    await admin.from("audit_logs").insert({
      user_id: user.id,
      action: "auth.mfa_enrolled",
      ip_address: getClientIp(req),
      user_agent: req.headers.get("user-agent") ?? null,
    });

    return json({ ok: true });
  } catch (err) {
    console.error("[/api/auth/mfa/verify] unexpected error:", err);
    return serverError("Something went wrong. Try again.");
  }
}
