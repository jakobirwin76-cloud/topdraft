import { env } from "@/lib/env";

/**
 * Verify a Cloudflare Turnstile token server-side.
 *
 * If TURNSTILE_SECRET_KEY isn't configured, we **pass through** rather than
 * fail. This is a deliberate MVP tradeoff: signup/login work out of the box,
 * but there's no bot protection until proper keys are wired. Once traffic
 * justifies it, set TURNSTILE_SECRET_KEY (+ NEXT_PUBLIC_TURNSTILE_SITE_KEY on
 * the client) and verification kicks in automatically.
 *
 * Default-deny only when the secret IS set but verification fails — i.e. real
 * bot protection is configured and the request didn't pass it.
 */
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secret = env.get().TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[turnstile] TURNSTILE_SECRET_KEY not configured — skipping bot check. " +
          "Set it in your env to enable Cloudflare Turnstile verification.",
      );
    }
    return true;
  }
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
