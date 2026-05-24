import { env } from "@/lib/env";

/**
 * Verify a Cloudflare Turnstile token server-side.
 * Returns true on success. Default-deny on any error.
 */
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secret = env.get().TURNSTILE_SECRET_KEY;
  // In dev without a real key, pass through. In prod the key is required.
  if (!secret) return process.env.NODE_ENV !== "production";
  try {
    const body = new URLSearchParams({ secret, response: token });
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
