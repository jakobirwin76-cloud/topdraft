# CLAUDE.md — Topdraft

> The operating manual. Read this at the start of every session. The session-starter prompt is at the bottom.

---

## WHAT WE'RE BUILDING

**Topdraft** is a skill-based fantasy sports trading game. Users buy and sell virtual "shares" of professional athletes. Athlete prices move live during games based on real performance (stat events) and community trading volume (AMM). Users can pre-game, in-game, and post-game trade. Free to play. 18+. **Not** a sportsbook. **Not** a securities exchange. **Not** real-money gambling at MVP.

- **Working name:** Topdraft
- **Domain:** TBD (topdraft.app or topdraft.gg likely — name locked 2026-05-13, was previously AthleteX)
- **Repo directory:** still `/Users/jakeirwin/Desktop/athletex/` — the working dir keeps the old name; only the brand changed
- **Brand accent:** `#6D28D9` Obsidian Violet (deep purple, solid). **Never** as a gradient. Used sparingly on a near-black purple bg. *(updated 2026-05-16 from `#6366F1` Electric Indigo — Polymarket-style dark-purple/white repalette.)*
- **Legal frame:** skill-based fantasy game (DFS exemption, UIGEA-compliant)
- **Money model at MVP:** play money only + revenue from **ads from Day 1**. Sweepstakes-coin Phase 2.
- **Theme:** Dark mode ONLY at MVP; light mode Phase 2.
- **Launch sports:** NFL + NBA + Soccer (Premier League / UCL / MLS).
- **Pricing engine:** AMM (Automated Market Maker) — the app is always the counterparty. **No** order book. **No** peer-to-peer matching.

---

## DESIGN PHILOSOPHY — READ THIS EVERY SESSION

This app must NEVER look AI-generated or vibe-coded. It must look like a $500K agency built it. Every design decision matters.

### Visual identity

- **Dark mode ONLY** at MVP. Background `#0D0D0D` (not pure black).
- **One primary accent color** — `#6D28D9` solid deep violet. Use it sparingly and with purpose. Never as a gradient.
- **Typography (updated 2026-05-13):** **Inter Tight** (display, 700–800 weight) + **Inter** (body/UI, variable) + **JetBrains Mono** (data — prices, percentages). All free via Google Fonts. *Bebas Neue + IBM Plex Mono replaced during institutional-finance overhaul.*
- **Numbers and odds always monospaced** (IBM Plex Mono).
- **Tight letter spacing on headlines** (-0.02em to -0.04em).
- **Generous whitespace** — more than you think you need.

### Color tokens (locked — updated 2026-05-16)

```css
--bg:           #0A0710;             /* obsidian violet — almost-black purple */
--surface:      #120D1E;             /* elevated cards */
--surface-2:    #1A1330;             /* nested surfaces */
--border:       rgba(255,255,255,0.07); /* hairline */
--text:         #FFFFFF;             /* primary */
--text-mute:    #9E97B2;             /* secondary */
--text-dim:     #564F70;             /* tertiary */
--accent:       #6D28D9;             /* Obsidian Violet — deep purple, solid only */
--accent-2:     #8B5CF6;             /* hover/highlight */
--accent-soft:  rgba(109,40,217,0.10); /* violet wash */
--win:          #22C55E;
--loss:         #EF4444;
```

> **2026-05-16 — Obsidian Violet repalette.** Moved off Electric Indigo to a
> Polymarket-style near-black purple + white. Hero headline is now **solid
> white** (the prior 4-stop indigo→fuchsia→cyan gradient was the #1 AI-slop
> tell and is deleted). Ambient page glow collapsed from 4 colors to a single
> restrained `#6D28D9`. Accent stays **solid, never a gradient.**

**Phase 2 light mode** (deferred): `#FFFFFF` bg, `#0F0A1E` text, `#6D28D9` deep violet accent. Do not build now.

### Color rules

- **NEVER** use purple **gradients** — the #1 sign of AI slop. Solid violet only.
- **NEVER** use blue default buttons (`#3B82F6` etc.).
- **NEVER** use generic shadows like `box-shadow: 0 0 10px rgba(0,0,0,0.1)`.
- **NEVER** use Tailwind's default color palette without aliasing through CSS variables.
- Red (`--loss`) is reserved for losses + critical errors. Don't use for general delete buttons or warnings.

### Motion & animation

- **Library:** Framer Motion + simple CSS transitions.
- **Default easing:** organic spring (`stiffness: 220, damping: 28, mass: 0.9`). **Never** linear.
- **Hover transitions:** 150–200ms ease.
- **Number changes (prices, balances):** must *count* not snap. Use a count-up animation.
- **Page loads:** staggered reveal — elements fade-in sequentially (60ms stagger).
- **No** bouncing, no spinning loaders, no rotating refresh icons. Subtle and fast.
- **All animations on transform/opacity only** (GPU-accelerated). No animating top/left/width/height.

### Components that must look custom (not shadcn defaults)

| Component | Spec |
|---|---|
| **Buttons** | Primary = solid violet on dark, tight tracking, monospaced label. Ghost = 1px border, no fill. Never rounded-full. |
| **Cards** | `--surface` background, 1px `--border`, no shadow. Hover lifts to `--surface-2`. |
| **Athlete price** | Monospaced. Green for +, red for −. Animates on every tick. |
| **Athlete avatar** | Initials in a colored disc. Only place `rounded-full` is allowed. |
| **Buy/Sell sheet** | Slides in from the right (desktop) / bottom (mobile). Never a modal popup. |
| **Live ticker** | Compact horizontal scroll of moving prices. IBM Plex Mono. Pause on hover. |
| **User balance in header** | Always visible. Animates on change (count-up, not snap). |
| **Leaderboard** | Trading-blotter style. Dense rows, monospaced numbers, no cards. |
| **Skeleton loaders** | Dark shimmer animation. Never a white flash on dark. |
| **Quest cards** | Full-screen swipe. 1px border. Selected card: violet glow + 1.02 scale. |

### 8px spacing grid — non-negotiable

All spacing in multiples of 8px: 8, 16, 24, 32, 40, 48, 64, 80, 96, 128. Tailwind: only use `gap-1`, `gap-2`, `gap-3`, `gap-4`, `gap-5`, `gap-6`, `gap-8`, `gap-10`, `gap-12`, `gap-16`, `gap-20`, `gap-24`. Never `gap-7`, `gap-9`, `gap-11`.

---

## TECH STACK — USE EXACTLY THIS

- **Framework:** Next.js 15 (App Router) — already scaffolded
- **Language:** TypeScript strict mode
- **Styling:** Tailwind v4 + custom CSS variables in `src/app/globals.css`
- **Animations:** Framer Motion (`motion/react` import)
- **Icons:** Lucide React (`lucide-react`)
- **Client state:** **Zustand** (new addition from this CLAUDE.md)
- **Database / auth / realtime:** Supabase (Postgres + Auth + Realtime + Storage)
- **Validation:** Zod
- **Rate limiting:** Upstash Redis + `@upstash/ratelimit`
- **Email:** Resend
- **Payments:** Stripe (web/PWA premium subs); RevenueCat in native shells Phase 2
- **Bot mitigation:** Cloudflare Turnstile
- **Sports data:** SportsRadar (dev tier MVP → commercial Phase 1.5)
- **Hosting:** Vercel
- **Testing:** Vitest + Playwright

**DO NOT** suggest alternatives without asking. **DO NOT** install Inter/Roboto. **DO NOT** use create-react-app or Vite — Next.js only.

---

## CODING RULES — NON-NEGOTIABLE

### 1. PLAN BEFORE YOU CODE
Before writing any code, write the plan as bullet points. Wait for my confirmation. Never start coding without my approval of the plan.

### 2. COMPONENTS
- Every UI component goes in `src/components/`
- Base design-system components in `src/components/ui/`
- Every component has TypeScript types — never `any`
- No inline styles — Tailwind classes or CSS variables only
- No hardcoded colors — always use CSS variables via Tailwind utility classes wired through globals.css

### 3. FILE STRUCTURE
```
src/
├── app/                  Next.js App Router pages + API routes
│   ├── api/              Route handlers
│   ├── (auth)/           Login, signup, MFA enrollment
│   ├── (quest)/          Personality Quest screens
│   ├── (app)/            Authed app shell (Home, Market, Live, Portfolio)
│   └── waitlist/         Public waitlist landing + /me dashboard
├── components/           Feature components
│   └── ui/               Design-system primitives (Button, Card, etc.)
├── lib/                  Pure utilities
│   ├── env.ts            Zod-validated env vars
│   ├── supabase/         Supabase server + client
│   ├── zod/              Input schemas
│   ├── pricing/          AMM engine (TS mirror of SQL function)
│   ├── motion/           Framer Motion tokens
│   └── rate-limit.ts
├── hooks/                Custom React hooks
├── store/                Zustand stores
├── types/                Shared TS types
└── middleware.ts         Auth + edge rate-limit
supabase/migrations/      SQL migrations (0001 schema, 0002 RLS, 0003 fns)
tests/unit/               Vitest unit tests
tests/security/           RLS coverage tests
tests/e2e/                Playwright golden paths
docs/                     Privacy, ToS, Compliance, Testing, Marketing, Quest
```

### 4. NEVER DO THESE
- Blue default buttons (`#3B82F6` and similar)
- `rounded-full` on anything except avatars
- Generic shadows (`0 0 10px rgba(0,0,0,0.1)`)
- Purple gradients (solid violet only)
- Lorem ipsum placeholder text
- TODO comments in main branch
- Roboto / Arial / Helvetica / `system-ui` anywhere *(Inter is the new body font as of 2026-05-13)*
- Animating `width`, `height`, `top`, `left` (transform/opacity only)
- Mocking the database in tests — always real local/hosted Supabase
- Calling `process.env` directly in app code — go through `src/lib/env.ts`
- Storing API keys client-side (`NEXT_PUBLIC_*` for browser-safe only)
- Skipping Zod on any route handler input

### 5. ALWAYS DO THESE
- Semantic HTML (`nav`, `main`, `section`, `article`, `aside`)
- Every interactive element has a hover **and** focus state
- Mobile-first responsive (test 375px, 390px, 768px, 1024px)
- Loading state for every async operation (skeleton, not spinner)
- Error state for every fetching component
- Empty state with helpful message + CTA
- Use Lucide icons — never emoji as UI
- Numbers monospaced (`font-mono` Tailwind utility → IBM Plex Mono)
- Verify auth + RLS on every API route — never trust the client

### 6. SECURITY — THE FORTRESS RULES
1. **API keys server-side only.** Use `src/lib/env.ts`. Never `process.env.SECRET` in components.
2. **Zod on every input.** Use `parseJson(req, Schema)` from `src/lib/http.ts`.
3. **RLS on every table** — default deny. Add a row to the RLS coverage matrix when you add a table.
4. **Rate limit every API route.** Choose the right limiter in `src/lib/rate-limit.ts`.
5. **MFA required at signup** (TOTP). Trade routes require AAL2.
6. **HMAC-verify all webhooks** with `crypto.timingSafeEqual`.
7. **No service-role key in middleware** — it runs on the edge and leaks more easily.
8. **CSP, HSTS, X-Frame-Options** set in `next.config.ts`.

### 7. TRADE SAFETY — LAUNCH BLOCKERS (anti-front-running)

The threat: users at the stadium / on RedZone / on faster sports feeds can see plays before our SportsRadar webhook fires. Without protection, they'd buy 2-5 seconds before every TD and print free money from the AMM. **Two mandatory mitigations must ship before any real trade flow goes live:**

1. **15-second broadcast delay on the public price feed.**
   - Webhook ingests `stat_event` in real-time, applies it internally.
   - The price clients SEE is delayed by 15s (matches average TV broadcast lag).
   - Everyone — stadium goers, RedZone watchers, normal users — trades on the same delayed snapshot. Nobody has an edge.

2. **10-second trade halt on high-impact events.**
   - When `|multiplier - 1| > 0.04` fires (TD, INT, big play, fumble, etc.), set `athletes.market_halt_until = now() + interval '10 seconds'`.
   - `place_trade()` checks this column at the top and raises `market_halted` if set.
   - UI shows "MARKET PAUSED · LIVE EVENT" banner during the halt.

**Required schema** (migration `0006_trade_safety.sql`, not yet written):
```sql
alter table public.athletes add column market_halt_until timestamptz;
create index idx_athletes_halt on public.athletes(id) where market_halt_until is not null;
```

**Required `place_trade()` check** (insert after the athlete row lock):
```sql
if v_athlete.market_halt_until is not null and v_athlete.market_halt_until > now() then
  raise exception 'market_halted' using errcode = '22023';
end if;
```

**Phase 2 (post-launch hardening):** 1-second execution lag on every trade, surveillance dashboard flagging users who consistently buy seconds before positive events.

**DO NOT** ship real trading (PROMPT 8) without items 1 and 2 above. Launch without them = arbitrageurs drain the AMM.

---

## AD STRATEGY — FROM DAY 1

We monetize via ads + premium subscription. Sweepstakes Phase 2.

| Layer | Inventory | Placement | Day |
|---|---|---|---|
| **AdSense banner** | Generic display ads | Settings page, Leaderboard footer, NOT trade flow | Day 1 |
| **DFS affiliate** | Underdog, Sleeper, Betr referral codes | "Earn Virtual Currency" surface in-app + post-trade share modal | Day 1 |
| **Streaming affiliate** | Fubo, ESPN+, DAZN | Athlete profile "Watch live on…" CTA | Phase 1.5 |
| **Sponsored athlete spotlights** | Direct brand deals (energy, equipment) | Featured tile on Market home | Phase 2 |
| **Sportsbook affiliate (DK/FD)** | DraftKings, FanDuel CPA | **NEVER** — would break our DFS legal frame; states require affiliate licensing | ❌ |
| **Online casino affiliate** | Any | **NEVER** | ❌ |

**Ad rules:**
- Ads NEVER appear on the trade flow, Quest, MFA enrollment, or first-run Home.
- Disclose all sub-processors in PRIVACY_POLICY.md.
- FTC `#ad` disclosure on every affiliate CTA.
- Geofence sportsbook/DFS affiliate links by user's `state_code` — never show in restricted states.

---

## PROMPTS TO USE — COPY/PASTE IN ORDER

**Note:** Prompts 1, 5, 8 are partially done. The scaffold lives in this repo already.

### PROMPT 1 — PROJECT SETUP ✅ (already done)
Already scaffolded: Next.js 15 + TS strict + Tailwind v4 + Supabase + Zod + Upstash + Resend + Stripe + Vitest + Playwright. Bebas Neue + IBM Plex Mono loaded.
**Outstanding:** install `framer-motion`, `lucide-react`, `zustand`. Add Zustand stores skeleton in `src/store/`.

### PROMPT 2 — DESIGN SYSTEM
```
Read CLAUDE.md. Build the design system in src/components/ui:
- Button (variants: primary, secondary, ghost, danger)
- Badge (live, upcoming, settled, win, loss, archetype-{Sharp,Hype,Loyalist,Chiller,Whale})
- Card (surface, no shadow, hover lifts to surface-2)
- Input (dark, focus ring in --accent)
- AthletePrice (monospaced, animates on change, win/loss colored)
- AvatarDisc (initials in colored disc, only rounded-full allowed)
- Skeleton (dark shimmer, never white flash)
- LiveTicker (horizontal compact)
References: Linear button, Robinhood number display, Vercel card.
No shadcn defaults. Show the plan first.
```

### PROMPT 3 — WAITLIST LANDING ✅ (next priority — see /docs/MARKETING_PLAN.md)
```
Build the waitlist landing at /waitlist + post-signup at /waitlist/me.
- Hero: "Your sports IQ is worth money." Bebas, big.
- Email-only form + Turnstile.
- POST /api/waitlist/join (Zod-validated, rate-limited 3/hour/IP).
- Supabase table 'waitlist' (id, email, position bigserial, referral_code, referred_by, referrals_count, email_verified, promoted_to_app).
- /waitlist/me dashboard: position number, share link, "moved up X spots" delta.
- /w/[code] route: sets referrer cookie, redirects to /waitlist.
- Resend email templates: welcome, milestone updates, launch alert.
- RLS: anyone with their signed token can read their own row; service-role only for writes.
Show the plan first.
```

### PROMPT 4 — AUTH + MFA ✅ (partially done — signup + MFA routes exist)
```
Polish the existing auth flow:
- /signup page (email, password, displayName, DOB date picker, state dropdown, Turnstile widget)
- /login page (email, password, Turnstile)
- /auth/mfa/enroll page (QR code render via supabase TOTP)
- /auth/mfa/challenge + verify pages
- Server middleware refresh + AAL2 check before /trade routes
- Zustand store: useAuthStore() exposing user, profile, aal level
NO social auth at MVP. Email only.
Show the plan first.
```

### PROMPT 5 — PERSONALITY QUEST
```
Build the 5-question Quest at /quest/[step] + cinematic reveal at /quest/reveal.
- Reference docs/ONBOARDING_QUEST.md for the 5 questions, archetypes, mapping.
- Each step is a full-screen swipe (Framer Motion AnimatePresence).
- 4 answer cards per question, spring-in staggered (motion.spring.cinematic).
- Selected card: violet glow + 1.02 scale + accent border.
- Progress dots top-right (1/5 → 5/5).
- POST /api/quest/save-answer on each pick (server saves immediately for re-entry).
- POST /api/quest/finalize derives archetype server-side (deriveArchetype in src/lib/onboarding).
- Reveal screen: "YOU ARE A {ARCHETYPE}" Bebas 96px, 2.5s sequence.
- Auto-generates a share PNG via /api/quest/share-card.
- Migration: supabase/migrations/0004_archetype.sql adds archetype_primary/secondary, quest_completed_at, onboarding_responses table with RLS.
Show the plan first.
```

### PROMPT 6 — HOME / DASHBOARD
```
Build /app (authed Home) with:
- Header: logo left, Balance + Avatar right. Balance animates on change.
- HERO: One big portfolio number (animated count-up). Bebas, 64px+.
- LIVE ALERT BAND: if user holds someone playing right now — appears with subtle pulse.
- Top movers row (horizontal scroll cards).
- Leaderboard ticker (compact, IBM Plex Mono, slow scroll).
- Bottom nav: Home / Market / Live / Portfolio / Profile.
- Archetype-tuned default tab on first session (Sharp → Live, Hype → Market, Loyalist → Athlete Chat, Chiller → Portfolio, Whale → Home).
Layout: vertical scroll, NO bento at MVP (defer to Phase 2). Robinhood-style.
Reference: existing /docs/ONBOARDING_QUEST.md for archetype tuning.
Show the plan first.
```

### PROMPT 7 — MARKET + ATHLETE PROFILE
```
/market — list of athletes filterable by NFL/NBA/Soccer.
  - Each row: AvatarDisc + name + team + current price + 24h % change + sparkline.
  - Live ticker at top.
  - Search (Lucide Search icon, debounced).

/athlete/[id] — Athlete profile.
  - Header: AvatarDisc + name + team + position + base/current price.
  - Price chart: 7d default, 1d/7d/30d/season toggles. Use lightweight-charts or recharts (dark theme).
  - Stats summary (last game).
  - Buy/Sell action sheet (slides in from right desktop, bottom mobile).
  - Athlete chat (Sleeper-style social, RLS-gated to authenticated).
  - "Watch live" affiliate CTA (Fubo/ESPN+) — Phase 1.5.
Show the plan first.
```

### PROMPT 8 — TRADE FLOW (AMM, NOT ORDER BOOK)
```
Reuse the existing /api/trade route + supabase place_trade() function.
Build the client UX:
- Trade sheet: athleteId pre-filled, side toggle (Buy/Sell), shares input (with quick-pick 1/5/10/25), total cost computed live.
- Show estimated price impact (call AMM in lib/pricing/amm.ts client-side).
- Confirm step requires MFA AAL2 — re-prompt TOTP if needed.
- Haptic on confirm (mobile only).
- Success: animated balance update + shareable P&L card link.
NO order book. NO peer-to-peer matching. The app is always the counterparty.
Show the plan first.
```

### PROMPT 9 — LIVE TAB
```
Build /live — active games with user holdings.
- Game cards: live score, time remaining, athletes user holds, current price ticking.
- WebSocket subscribes to Supabase Realtime on price_history rows.
- Two-button trade: "Buy More" / "Sell" (no need to leave the screen).
- Visual: subtle pulse animation when a price moves >1% in <5 seconds.
Show the plan first.
```

### PROMPT 10 — PORTFOLIO
```
Build /portfolio — trading-blotter style, NOT cards.
- Tabs: Holdings | Trade History | P&L
- Holdings table: athlete, shares, avg cost, current price, P&L $, P&L %.
- Dense rows, monospaced numbers (font-mono).
- Animated rank changes on the leaderboard view.
- Shareable card button per row → calls /api/share-card.
Show the plan first.
```

### PROMPT 11 — LEADERBOARD
```
Build /leaderboard:
- Top 100 by % gain.
- Tabs: Daily / Weekly / All-time.
- User's row highlighted even if outside top 100.
- Animated rank changes (green flash up, red down).
- Crypto-trading-leaderboard aesthetic.
Show the plan first.
```

### PROMPT 12 — MOBILE RESPONSIVE
```
Audit every page. Fix at 375, 390, 768px.
- Header: bottom-nav on mobile, top-nav on desktop.
- Trade sheet: bottom sheet on mobile, right slide-in on desktop.
- All touch targets ≥ 44px.
- Show every issue found before fixing.
```

### PROMPT 13 — PERFORMANCE AUDIT
```
- Remove unused Tailwind classes (purge already on).
- Remove unused imports.
- next/image on all athlete images (when added).
- loading.tsx for every route that fetches.
- error.tsx for every route.
- Metadata (title, description) on every page.
- All animations via transform/opacity.
- No CLS on load.
Show every issue first.
```

### PROMPT 14 — SECURITY REVIEW
```
Audit codebase:
- Every API route verifies session before DB write.
- No user can mutate another user's portfolio.
- No client access to admin routes.
- All inputs Zod-validated + sanitized.
- No secrets in client bundle (check for SUPABASE_SERVICE_ROLE in client code — must be ZERO matches).
- Rate limit confirmed on /api/orders, /api/waitlist, /api/auth/*, /api/trade.
- RLS coverage matrix updated for every new table.
Show every vulnerability first.
```

### PROMPT 15 — FINAL POLISH
```
Brutal pass on every page:
- Hover states smooth + intentional?
- Loading states premium (no generic spinners)?
- Empty states have a message + CTA?
- 8px grid everywhere?
- Contrast ratio passes WCAG AA?
- "Does this look AI-generated?" — if yes, make it distinctive.
```

---

## REFERENCE APPS — STUDY THESE

- **Robinhood** — dark mode, number animations, calm fintech, "one big number" home
- **Linear** — spacing, typography, motion (organic springs, never linear easing)
- **Sleeper** — social-first sports UX, chat-per-athlete pattern
- **Vercel Dashboard** — dark theme done right, generous whitespace
- **Polymarket** — insider/cult tone, prediction-market data density
- **Sporttrade** — order book UI (study even though we don't use it)
- **Bloomberg Terminal** — high data density, professional feel

## NEVER REFERENCE OR COPY

- DraftKings — too loud, too promotional
- FanDuel — same
- Generic SaaS templates (shadcn defaults, HeroUI, Vercel landing-page kits)
- **Purple gradient anything** — #1 AI slop tell
- Rounded pill buttons on primary actions
- Glassmorphism overdone (subtle layered translucency on Live tab only)
- "AI-bot mascot" UX patterns

---

## DOCS THAT LIVE IN THIS PROJECT (KEEP THEM CURRENT)

| File | Purpose |
|---|---|
| `docs/PRIVACY_POLICY.md` | GDPR + CCPA, sub-processors disclosed, **ads disclosed** |
| `docs/TERMS_OF_USE.md` | DFS skill-game frame, stat-error rollback clause |
| `docs/IP_COMPLIANCE.md` | USPTO TESS checklist, Mojo FTO, OSS license CI |
| `docs/TESTING_GUIDE.md` | RLS coverage matrix, 80% gates on trading + auth |
| `docs/ONBOARDING_QUEST.md` | 5-question Quest, archetype mapping, visual spec |
| `docs/MARKETING_PLAN.md` | TikTok/X/Reddit/IG playbook, FTC guardrails |
| `docs/COMPLIANCE_CHECKLIST.md` | (TODO — alias of IP_COMPLIANCE; create on next pass) |
| `docs/QA_CHECKLIST.md` | (TODO — 10-min manual golden-path before every deploy) |

---

## REMINDERS — EVERY SESSION

0. **When the user says "checklist"** → immediately read `docs/CHECKLIST.md` and surface it in the chat. That file holds the active priority list — done items, next up, and anti-patterns to avoid. Update it as items get checked off.
1. **Read CLAUDE.md** at the start.
2. **Plan before coding** — always show the plan first.
3. **One feature at a time** — never jump ahead.
4. After each prompt, ask: *"Does this look like it was vibe-coded?"* If yes, fix before moving on.
5. **Run `npm run typecheck && npm test`** before claiming a feature is done.
6. **Update the relevant doc** in `/docs/` when you ship a feature (Privacy when a sub-processor changes; Testing when a new table needs RLS; Quest when archetype mapping changes).

---

## SESSION STARTER PROMPT

Paste this at the start of every Claude Code session:

```
Read CLAUDE.md in the project root. Remind me where we left off
(scan git log + the docs/ folder for recent changes) and what the
next step is. Do not write any code until I confirm the plan.
```
