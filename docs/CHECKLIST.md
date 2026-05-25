# Topdraft — Build Plan (Web + Mobile)

> Pulled up automatically when the user says **"checklist"** in any session.
> Read this file first, update it last.
>
> This is the full path from the current stateless demo at topdrafts.app to a
> shipped real product on **web + mobile**. Ordered by dependency: you can't
> ship Phase 2 until Phase 1 lands. Don't skip ahead.

---

## ✅ ALREADY DONE

- Landing page deployed to topdrafts.app (Netlify → GitHub `main` auto-deploy)
- Waitlist signup restored — hero has "Try the demo →" + "Join the waitlist"
- Stateless `/app` dashboard with 75 athletes, sport filters, top movers
- Stateless `/athlete/[slug]` w/ smooth chart, trade panel, P&L, live feed
- 16-pool pricing matrix (4 soccer + 5 NBA + 7 NFL), ±2% cap, drift-balanced
- Design system v1 — 8 components in `src/components/ui/`
- Supabase schema applied (migrations 0001–0005): profiles, athletes, holdings, trades, price_history, stat_events, chat_messages, referrals, audit_logs, waitlist
- `place_trade()` SQL function exists (not yet wired to client)
- env.ts hardened — Stripe/SportsRadar/Resend/Turnstile optional
- Front-running protection spec in CLAUDE.md §7 (not yet implemented)

---

# PHASE 1 — WEB MVP (real accounts, real trades, play money)

**Goal:** the demo becomes a real app. Users sign up, get a balance, place trades that persist, see a portfolio. Still play money. Still no real stat data.

## 1.1 Auth (BLOCKING — everything else needs a user)

> Email/password + TOTP shipped 2026-05-26. Google + Apple Sign In deferred to
> **Phase 1.6** — requires Apple Developer account ($99/yr). Apple Sign In is
> mandatory if we add Google (App Store rule), so they ship together or not at all.

- [ ] `/signup` page — email, password, displayName, DOB (18+ gate), state dropdown, Turnstile widget
- [ ] `/login` page — email, password, Turnstile
- [ ] `/auth/mfa/enroll` — QR code render via Supabase TOTP
- [ ] `/auth/mfa/challenge` + verify pages
- [ ] `/auth/callback` — session refresh handler
- [ ] `/logout` route
- [ ] Middleware (`src/middleware.ts`) — refresh session on every request, gate `/app` and `/trade` routes behind AAL2
- [ ] `useAuthStore` Zustand store — user, profile, archetype, aal level, balance
- [ ] AuthProvider — hydrates store on mount, listens to `onAuthStateChange`
- [ ] Email verification flow (Resend transactional template)
- [ ] Password reset flow
- [ ] RLS test: a logged-out request to `/api/trade` returns 401, not 500

## 1.2 Onboarding — Personality Quest

- [ ] Migration `0006_archetype.sql` — adds `archetype_primary`, `archetype_secondary`, `quest_completed_at` to profiles + `onboarding_responses` table with RLS
- [ ] `/quest/[step]` — 5 full-screen swipe questions (Framer Motion AnimatePresence)
- [ ] 4 answer cards per question, staggered spring-in, selected = violet glow + 1.02 scale
- [ ] Progress dots top-right (1/5 → 5/5)
- [ ] `POST /api/quest/save-answer` — save on each pick (Zod-validated, rate-limited)
- [ ] `POST /api/quest/finalize` — derives archetype server-side via `deriveArchetype()` in `src/lib/onboarding`
- [ ] `/quest/reveal` — cinematic "YOU ARE A {ARCHETYPE}" reveal, 2.5s sequence
- [ ] `/api/quest/share-card` — generates a share PNG (Satori or @vercel/og)
- [ ] First-login redirect: if `quest_completed_at` is null → `/quest/1`

## 1.3 Real dashboard

- [ ] Replace static `ATHLETES` record on `/app` with Supabase query
- [ ] Header: logo left, Balance (animated count-up) + Avatar right
- [ ] "One big number" portfolio value hero (Inter Tight, 64px+)
- [ ] LIVE ALERT band: appears when user holds someone in an active game
- [ ] Top Movers row driven by real `price_history` data
- [ ] Leaderboard ticker (slow scroll, compact)
- [ ] Bottom nav (mobile) / top nav (desktop): Home / Market / Live / Portfolio / Profile
- [ ] Archetype-tuned default tab on first session (Sharp→Live, Hype→Market, Loyalist→Athlete Chat, Chiller→Portfolio, Whale→Home)

## 1.4 Real trade flow (replace local state with `place_trade()` RPC)

- [ ] `/api/trade` — Zod-validate input, verify AAL2, call `place_trade()` RPC
- [ ] Trade sheet UI — slides in from right (desktop) / bottom (mobile)
- [ ] Quick-pick buttons (1 / 5 / 10 / 25 / MAX)
- [ ] Live price impact preview — calls `applyTrade()` from `src/lib/pricing/amm.ts` client-side
- [ ] Confirm step requires fresh MFA challenge if AAL drops
- [ ] Haptic feedback on mobile confirm
- [ ] Success: animated balance update + share-card link
- [ ] Errors surfaced clearly: insufficient balance, market halted, etc.

## 1.5 Trade safety (LAUNCH BLOCKER — see CLAUDE.md §7)

- [ ] Migration `0007_trade_safety.sql` — adds `athletes.market_halt_until timestamptz` + partial index
- [ ] Update `place_trade()` — raises `market_halted` if halt is active
- [ ] 15-second broadcast delay on the public price feed
- [ ] 10-second trade halt on `|multiplier - 1| > 0.04` events
- [ ] UI banner: "MARKET PAUSED · LIVE EVENT" during halt
- [ ] **DO NOT enable real trading until both above ship**

## 1.6 Portfolio

- [ ] `/portfolio` — tabs: Holdings | Trade History | P&L
- [ ] Trading-blotter style (dense rows, monospaced numbers, no cards)
- [ ] Holdings: athlete · shares · avg cost · current price · P&L $ · P&L %
- [ ] Trade history: every trade with timestamp, side, shares, price, total
- [ ] P&L tab: realized vs unrealized breakdown, time-series chart
- [ ] Per-row shareable P&L card → `/api/share-card`

## 1.7 Live tab

- [ ] `/live` — active games (mocked schedule until SportsRadar lands)
- [ ] Supabase Realtime subscribe to `price_history` rows
- [ ] Game cards: live score, time remaining, user's athletes in this game, ticking price
- [ ] Two-button trade: "Buy More" / "Sell" without leaving the screen
- [ ] Pulse animation on >1% moves in <5s

## 1.8 Leaderboard

- [ ] `/leaderboard` — top 100 by % gain
- [ ] Tabs: Daily / Weekly / All-time
- [ ] User's row highlighted even if outside top 100
- [ ] Animated rank changes (green flash up, red down)

---

# PHASE 2 — MOBILE (PWA first, then native)

**Goal:** the same app, but installable on iPhone/Android home screens, then later a real native shell. PWA is the cheap path — ship in days, not months.

## 2.1 PWA (lowest cost, ship first)

- [ ] `public/manifest.webmanifest` — name, short_name, theme_color `#0A0710`, icons, display:standalone
- [ ] App icons — 192, 512, maskable variants
- [ ] Apple touch icons + splash screens
- [ ] `next-pwa` or hand-rolled service worker — offline shell + asset cache
- [ ] Install prompt component — "Add to Home Screen" banner (one-time)
- [ ] Push notifications via Web Push API (price alerts, halt warnings)
- [ ] Safe-area insets respected (`env(safe-area-inset-*)`)
- [ ] Status bar styling on iOS

## 2.2 Mobile responsive audit

- [ ] Every page audited at 375px (iPhone SE), 390px (iPhone 14), 414px (iPhone Plus), 768px (iPad), 1024px (desktop)
- [ ] Bottom nav on mobile (max 5 items), top nav on desktop
- [ ] Trade flow → bottom sheet on mobile, right slide-in on desktop
- [ ] All touch targets ≥ 44pt
- [ ] No horizontal scroll anywhere
- [ ] Marquee ticker still readable at 375px
- [ ] Athlete chart legible at 375px (axis labels, tooltip positioning)
- [ ] Modals don't overflow the viewport on landscape

## 2.3 Native shell (Phase 2 — only after PWA traction)

Pick one path — don't try both.

**Option A: Capacitor (recommended — wraps the existing web app)**
- [ ] `npm i @capacitor/core @capacitor/ios @capacitor/android`
- [ ] `npx cap init Topdraft app.topdraft`
- [ ] iOS + Android builds, point to production web URL
- [ ] Native plugins: Haptics, Push, StatusBar, App
- [ ] App Store + Play Store listings, screenshots, privacy disclosures
- [ ] Apple TestFlight + Google internal track for beta

**Option B: Expo + React Native (rewrite UI in RN)**
- [ ] Higher cost, better native feel, separate codebase to maintain
- [ ] Only do this if Capacitor performance is unacceptable

**Either way:**
- [ ] RevenueCat for native subscription handling (Phase 2 premium tier)
- [ ] Apple Sign In + Google Sign In (App Store requirement if you offer email auth)
- [ ] Apple App Review prep: skill-game / no-gambling framing must be airtight

---

# PHASE 3 — REAL DATA (SportsRadar integration)

**Goal:** prices move from real games, not synthetic events. Without this the product is a toy.

- [ ] SportsRadar developer-tier keys for NFL, NBA, EPL/UCL
- [ ] `/api/webhooks/sportsradar` — HMAC-verify with `crypto.timingSafeEqual`
- [ ] Dedup via `stat_events.external_event_id` unique index
- [ ] Map SportsRadar event types → internal `eventKey` in event-pools.ts
- [ ] Apply multiplier via `applyStatEvent()` → write `price_history` row
- [ ] Stat-error rollback flow: `rollbackStatEvent()` reverses price + reverses any trades that fired between original and rollback (per ToS clause)
- [ ] Replace mocked active-games on `/live` with real schedule
- [ ] Commercial-tier upgrade once traffic justifies

---

# PHASE 4 — MONETIZATION

- [ ] Google AdSense — banner on Settings + Leaderboard footer (never on trade flow)
- [ ] DFS affiliate referrals — Underdog, Sleeper, Betr (in "Earn Virtual Currency" surface)
- [ ] Streaming affiliate — Fubo, ESPN+, DAZN on athlete profile "Watch live on…" CTA
- [ ] Geofence sportsbook/DFS affiliate links by `state_code`
- [ ] FTC `#ad` disclosure on every affiliate CTA
- [ ] Premium subscription tier (Stripe on web, RevenueCat on native) — Phase 2
- [ ] Sweepstakes-coin economy — Phase 2, separate compliance review

---

# PHASE 5 — SECURITY HARDENING (do before any public push)

> **Threat model:** play-money DFS at MVP, no card data on file → PCI DSS does **not**
> apply yet. Real threats are: account takeover, AMM front-running, RLS bypass,
> webhook spoofing, XSS via athlete chat, credential stuffing, supply-chain
> compromise via npm. Skip enterprise overkill (SOC 2, SAML SSO, hardware
> tokens) until revenue or scale demands it.
>
> Based on OWASP Top 10 (2025), PCI DSS 4.0.1 MFA guidance (used as a reference
> for the auth layer even though we're out of scope), Supabase RLS performance
> patterns, and the Next.js 15.5.18 / 16.2.6 May 2026 vulnerability disclosure.

## 5.1 OWASP Top 10 baseline (must-fix list)

- [ ] **A01 Broken Access Control** — every API route verifies `auth.uid()` BEFORE any DB write; no client can ever pass `user_id` as input (always derive server-side from session)
- [ ] **A02 Cryptographic Failures** — bcrypt/argon2 for any local hashes (Supabase Auth handles user passwords already); use `crypto.timingSafeEqual` on all signature/HMAC compares
- [ ] **A03 Injection** — Zod on every route handler input; no raw SQL string concatenation, use parameterized queries / Supabase RPC only
- [ ] **A04 Insecure Design** — `place_trade()` is a single RPC, never split into multiple round trips; AMM math runs server-side, client-side preview is advisory only
- [ ] **A05 Security Misconfiguration** — CSP / HSTS / frame-ancestors set; source maps disabled in production; verbose errors stripped; no wildcard CORS
- [ ] **A06 Vulnerable Components** — Dependabot enabled on GitHub; `npm audit --audit-level=high` gate in CI; lockfile committed; pin Next.js to ≥ 15.5.18 (May 2026 patch)
- [ ] **A07 Auth Failures** — MFA TOTP required, rate-limit `/api/auth/login` (5/min/IP), exponential lockout on 10+ failures, session refresh on every privileged route
- [ ] **A08 Software/Data Integrity** — webhook HMAC verification, append-only audit log, immutable `trades` ledger via RLS (no UPDATE/DELETE policy)
- [ ] **A09 Logging & Monitoring** — structured logs in production (Pino → Logflare or Axiom), alerts on >10 trade errors/min, alerts on auth anomalies
- [ ] **A10 SSRF** — no user-controlled URL fetches in server code; any future `next/image` remote source is allowlisted in `next.config.ts`

## 5.2 HTTP security headers (`next.config.ts`)

- [ ] **Content-Security-Policy** with per-request nonce (Next.js 15 middleware pattern) — blocks XSS in athlete chat
  - `script-src 'self' 'nonce-{value}' 'strict-dynamic'`
  - `style-src 'self' 'nonce-{value}'`
  - `connect-src 'self' https://*.supabase.co https://*.upstash.io wss://*.supabase.co`
  - `frame-ancestors 'none'` (prevents clickjacking, replaces X-Frame-Options)
  - `img-src 'self' data: https:` (athlete photos when added)
  - `base-uri 'self'`; `form-action 'self'`; `object-src 'none'`
  - Pages using nonce CSP must be dynamically rendered — fine for our authed surfaces
- [ ] **Strict-Transport-Security** — `max-age=63072000; includeSubDomains; preload`
- [ ] **Referrer-Policy** — `strict-origin-when-cross-origin`
- [ ] **Permissions-Policy** — disable camera, microphone, geolocation, payment unless feature needs it
- [ ] **X-Content-Type-Options** — `nosniff`
- [ ] **Cross-Origin-Opener-Policy** — `same-origin`
- [ ] **Trusted Types** (MDN Baseline 2026) — `require-trusted-types-for 'script'` on routes rendering user content (athlete chat)

## 5.3 Authentication hardening (PCI DSS 4.0.1 MFA spirit, even out of scope)

- [ ] Email + password only — no social auth at MVP (reduces OAuth surface)
- [ ] TOTP enrollment required during signup, not optional
- [ ] AAL2 enforced on `/api/trade`, `/api/account/*`, `/api/admin/*`
- [ ] Session cookies: `HttpOnly`, `Secure`, `SameSite=Lax`, `__Host-` prefix
- [ ] Short-lived access tokens (Supabase default 1 hr); refresh token rotation on
- [ ] Lockout after 10 failed logins per email (Upstash counter, 15-min window)
- [ ] Re-auth prompt before sensitive actions (email change, MFA reset, password change)
- [ ] Recovery codes generated on MFA enroll, shown once, hashed in DB
- [ ] No SMS-based MFA (SIM-swap risk — TOTP only)
- [ ] Cloudflare Turnstile on signup, login, password reset, waitlist join

## 5.4 Supabase RLS — the fortress

- [ ] RLS **explicitly enabled** in every migration (never trust dashboard default)
- [ ] RLS coverage matrix in `docs/TESTING_GUIDE.md` lists every table + every policy
- [ ] Policies use `auth.uid()` — never trust a client-supplied user_id
- [ ] `trades` table: INSERT-only policy, no UPDATE, no DELETE (immutable ledger)
- [ ] `price_history` table: service-role INSERT only, public SELECT (append-only)
- [ ] `audit_logs` table: service-role INSERT only, admin SELECT only
- [ ] `profiles.balance`: never SET via direct UPDATE, only via `place_trade()` RPC
- [ ] Indexes on every column referenced in RLS policies (Supabase 2026 perf rule)
- [ ] RLS tests run with the **client SDK**, not SQL Editor (Editor bypasses RLS)
- [ ] Service role key: server-only env var, never `NEXT_PUBLIC_*`, never in middleware (middleware runs on edge and leaks more easily)
- [ ] CI grep: `grep -r "SUPABASE_SERVICE_ROLE\|service_role" src/app src/components src/hooks` → must return zero matches

## 5.5 Input validation & rate limits

- [ ] Zod schema in `src/lib/zod/` for every API route input
- [ ] `parseJson(req, Schema)` helper in `src/lib/http.ts` used universally
- [ ] Rate limits per route (Upstash `@upstash/ratelimit`):
  - `/api/trade` — 30/min/user, sliding window
  - `/api/auth/login` — 5/min/IP, fixed window
  - `/api/auth/signup` — 3/hour/IP
  - `/api/waitlist/join` — 3/hour/IP (already in place)
  - `/api/quest/save-answer` — 20/min/user
  - `/api/chat/post` — 20/min/user (athlete chat spam guard)
- [ ] HTML sanitization on athlete chat — DOMPurify on render, NOT on store (store the raw, sanitize on read)
- [ ] Max payload size on every route (default 1MB Next.js, lower for `/api/quest/save-answer` to 4KB)

## 5.6 Trade safety (LAUNCH BLOCKER — from CLAUDE.md §7)

- [ ] **15s broadcast delay** on public price feed — stadium / RedZone viewers can't front-run
- [ ] **10s trade halt** on `|multiplier - 1| > 0.04` events (TD, INT, ejection, etc.)
- [ ] Migration `0007_trade_safety.sql` — `athletes.market_halt_until timestamptz` + partial index
- [ ] `place_trade()` raises `market_halted` (errcode `22023`) when halt active
- [ ] UI banner: "MARKET PAUSED · LIVE EVENT" with countdown
- [ ] Slippage protection — client sends `max_price_impact` (default 2%), server rejects if exceeded
- [ ] Stat-event rollback flow — `rollbackStatEvent()` reverses price + any trades fired during corrected window (per ToS clause)
- [ ] Phase 2 hardening (after launch): 1s execution lag on every trade, surveillance dashboard flagging users who consistently buy seconds before positive events

## 5.7 Webhooks & external data

- [ ] `/api/webhooks/sportsradar` — HMAC verify via `crypto.timingSafeEqual`
- [ ] `/api/webhooks/stripe` — Stripe signature verify (built-in SDK helper)
- [ ] Replay protection — `external_event_id` unique index on `stat_events`
- [ ] Timestamp window — reject webhook payloads older than 5 min (replay attack)
- [ ] No service-role key exposed in webhook responses

## 5.8 Secrets & supply chain

- [ ] `.env*` files in `.gitignore` (already done)
- [ ] `git-secrets` or TruffleHog pre-commit hook scanning for AWS / Stripe / Supabase keys
- [ ] GitHub secret scanning enabled on the repo (free for public repos — already public)
- [ ] Dependabot security updates enabled
- [ ] `npm audit --audit-level=high` in CI — build fails on high or critical
- [ ] Lockfile committed (`package-lock.json`)
- [ ] All env vars accessed through `src/lib/env.ts` (Zod-validated) — never `process.env.X` directly
- [ ] Key rotation runbook documented (Supabase service role, Upstash token, Stripe webhook secret, SportsRadar key)
- [ ] Separate keys per environment (dev / preview / prod)

## 5.9 Privacy, compliance, geofencing

- [ ] **18+ age gate** — DB CHECK constraint on `profiles.dob`, enforced at signup
- [ ] **State geofence** — block signup + trade from HI, ID, MT, NV, WA (the 5 DFS-restricted states per 2026 case law)
- [ ] Geolocation via Cloudflare `CF-IPCountry` + `CF-IPState` headers in middleware (free, no Maxmind dependency)
- [ ] User declares state at signup, locked unless ID-verified address change
- [ ] **No COPPA exposure** — we never knowingly collect under-13 data; signup blocked under 18 anyway
- [ ] **GDPR/CCPA data export** — `/api/account/export` returns user's full data as JSON
- [ ] **Account deletion** — `/api/account/delete` soft-deletes profile, anonymizes trade history (keep ledger integrity, strip PII)
- [ ] Sub-processor disclosure in `docs/PRIVACY_POLICY.md`: Supabase, Upstash, Resend, Cloudflare, Stripe, Vercel/Netlify, SportsRadar
- [ ] Cookie banner if traffic from EU/UK — Cookieyes or simple home-rolled (only analytics cookies need consent; auth cookies are essential)
- [ ] FTC `#ad` disclosure on every affiliate link

## 5.10 Logging, monitoring, incident response

- [ ] Structured logging — Pino with request ID, user ID (when authed), route, latency, outcome
- [ ] Log shipping: Logflare or Axiom (free tier sufficient at MVP)
- [ ] Sentry for client + server error tracking (free tier sufficient)
- [ ] Alert rules:
  - >10 `/api/trade` 500s in 5 min
  - >50 failed logins in 5 min (credential stuffing)
  - Any `place_trade()` raising `market_halted` more than 100x/hour (signal: real attack or bug)
  - Any RLS policy denial logged (means a client tried something it shouldn't)
- [ ] **Incident runbook** in `docs/INCIDENT_RESPONSE.md` (TODO create) — who to page, how to halt trading globally (kill switch: `app_settings.trading_paused = true` checked in `place_trade()`)
- [ ] Status page at `status.topdrafts.app` (Statuspage.io free tier or a hand-rolled `/status` route)

## 5.11 Pre-launch verification

- [ ] OWASP ZAP baseline scan against staging
- [ ] Manual penetration of: auth bypass, IDOR (changing user_id in URLs), CSRF (cross-site form submit), XSS in athlete chat, SQL injection via search query
- [ ] Load test `/api/trade` at 100 RPS — confirm rate limit holds, no race conditions in `place_trade()`
- [ ] Verify no `console.log` of PII in production build (`grep -r "console.log" src/`)
- [ ] Verify production build has no source maps served publicly
- [ ] Verify `NEXT_PUBLIC_*` env vars contain zero secrets (`grep -r "NEXT_PUBLIC" .env*`)
- [ ] All compliance docs current: `PRIVACY_POLICY.md`, `TERMS_OF_USE.md`, `IP_COMPLIANCE.md`, `RLS_COVERAGE.md`

---

# PHASE 6 — QA + LAUNCH

- [ ] `loading.tsx` for every async route
- [ ] `error.tsx` for every route that fetches
- [ ] Empty states with message + CTA on every list view
- [ ] Vitest unit tests — 80% coverage gate on trading + auth
- [ ] Playwright golden paths: signup → MFA → quest → trade → portfolio → logout
- [ ] Lighthouse: ≥90 on Performance, Accessibility, Best Practices, SEO
- [ ] CLS = 0 on all routes
- [ ] No console errors on production build
- [ ] Manual QA at 375 / 390 / 768 / 1024 — every flow
- [ ] Pre-deploy checklist (`docs/QA_CHECKLIST.md` — TODO create)
- [ ] Production environment variables verified in Netlify + Vercel
- [ ] Custom domain DNS + SSL confirmed
- [ ] Status page (Statuspage.io or hand-rolled) for outages

---

# PHASE 7 — DISTRIBUTION (carry-over from prior checklist)

- [ ] Record 10-second screen video on `/athlete/jefferson` or `/athlete/wemby`
- [ ] Post to TikTok, X, Reddit r/sportsbook + r/fantasyfootball
- [ ] Twitter/X launch thread (5 tweets, tag Polymarket / PrizePicks / Sleeper)
- [ ] "Browse other athletes" row at bottom of each athlete page
- [ ] `/embed` shareable card view (no nav, just trade panel) — for X/TikTok embeds
- [ ] Featured-athlete rotation on landing (currently hardcoded to Mahomes)
- [ ] "Live Game" indicator on athletes currently playing
- [ ] Marquee ticker: rotate in NFL stars (currently Mbappé/Yamal/Wemby dominate)

---

## 🧭 SUGGESTED ORDER (don't deviate without a reason)

1. **Phase 1.1 Auth** → without users, nothing else matters
2. **Phase 1.5 Trade safety migrations** → land the schema before wiring trades
3. **Phase 1.4 Real trade flow** → the core product loop
4. **Phase 1.6 Portfolio** → users need to see what they own
5. **Phase 5 Security hardening** → before any real launch push
6. **Phase 2.1 PWA** → mobile install path, cheap win
7. **Phase 1.2 Quest + Phase 1.3 Dashboard + Phase 1.7 Live + Phase 1.8 Leaderboard** → polish in parallel
8. **Phase 2.2 Responsive audit** → confirm mobile works
9. **Phase 3 SportsRadar** → real data flips this from demo to product
10. **Phase 6 QA** → continuous, but final pass before any big push
11. **Phase 7 Distribution** → record video, post, get eyes
12. **Phase 2.3 Native shell** → only after PWA shows traction
13. **Phase 4 Monetization** → only after retention is proven

---

## ❌ DO NOT DO YET

- Real-money trading — needs full compliance review, KYC, state licensing
- Sweepstakes-coin economy — Phase 2 only, separate legal frame
- Social auth (Google/Apple) — email-only at MVP unless App Store forces it
- Order-book matching — we are AMM-only, forever
- Light mode — Phase 2
- More than 75 athletes — wait for SportsRadar
- Push notifications via APNs/FCM — Web Push first, native push later
- Real-money DraftKings/FanDuel affiliate — would break DFS legal frame

---

*Last updated: 2026-05-26 — full build plan added for web + mobile path from demo to shipped product.*
