import { getServerSupabase, getServiceSupabase } from "@/lib/supabase/server";
import { getClientIp } from "@/lib/rate-limit";
import { json } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
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

  return json({ ok: true });
}
