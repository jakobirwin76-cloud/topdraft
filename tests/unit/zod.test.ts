import { describe, it, expect } from "vitest";
import { SignupInput, TradeInput, ChatMessageInput, MfaVerifyInput } from "@/lib/zod";

const validSignup = {
  email: "alice@example.com",
  password: "Strong-passw0rd!!",
  displayName: "Alice",
  dateOfBirth: "1995-05-10",
  stateCode: "CA",
  countryCode: "US",
  turnstileToken: "tt_abc1234567",
};

describe("SignupInput", () => {
  it("accepts a valid payload", () => {
    expect(SignupInput.safeParse(validSignup).success).toBe(true);
  });

  it("rejects users under 18", () => {
    const today = new Date();
    const seventeen = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate())
      .toISOString()
      .slice(0, 10);
    expect(SignupInput.safeParse({ ...validSignup, dateOfBirth: seventeen }).success).toBe(false);
  });

  it("rejects weak passwords", () => {
    expect(SignupInput.safeParse({ ...validSignup, password: "password" }).success).toBe(false);
    expect(SignupInput.safeParse({ ...validSignup, password: "Short1!" }).success).toBe(false);
  });

  it("rejects banned display names", () => {
    expect(SignupInput.safeParse({ ...validSignup, displayName: "AthleteX_Admin" }).success).toBe(false);
    expect(SignupInput.safeParse({ ...validSignup, displayName: "Support" }).success).toBe(false);
  });

  it("rejects unsupported state codes", () => {
    expect(SignupInput.safeParse({ ...validSignup, stateCode: "ZZ" }).success).toBe(false);
  });
});

describe("TradeInput", () => {
  const valid = {
    athleteId: "11111111-1111-4111-8111-111111111111",
    side: "buy" as const,
    shares: 5,
  };

  it("accepts a valid trade", () => {
    expect(TradeInput.safeParse(valid).success).toBe(true);
  });

  it("rejects non-positive shares", () => {
    expect(TradeInput.safeParse({ ...valid, shares: 0 }).success).toBe(false);
    expect(TradeInput.safeParse({ ...valid, shares: -1 }).success).toBe(false);
  });

  it("rejects unknown side values", () => {
    expect(TradeInput.safeParse({ ...valid, side: "short" }).success).toBe(false);
  });

  it("strict mode rejects unknown fields", () => {
    expect(TradeInput.safeParse({ ...valid, leverage: 10 }).success).toBe(false);
  });
});

describe("ChatMessageInput", () => {
  const valid = { athleteId: "11111111-1111-4111-8111-111111111111", body: "huge game tonight" };

  it("accepts plain text", () => {
    expect(ChatMessageInput.safeParse(valid).success).toBe(true);
  });

  it("rejects URLs (anti-phishing)", () => {
    expect(ChatMessageInput.safeParse({ ...valid, body: "click http://evil.tld" }).success).toBe(false);
    expect(ChatMessageInput.safeParse({ ...valid, body: "visit www.evil.tld" }).success).toBe(false);
  });

  it("rejects empty and oversize", () => {
    expect(ChatMessageInput.safeParse({ ...valid, body: "" }).success).toBe(false);
    expect(ChatMessageInput.safeParse({ ...valid, body: "x".repeat(501) }).success).toBe(false);
  });
});

describe("MfaVerifyInput", () => {
  const ids = "11111111-1111-4111-8111-111111111111";
  it("requires exactly 6 digits", () => {
    expect(MfaVerifyInput.safeParse({ factorId: ids, challengeId: ids, code: "123456" }).success).toBe(true);
    expect(MfaVerifyInput.safeParse({ factorId: ids, challengeId: ids, code: "12345" }).success).toBe(false);
    expect(MfaVerifyInput.safeParse({ factorId: ids, challengeId: ids, code: "abcdef" }).success).toBe(false);
  });
});
