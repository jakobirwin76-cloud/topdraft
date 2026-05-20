import { Resend } from "resend";
import { env } from "@/lib/env";

let client: Resend | null = null;
function getResend() {
  if (!client) client = new Resend(env.get().RESEND_API_KEY);
  return client;
}

/**
 * Topdraft transactional emails.
 * Plain HTML — no React Email dep — to keep the build slim at MVP.
 * Branding mirrors CLAUDE.md: black bg, white text, solid violet #8B5CF6 (no gradients).
 */

export async function sendWaitlistWelcome(opts: {
  to: string;
  verifyUrl: string;
  position: number;
  referralUrl: string;
}) {
  const { to, verifyUrl, position, referralUrl } = opts;
  return getResend().emails.send({
    from: env.get().RESEND_FROM_EMAIL,
    to,
    subject: `You're #${position} on the Topdraft waitlist`,
    html: shell(`
      <h1 style="font-family:'Bebas Neue',Impact,sans-serif;font-size:48px;line-height:1;letter-spacing:0.04em;margin:0 0 24px;color:#F5F5F5;">
        YOU'RE&nbsp;IN.
      </h1>
      <p style="font-family:'IBM Plex Mono',ui-monospace,monospace;color:#A0A0A0;font-size:13px;line-height:1.7;margin:0 0 32px;">
        Your position: <span style="color:#8B5CF6;">#${position}</span><br/>
        Skill-based fantasy sports trading. Free to play. 18+. Confirm your email to lock your spot:
      </p>
      <a href="${verifyUrl}" style="display:inline-block;background:#8B5CF6;color:#0D0D0D;font-family:'IBM Plex Mono',monospace;font-size:13px;letter-spacing:0.15em;text-decoration:none;padding:14px 24px;text-transform:uppercase;">
        Confirm email
      </a>
      <p style="font-family:'IBM Plex Mono',monospace;color:#A0A0A0;font-size:12px;line-height:1.6;margin:40px 0 8px;">
        Move up the queue — every friend you refer bumps your position:
      </p>
      <p style="font-family:'IBM Plex Mono',monospace;font-size:13px;margin:0;">
        <a href="${referralUrl}" style="color:#A78BFA;text-decoration:none;">${referralUrl}</a>
      </p>
    `),
    text: `You're #${position} on the Topdraft waitlist.\n\nConfirm your email: ${verifyUrl}\n\nYour referral link: ${referralUrl}`,
  });
}

export async function sendReferralCredited(opts: { to: string; referredEmail: string; newRefCount: number }) {
  const { to, referredEmail, newRefCount } = opts;
  return getResend().emails.send({
    from: env.get().RESEND_FROM_EMAIL,
    to,
    subject: `Someone joined Topdraft from your link`,
    html: shell(`
      <h1 style="font-family:'Bebas Neue',Impact,sans-serif;font-size:36px;letter-spacing:0.04em;margin:0 0 24px;color:#F5F5F5;">
        +1&nbsp;REFERRAL
      </h1>
      <p style="font-family:'IBM Plex Mono',monospace;color:#A0A0A0;font-size:13px;line-height:1.7;margin:0 0 16px;">
        ${redact(referredEmail)} just joined the waitlist from your link.
        You now have <span style="color:#8B5CF6;">${newRefCount}</span> confirmed referrals.
      </p>
      <p style="font-family:'IBM Plex Mono',monospace;color:#A0A0A0;font-size:12px;margin:0;">
        Keep sharing — top 1,000 get a permanent Founder badge in-app.
      </p>
    `),
    text: `${redact(referredEmail)} just joined Topdraft from your link. You now have ${newRefCount} confirmed referrals.`,
  });
}

function shell(inner: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0D0D0D;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0D0D0D;">
    <tr><td align="center" style="padding:48px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;">
        <tr><td style="padding:0 8px 32px;font-family:'Bebas Neue',Impact,sans-serif;font-size:22px;letter-spacing:0.25em;color:#8B5CF6;">
          TOPDRAFT
        </td></tr>
        <tr><td style="background:#161616;border:1px solid #222222;padding:40px;color:#F5F5F5;">
          ${inner}
        </td></tr>
        <tr><td style="padding:24px 8px 0;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.15em;color:#666;">
          TOPDRAFT&trade; &middot; 18+ &middot; SKILL-BASED FANTASY GAME &middot; NOT GAMBLING
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/** Mask the local-part of an email for privacy: alice@foo.com → a***@foo.com */
function redact(email: string): string {
  const at = email.indexOf("@");
  if (at < 1) return "someone";
  return `${email[0]}***${email.slice(at)}`;
}
