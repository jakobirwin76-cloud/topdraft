import { MfaEnrollInput } from "@/lib/zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { json, parseJson, unauthorized, serverError } from "@/lib/http";
import { isEnvReady, serviceUnconfiguredResponse } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isEnvReady()) {
    return serviceUnconfiguredResponse(
      "MFA enrollment is not available right now. Server credentials are missing.",
    );
  }

  try {
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
  } catch (err) {
    console.error("[/api/auth/mfa/enroll] unexpected error:", err);
    return serverError("Something went wrong. Try again.");
  }
}
