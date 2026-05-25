import { getServerSupabase, getServiceSupabase } from "@/lib/supabase/server";
import { getClientIp } from "@/lib/rate-limit";
import { json } from "@/lib/http";
import { isEnvReady } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Always succeed at logout — even when env isn't configured. The client
  // should be able to "log out" locally regardless.
  if (!isEnvReady()) return json({ ok: true });

  try {
    const sb = await getServerSupabase();
    const { data: { user } } = await sb.auth.getUser();

    await sb.auth.signOut();

    if (user) {
      const admin = getServiceSupabase();
      await admin.from("audit_logs").insert({
        user_id: user.id,
        action: "auth.logout",
        ip_address: getClientIp(req),
        user_agent: req.headers.get("user-agent") ?? null,
      });
    }
  } catch (err) {
    console.error("[/api/auth/logout] unexpected error:", err);
  }

  return json({ ok: true });
}
