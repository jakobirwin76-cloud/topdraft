import crypto from "node:crypto";

/**
 * Waitlist token = base64url(JSON(payload)) + "." + base64url(HMAC-SHA256(body, secret)).
 *
 * Pure function — no env access, no I/O. Caller passes the secret. This makes
 * the function trivial to unit-test and prevents accidental client-side use.
 */

export interface WaitlistTokenPayload {
  /** waitlist.id */
  wid: string;
  /** email — included so we can detect a hijack if the row's email changed */
  email: string;
  /** issued-at (unix seconds) */
  iat: number;
  /** expires-at (unix seconds). 90-day default for session use. */
  exp: number;
  /** nonce — random; lets us invalidate a token later by tracking it */
  nonce: string;
}

const TOKEN_VERSION = "v1";

export function signWaitlistToken(payload: WaitlistTokenPayload, secret: string): string {
  if (!secret || secret.length < 32) throw new Error("APP_WAITLIST_SECRET too short");
  const body = Buffer.from(JSON.stringify({ ...payload, v: TOKEN_VERSION })).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyWaitlistToken(
  token: string,
  secret: string,
): WaitlistTokenPayload | null {
  if (!token || !secret) return null;
  const dot = token.indexOf(".");
  if (dot < 1 || dot === token.length - 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  const sigBuf = safeBuf(sig);
  const expBuf = safeBuf(expected);
  if (!sigBuf || !expBuf) return null;
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  let parsed: (WaitlistTokenPayload & { v?: string }) | null = null;
  try {
    parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!parsed || parsed.v !== TOKEN_VERSION) return null;
  if (!parsed.wid || !parsed.email || !parsed.nonce) return null;
  if (typeof parsed.exp !== "number" || parsed.exp < Math.floor(Date.now() / 1000)) return null;

  const { wid, email, iat, exp, nonce } = parsed;
  return { wid, email, iat, exp, nonce };
}

export function buildSessionPayload(wid: string, email: string): WaitlistTokenPayload {
  const now = Math.floor(Date.now() / 1000);
  return {
    wid,
    email,
    iat: now,
    exp: now + 60 * 60 * 24 * 90, // 90 days
    nonce: crypto.randomBytes(8).toString("base64url"),
  };
}

export function buildVerificationPayload(wid: string, email: string): WaitlistTokenPayload {
  const now = Math.floor(Date.now() / 1000);
  return {
    wid,
    email,
    iat: now,
    exp: now + 60 * 60 * 48, // 48 hours
    nonce: crypto.randomBytes(8).toString("base64url"),
  };
}

function safeBuf(s: string): Buffer | null {
  try {
    return Buffer.from(s, "base64url");
  } catch {
    return null;
  }
}
