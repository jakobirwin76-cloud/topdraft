import { MfaVerifyInput } from "@/lib/zod";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { json, parseJson, unauthorized, badRequest } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
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

  // Mark profile.mfa_enrolled = true with the service role (column-level grants
  // would otherwise prevent the user from updating mfa_enrolled directly).
  const admin = getServiceSupabase();
  await admin.from("profiles").update({ mfa_enrolled: true }).eq("user_id", user.id);
  await admin.from("audit_logs").insert({
    user_id: user.id,
    action: "auth.mfa_enrolled",
    ip_address: getClientIp(req),
    user_agent: req.headers.get("user-agent") ?? null,
  });

  return json({ ok: true });
}
