# AthleteX Compliance Checklist

**Effective Date:** 2026-05-11
**Owner:** Founding team
**Status:** Pre-launch — every box must be checked before any paid marketing or App Store submission.

> Single source of truth for legal/regulatory sign-off. Pairs with the detailed IP checklist in [IP_COMPLIANCE.md](./IP_COMPLIANCE.md). This is **not legal advice** and must be reviewed by a fintech/gaming-licensed attorney before public launch.

---

## 1. Trademark (USPTO)

See [IP_COMPLIANCE.md §1](./IP_COMPLIANCE.md) for the full checklist. Summary:

- [ ] Run USPTO TESS exact-match search for "AthleteX" in IC 041, 042, 036
- [ ] Run phonetic + similar search ("Athletex", "AthleteXX", etc.)
- [ ] Common-law search (Google, Crunchbase, App Store, Reddit, Product Hunt)
- [ ] Domain + social handle availability (`athletex.app`, `@athletex` on X/IG/TT)
- [ ] File USPTO 1(b) ITU in IC 041 + IC 042 once clear
- [ ] Use `™` in interim; switch to `®` only after registration issues
- [ ] **Block list active:** never use NFL/NBA/NHL/MLB/MLS league marks, team names as branding, team logos, official jersey imagery

## 2. Patent — Freedom to Operate

- [ ] Patent search at [ppubs.uspto.gov](https://ppubs.uspto.gov/) for "Mojo" + keywords "athlete share", "athlete derivative", "live sports stock", "in-game pricing engine"
- [ ] Patent search for "Sorare", "DraftKings Marketplace", "Underdog", "Kalshi" sports-related claims
- [ ] FTO opinion from patent attorney before any external fundraising round (Series A diligence)
- [ ] Dated internal memo documenting AthleteX pricing-engine design rationale (defensive evidence of independent development)

## 3. Athlete Right of Publicity

- [ ] Names + public stats only; no photos, no AI-generated likenesses
- [ ] Generic vector silhouettes or initials-in-disc avatars (see [IP_COMPLIANCE.md §3](./IP_COMPLIANCE.md))
- [ ] No first-person athlete quotes (real or fabricated) in marketing
- [ ] Side-by-side comparisons use AthleteX UI only, never athlete images

## 4. Privacy & Data Protection

- [ ] [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) live at `/privacy` and `/docs/PRIVACY_POLICY.md`
- [ ] Sub-processor list current (Supabase, Stripe, Resend, PostHog, RevenueCat Phase 2, Cloudflare, Google AdSense, SportsRadar, Underdog/Sleeper/Betr affiliate)
- [ ] Cookie consent banner shown to EU/UK users on first visit
- [ ] Behavioral analytics consent flow tested for opt-in / opt-out
- [ ] Account deletion flow in Settings (irrevocable; 30-day retention then permanent delete)
- [ ] GDPR rights email at `jakobirwin76@gmail.com` monitored
- [ ] CCPA rights flow tested for California users
- [ ] Children's data: 18+ gate enforced at DB constraint + Zod validation + auth flow
- [ ] Email opt-in (not opt-out) for non-transactional marketing

## 5. DFS Skill-Game Frame

- [ ] [TERMS_OF_USE.md](./TERMS_OF_USE.md) frames the product as "skill-based fantasy game", **not** a securities exchange or sportsbook
- [ ] "Virtual currency has no cash value" disclaimer on every screen that shows balance
- [ ] Restricted-state list maintained; geofence enforced at signup AND on every authenticated request
- [ ] Stat-error rollback clause active in ToS (§5)
- [ ] No real-money trading at MVP; sweepstakes-coin only as Phase 2 with separate Sweepstakes Rules
- [ ] Responsible-gaming page at `/responsible-play` (even for play money — sets the tone)

## 6. Advertising & Affiliate Compliance

- [ ] Google AdSense integration: account approved, ads.txt deployed at `/ads.txt`
- [ ] AdSense ad units placed on non-critical surfaces only (Settings, Leaderboard footer, athlete profile bottom)
- [ ] Zero AdSense units on trade flow, Quest, MFA enrollment, first-run Home
- [ ] Underdog / Sleeper / Betr affiliate links flagged with `#ad` per FTC 16 CFR Part 255
- [ ] Affiliate links **geofenced** by user's `state_code` — hidden in restricted states
- [ ] DraftKings / FanDuel / casino affiliate links: **NEVER**
- [ ] Privacy Policy discloses ad networks + affiliate programs (PRIVACY_POLICY.md §5, §7)
- [ ] Settings → Privacy includes "Disable personalized ads" toggle
- [ ] CAN-SPAM compliance: unsubscribe link in every non-transactional email; physical address on file (P.O. Box OK)

## 7. Apple / Google Store (Phase 2 native shells)

- [ ] App Store description never says "stocks", "investing", "betting", or "wagering"
- [ ] App Privacy nutrition labels submitted in App Store Connect (matches PRIVACY_POLICY.md)
- [ ] Google Play data safety form submitted (matches PRIVACY_POLICY.md)
- [ ] Apple's IAP rules: digital subscription via Apple IAP only; "real-world service" (sweepstakes Phase 2) may use Stripe Treasury — verify with Apple before launch
- [ ] Apple Developer Program enrolled ($99/yr); D-U-N-S number obtained
- [ ] Google Play Developer account ($25 one-time)

## 8. Accessibility (WCAG 2.2 AA)

- [ ] Text contrast ≥ 4.5:1 (verified against `#0D0D0D` bg + `#F5F5F5` text)
- [ ] Accent `#8B5CF6` contrast ≥ 3:1 against bg for large text + UI elements
- [ ] Every interactive element has visible focus indicator
- [ ] Every form field has a programmatic label
- [ ] Athlete prices announce as currency via `aria-label` for screen readers
- [ ] Live-region announcements for new prices (`aria-live="polite"`)
- [ ] Keyboard-only path tested for: signup, MFA, Quest, trade
- [ ] No information conveyed by color alone (win/loss also indicates via `+`/`−` glyph)
- [ ] Prefers-reduced-motion respected on every Framer Motion variant

## 9. Security & Operational

- [ ] All env vars in [src/lib/env.ts](../src/lib/env.ts); never in client bundle
- [ ] RLS on every Supabase table; coverage matrix asserted in [tests/security/rls.test.ts](../tests/security/rls.test.ts)
- [ ] Zod schemas on every API route input (see [src/lib/zod/index.ts](../src/lib/zod/index.ts))
- [ ] Rate limits in [src/lib/rate-limit.ts](../src/lib/rate-limit.ts) tuned per route
- [ ] MFA TOTP enrolled before any trade (AAL2 gate in [src/app/api/trade/route.ts](../src/app/api/trade/route.ts))
- [ ] Webhook signatures HMAC-verified with timing-safe compare
- [ ] CSP, HSTS, X-Frame-Options, Referrer-Policy set in [next.config.ts](../next.config.ts)
- [ ] Penetration test before any real-money / sweepstakes launch (Phase 2)
- [ ] Cyber + general liability insurance bound before Phase 2 launch ($5–15k/yr)

## 10. Open-Source Licenses

- [ ] `pnpm licenses list` (or `npm ls --json`) audited; no GPL/AGPL in production deps
- [ ] CI job fails if a new GPL/AGPL dependency lands
- [ ] About screen lists attributions for licenses requiring it (MIT, Apache-2)

## 11. Trade-Secret Hygiene

- [ ] AthleteX pricing-engine code in private repo with branch protections
- [ ] All engineers + contractors on signed NDA + IP-assignment
- [ ] Marketing never publishes exact AMM weights, multipliers, or stat-event coefficients
- [ ] Exit-interview script for founder/employee separation

## 12. Pre-Launch Sign-Off

The following must all be ✅ before any paid marketing, App Store submission, or public Series A diligence:

- [ ] §1 Trademark clearance opinion obtained (or alternative name selected)
- [ ] §2 Patent FTO done
- [ ] §3 No athlete photos / AI likenesses in any shipped UI
- [ ] §4 Privacy Policy + ToS reviewed by counsel
- [ ] §5 DFS skill-game legal opinion obtained
- [ ] §6 Ad + affiliate program FTC compliance audited
- [ ] §8 WCAG 2.2 AA pass
- [ ] §9 RLS coverage matrix fully populated; pen test scheduled
- [ ] §10 No copyleft dependencies
- [ ] Founder + early team on signed IP-assignment + NDA

---

*Document version: v0.1 — pre-launch checklist. Treat each unchecked box as a release blocker.*
