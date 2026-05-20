import { describe, it, expect } from "vitest";
import {
  signWaitlistToken,
  verifyWaitlistToken,
  buildSessionPayload,
  buildVerificationPayload,
} from "@/lib/waitlist";

const secret = "0123456789abcdef0123456789abcdef0123456789ab"; // 44 chars

describe("waitlist token", () => {
  it("signs and verifies a roundtrip", () => {
    const payload = buildSessionPayload("11111111-1111-4111-8111-111111111111", "alice@test.dev");
    const token = signWaitlistToken(payload, secret);
    const parsed = verifyWaitlistToken(token, secret);
    expect(parsed).not.toBeNull();
    expect(parsed?.wid).toBe(payload.wid);
    expect(parsed?.email).toBe(payload.email);
  });

  it("rejects a token signed with a different secret", () => {
    const payload = buildSessionPayload("id", "x@y.z");
    const token = signWaitlistToken(payload, secret);
    expect(verifyWaitlistToken(token, "different-secret-of-sufficient-length-aaaa")).toBeNull();
  });

  it("rejects a tampered body", () => {
    const payload = buildSessionPayload("id", "x@y.z");
    const token = signWaitlistToken(payload, secret);
    const [body, sig] = token.split(".");
    const tampered = `${body.slice(0, -2)}aa.${sig}`;
    expect(verifyWaitlistToken(tampered, secret)).toBeNull();
  });

  it("rejects a tampered signature", () => {
    const payload = buildSessionPayload("id", "x@y.z");
    const token = signWaitlistToken(payload, secret);
    const tampered = `${token.slice(0, -2)}aa`;
    expect(verifyWaitlistToken(tampered, secret)).toBeNull();
  });

  it("rejects a malformed token", () => {
    expect(verifyWaitlistToken("", secret)).toBeNull();
    expect(verifyWaitlistToken("nodot", secret)).toBeNull();
    expect(verifyWaitlistToken(".onlysig", secret)).toBeNull();
    expect(verifyWaitlistToken("onlybody.", secret)).toBeNull();
  });

  it("rejects an expired token", () => {
    const expired = {
      wid: "id",
      email: "x@y.z",
      iat: Math.floor(Date.now() / 1000) - 100,
      exp: Math.floor(Date.now() / 1000) - 10,
      nonce: "abc",
    };
    const token = signWaitlistToken(expired, secret);
    expect(verifyWaitlistToken(token, secret)).toBeNull();
  });

  it("verification payload expires in 48h", () => {
    const p = buildVerificationPayload("id", "x@y.z");
    const expectedExp = p.iat + 60 * 60 * 48;
    expect(p.exp).toBe(expectedExp);
  });

  it("session payload expires in 90d", () => {
    const p = buildSessionPayload("id", "x@y.z");
    const expectedExp = p.iat + 60 * 60 * 24 * 90;
    expect(p.exp).toBe(expectedExp);
  });

  it("throws on a too-short secret at signing time", () => {
    expect(() => signWaitlistToken(buildSessionPayload("id", "x@y.z"), "short")).toThrow();
  });
});
