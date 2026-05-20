import { MfaEnrollInput } from "@/lib/zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { json, parseJson, unauthorized, serverError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const sb = await getServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();

  const block = await checkRateLimit(req, "auth", `mfa-enroll:${user.id}`);
  if (block) return block;

  const parsed = await parseJson(req, MfaEnrollInput);
  if (parsed instanceof Response) return parsed;

  const { data, error } = await sb.auth.mfa.enroll({
    factorType: parsed.factorType,
    friendlyName: parsed.friendlyName,
  });
  if (error) return serverError(error.message);

  return json({
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
    uri: data.totp.uri,
  });
}
