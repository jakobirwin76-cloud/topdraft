import { z } from "zod";

// US states where Topdraft cannot operate at MVP (DFS-restricted or otherwise).
// Maintained as an explicit allow-list to fail closed.
export const US_STATE_ALLOWLIST = [
  "AL","AK","AR","CA","CO","DC","FL","GA","IL","IN","KS","KY","MA","MD","ME","MI",
  "MN","MO","NC","ND","NE","NH","NJ","NM","NY","OH","OK","OR","PA","RI","SC","SD",
  "TN","TX","UT","VA","VT","WI","WV","WY",
] as const;

const BANNED_DISPLAY_NAME_PATTERNS = [/admin/i, /support/i, /moderator/i, /topdraft/i, /athletex/i];

// =============================================================================
// Auth
// =============================================================================

export const SignupInput = z.object({
  email: z.string().trim().email().max(254),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128)
    .refine((v) => /[A-Z]/.test(v) && /[a-z]/.test(v) && /[0-9]/.test(v), {
      message: "Password must include upper, lower, and a number",
    }),
  displayName: z
    .string()
    .trim()
    .min(2)
    .max(32)
    .refine((v) => !BANNED_DISPLAY_NAME_PATTERNS.some((re) => re.test(v)), {
      message: "Display name not allowed",
    }),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .refine(
      (v) => {
        const dob = new Date(v + "T00:00:00Z");
        if (Number.isNaN(dob.getTime())) return false;
        const eighteen = new Date();
        eighteen.setFullYear(eighteen.getFullYear() - 18);
        return dob <= eighteen;
      },
      { message: "Must be at least 18 years old" },
    ),
  stateCode: z.enum(US_STATE_ALLOWLIST as unknown as [string, ...string[]]),
  countryCode: z.literal("US").default("US"),
  referralCode: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]{6,12}$/)
    .optional(),
  turnstileToken: z.string().min(10),
});
export type SignupInput = z.infer<typeof SignupInput>;

export const LoginInput = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  turnstileToken: z.string().min(10),
});
export type LoginInput = z.infer<typeof LoginInput>;

export const MfaEnrollInput = z.object({
  factorType: z.literal("totp"),
  friendlyName: z.string().trim().min(1).max(40).default("Topdraft TOTP"),
});
export type MfaEnrollInput = z.infer<typeof MfaEnrollInput>;

export const MfaVerifyInput = z.object({
  factorId: z.string().uuid(),
  challengeId: z.string().uuid(),
  code: z.string().regex(/^\d{6}$/, "6-digit code required"),
});
export type MfaVerifyInput = z.infer<typeof MfaVerifyInput>;

// =============================================================================
// Trade
// =============================================================================

export const TradeInput = z
  .object({
    athleteId: z.string().uuid(),
    side: z.enum(["buy", "sell"]),
    shares: z.number().positive().max(1_000_000).finite(),
  })
  .strict();
export type TradeInput = z.infer<typeof TradeInput>;

// =============================================================================
// Chat
// =============================================================================

export const ChatMessageInput = z
  .object({
    athleteId: z.string().uuid(),
    body: z
      .string()
      .trim()
      .min(1)
      .max(500)
      .refine((v) => !/(https?:\/\/|www\.)/i.test(v), {
        message: "Links are not allowed in athlete chat",
      }),
  })
  .strict();
export type ChatMessageInput = z.infer<typeof ChatMessageInput>;

// =============================================================================
// Waitlist
// =============================================================================

export const WaitlistJoinInput = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    turnstileToken: z.string().min(10),
    referralCode: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]{6,12}$/, "Invalid referral code")
      .optional(),
    source: z
      .enum(["organic", "tiktok", "reddit", "x", "instagram", "creator", "direct"])
      .optional(),
  })
  .strict();
export type WaitlistJoinInput = z.infer<typeof WaitlistJoinInput>;

// =============================================================================
// Webhook (SportsRadar)
// =============================================================================

export const StatEventPayload = z
  .object({
    eventId: z.string().min(1).max(128),
    athleteExternalId: z.string().min(1),
    sport: z.enum(["NFL", "SOCCER", "NBA", "MLB", "NHL"]),
    eventType: z.enum(["TD", "INT", "FUM", "GOAL", "ASSIST", "RED_CARD", "INJURY"]),
    occurredAt: z.string().datetime(),
  })
  .strict();
export type StatEventPayload = z.infer<typeof StatEventPayload>;
