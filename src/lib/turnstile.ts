import { env } from "@/lib/env";

/**
 * Verify a Cloudflare Turnstile token server-side.
 * Returns true on success. Default-deny on any error.
 */
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  try {
    const body = new URLSearchParams({
      secret: env.get().TURNSTILE_SECRET_KEY,
      response: token,
    });
    if (ip) body.set("remoteip", ip);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}
