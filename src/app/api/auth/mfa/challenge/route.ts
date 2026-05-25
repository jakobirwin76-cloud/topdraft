import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { json, parseJson, unauthorized, serverError } from "@/lib/http";
import { isEnvReady, serviceUnconfiguredResponse } from "@/lib/env";

export const runtime = "nodejs";

const ChallengeInput = z.object({ factorId: z.string().uuid() });

export async function POST(req: Request) {
  if (!isEnvReady()) {
    return serviceUnconfiguredResponse(
      "MFA challenge is not available right now. Server credentials are missing.",
    );
  }

  try {
    const sb = await getServerSupabase();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return unauthorized();

    const block = await checkRateLimit(req, "auth", `mfa-chal:${user.id}`);
    if (block) return block;

    const parsed = await parseJson(req, ChallengeInput);
    if (parsed instanceof Response) return parsed;

    const { data, error } = await sb.auth.mfa.challenge({ factorId: parsed.factorId });
    if (error) return serverError(error.message);

    return json({ challengeId: data.id, expiresAt: data.expires_at });
  } catch (err) {
    console.error("[/api/auth/mfa/challenge] unexpected error:", err);
    return serverError("Something went wrong. Try again.");
  }
}
