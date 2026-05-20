# AthleteX Privacy Policy

**Effective Date:** 2026-05-10
**Last Updated:** 2026-05-10

> **Notice:** This document is a working draft prepared by the founding team. It is **not legal advice**. Before public launch, this policy MUST be reviewed and finalized by a fintech-licensed attorney in your operating jurisdictions. References to GDPR (EU/UK) and CCPA/CPRA (California) reflect the founding team's good-faith effort to comply with both regimes simultaneously.

---

## 1. Who We Are

AthleteX ("AthleteX," "we," "us," or "our") operates a skill-based fantasy sports application (the "Service") in which users build virtual portfolios of professional athletes and earn or lose virtual currency based on athlete performance.

**Data Controller:** AthleteX
**Contact:** jakobirwin76@gmail.com
**EU Representative (if required under GDPR Art. 27):** _To be appointed prior to EU launch._

## 2. Scope

This Privacy Policy describes how we collect, use, disclose, and protect personal information of users of the Service, including the website, Progressive Web App (PWA), and any future native iOS/Android applications.

This policy applies to all users globally and is supplemented by jurisdiction-specific notices in **Section 11** (GDPR) and **Section 12** (CCPA/CPRA).

## 3. Information We Collect

### 3.1 Information You Provide Directly

| Data Category | Examples | Purpose | Legal Basis (GDPR) |
|---|---|---|---|
| **Account credentials** | Email, display name, password hash, OAuth provider ID (Apple/Google) | Authentication, account recovery | Contract (Art. 6(1)(b)) |
| **Identity & eligibility** | Date of birth, state/country of residence | Age verification (18+/21+), legal-jurisdiction enforcement, geofencing | Legal obligation (Art. 6(1)(c)), Contract |
| **Phone number** | Mobile number for SMS multi-factor authentication (MFA) | Account security, suspicious-login alerts | Contract, Legitimate interest (Art. 6(1)(f)) |
| **Profile content** | Avatar, bio, public trade activity (if opted in) | Service personalization, social features | Consent (Art. 6(1)(a)) |
| **Communications** | Support tickets, in-app chat messages on athlete pages | Provide support, moderate community | Contract, Legitimate interest |

### 3.2 Information Collected Automatically

| Data Category | Examples | Purpose | Legal Basis |
|---|---|---|---|
| **Device & technical data** | IP address, device fingerprint, OS, browser, app version | Security, fraud prevention, geofencing | Legitimate interest |
| **Usage & behavioral analytics** | Screens viewed, trades placed, session length, feature interactions | Product improvement, A/B testing | Consent (where required by GDPR) |
| **Location (approximate)** | IP-derived state/country | Legal-jurisdiction enforcement | Legal obligation |
| **Game-event data** | Athlete holdings, trade history, virtual currency balance, P&L | Operate the Service | Contract |

### 3.3 Information from Third Parties

| Source | Data Received | Purpose |
|---|---|---|
| **Apple / Google (OAuth sign-in)** | Email, name, provider ID | Account creation |
| **Stripe (Phase 1.5+)** | Subscription status, last-4 of card, billing country | Premium subscription management; payment data is processed by Stripe and not stored by us |
| **SportsRadar / sports data providers** | Public athlete stats and game events | Powers the price engine; not personal data |

### 3.4 Information We Do **NOT** Collect

- Social Security numbers, bank account numbers, or full credit/debit card numbers (those are handled exclusively by our PCI-DSS-compliant payment processor)
- Biometric data (Face ID / Touch ID is processed locally on your device by Apple/Google and never transmitted to us)
- Children's data — the Service is restricted to users **18 years of age or older** (see Section 9)

## 4. How We Use Information

We use personal information only for the purposes listed below:

1. **Provide the Service:** account creation, authentication, MFA, virtual currency accounting, trade execution, leaderboard rankings.
2. **Comply with law:** age verification, geofencing of restricted jurisdictions, fraud and anti-money-laundering checks (Phase 2 sweepstakes).
3. **Secure the Service:** detect bots and Sybil attacks, rate-limit abusive behavior, alert users to suspicious logins.
4. **Improve the Service:** product analytics, crash reporting, A/B testing of features.
5. **Communicate:** transactional emails (welcome, password reset, trade confirmations, security alerts, sweepstakes prize notifications), and — only with separate opt-in — marketing emails.
6. **Enforce our Terms:** investigate violations, suspend accounts, respond to legal process.
7. **Serve ads and affiliate links:** display contextual advertising (Google AdSense) and skill-game-adjacent referral partners (Underdog, Sleeper, Betr) on non-critical surfaces. We do **not** show sportsbook (DraftKings, FanDuel) or casino affiliate links. Ad-personalization can be disabled in Settings.

We do **not** sell personal information for monetary consideration, and we do **not** use personal information for automated decision-making that produces legal or similarly significant effects on you.

## 5. Sub-Processors and Sharing

We share personal information only with the following categories of recipients:

| Sub-processor | Purpose | Data Shared | Region | Safeguards |
|---|---|---|---|---|
| **Supabase, Inc.** | Authentication, database, storage | All Section 3 data | US (primary); EU available | DPA, SCCs for EU transfers, encryption at rest |
| **Stripe, Inc.** | Subscription payments | Email, billing country, last-4 of payment method | US, EU | PCI-DSS Level 1, DPA, SCCs |
| **PostHog (self-hosted EU region)** | Product analytics | Anonymized event data, device data | EU (self-hosted) | DPA, no third-party sharing |
| **Resend, Inc.** | Transactional email delivery | Email address, message contents | US | DPA, SCCs, TLS in transit |
| **RevenueCat, Inc.** *(Phase 2 — native shells)* | Mobile subscription management | App user ID, subscription status | US | DPA, SCCs |
| **Cloudflare, Inc.** | DDoS protection, bot mitigation, CDN | IP, request metadata | Global edge | DPA, SCCs |
| **Apple / Google** | OAuth sign-in, push notifications | Push token, OAuth ID | US | Their respective privacy policies apply |
| **Google AdSense** *(advertising)* | Display ads in non-trade screens (Settings, Leaderboard footer) | IP, user agent, ad-interaction events; cookie identifier | US, Global | Google's IAB-TCF integration; user-level opt-out in Settings |
| **Underdog Sports, Sleeper, Betr** *(DFS affiliate partners)* | Affiliate-referral CPA tracking | Click ID + referral code only; no PII shared without explicit user click | US | Click data only when user explicitly clicks an affiliate CTA |
| **SportsRadar** *(stats data)* | Sports event data for pricing | None — outbound only; we pull stats, never send user data | US, EU | Read-only API integration; no user PII transmitted |

We may also disclose information when required by law (subpoena, court order, government request) or to protect rights, property, or safety. In the event of a merger or acquisition, personal information may be transferred to the acquiring entity, subject to this Policy.

## 6. International Data Transfers

If you access the Service from outside the United States, your information will be transferred to and processed in the United States. For users in the European Economic Area, United Kingdom, or Switzerland, we rely on the **EU Standard Contractual Clauses (SCCs)** with our sub-processors and supplementary technical measures (encryption in transit and at rest).

## 7. Data Retention

| Data | Retention |
|---|---|
| Active account data | For the life of the account |
| Closed account data | 30 days post-deletion request, then permanent deletion (extended only where retention is required by law, e.g., transaction records) |
| Trade and audit logs | 7 years (financial recordkeeping standard) |
| Marketing analytics (anonymized) | 24 months |
| Support tickets | 24 months |
| Backups | 35-day rolling encrypted backup, then overwritten |

## 8. Security

We protect your information using:

- **In transit:** TLS 1.3, HSTS, certificate pinning (in native apps).
- **At rest:** AES-256 encryption on Supabase Postgres and storage buckets.
- **Access control:** Row Level Security (RLS) policies on every database table; least-privilege IAM; MFA required for all employee admin access.
- **Application security:** Zod schema validation on all server inputs; Cloudflare WAF and rate limiting; bot detection via Turnstile.
- **Operational:** Audit logs of every authentication event and trade; encrypted device storage for tokens.

**No system is perfectly secure.** If we discover a breach affecting your personal information, we will notify you and applicable regulators in line with GDPR Art. 33–34 and U.S. state breach-notification laws.

## 9. Children's Privacy

The Service is intended for users **18 years of age or older** (21+ where required by jurisdiction for sweepstakes-equivalent play). We do not knowingly collect personal information from anyone under 18. If we learn we have done so, we will delete the account and associated data.

## 10. Your Choices

- **Account deletion:** in-app under Settings → Account → Delete Account, or by emailing us. Deletion is permanent and removes your portfolio, P&L, and chat history.
- **Marketing emails:** unsubscribe link in every marketing email; transactional emails (security, trade confirmations) cannot be opted out of while the account exists.
- **Push notifications:** disable in your device settings or in the app.
- **Analytics:** in-app toggle to disable behavioral analytics; required analytics for fraud and security are retained.

## 11. GDPR Rights (EU/UK/Switzerland Users)

You have the right to:

- **Access** the personal data we hold about you (Art. 15).
- **Rectify** inaccurate data (Art. 16).
- **Erasure** ("right to be forgotten") (Art. 17).
- **Restrict** processing (Art. 18).
- **Portability** — receive your data in a machine-readable format (Art. 20).
- **Object** to processing based on legitimate interest (Art. 21).
- **Withdraw consent** at any time, without affecting prior lawful processing (Art. 7(3)).
- **Lodge a complaint** with your local Data Protection Authority.

To exercise any of these rights, email **jakobirwin76@gmail.com** with the subject line "GDPR Request." We will respond within 30 days.

## 12. CCPA / CPRA Rights (California Users)

In the past 12 months, we have collected the categories of personal information described in Section 3. We have **not sold or shared** personal information for cross-context behavioral advertising. California residents have the right to:

- **Know** what personal information we collect, use, and disclose.
- **Delete** personal information.
- **Correct** inaccurate personal information.
- **Opt out** of "sale" or "sharing" (not applicable — we do not sell or share).
- **Limit use of sensitive personal information** (we do not collect sensitive PI as defined by CPRA).
- **Non-discrimination** — we will not deny you service for exercising rights.

To exercise rights, email **jakobirwin76@gmail.com** with the subject "CCPA Request." Authorized agents must provide written authorization.

## 13. Cookies and Similar Technologies

We use first-party cookies for authentication and a small number of strictly necessary functions. Behavioral analytics cookies are loaded only after consent (a banner is shown on first visit for EU/UK users). We do not use third-party advertising cookies in the MVP.

## 14. Changes to This Policy

We will notify users by email and in-app banner at least 30 days before any material change. The current version is always available at `/docs/PRIVACY_POLICY.md` in the public repository.

## 15. Contact

**Email:** jakobirwin76@gmail.com
**Postal:** _To be added before launch._

---

*Document version: v0.1 — pre-launch draft. Final version subject to legal review.*
