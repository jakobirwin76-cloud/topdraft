# Phase 1.1 — Auth: Design Doc

> Read this before writing any code. Every assumption below was verified against
> the current codebase on 2026-05-26. Anything marked **GROUNDED** has a file
> reference. Anything marked **NEW** does not exist yet.

---

## 1. What the codebase already gives us (GROUNDED)

| Piece | File | State |
|---|---|---|
| Browser Supabase client | `src/lib/supabase/client.ts` | reads `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| Server Supabase client (cookie-aware) | `src/lib/supabase/server.ts` | `getServerSupabase()` async, uses `next/headers` cookies |
| Service-role client | `src/lib/supabase/server.ts` | `getServiceSupabase()` — bypasses RLS, server only |
| Session-refresh middleware | `src/middleware.ts` | runs `supabase.auth.getUser()` per request, sets cookies |
| Edge backstop rate limit | `src/middleware.ts` | 240/min/IP on `/api/*` |
| Per-route rate limits | `src/lib/rate-limit.ts` | `auth` (5/300s), `signup` (3/3600s), `general`, `trade`, `chat`, `waitlist` |
| Turnstile verify | `src/lib/turnstile.ts` | server-side `verifyTurnstile(token, ip)` — dev pass-through when no key |
| Zod schemas | `src/lib/zod/index.ts` | `SignupInput`, `LoginInput`, `MfaEnrollInput`, `MfaVerifyInput` — **18+ DB check + 5-state geofence already enforced** |
| HTTP helpers | `src/lib/http.ts` | `json`, `parseJson`, `badRequest`, `unauthorized`, `forbidden`, `serverError` |
| Signup API | `src/app/api/auth/signup/route.ts` | creates auth user (email_confirm=false) + profile + audit log |
| MFA enroll API | `src/app/api/auth/mfa/enroll/route.ts` | returns `{ factorId, qrCode, secret, uri }` — `qrCode` is an SVG data-URI (no client lib needed) |
| MFA challenge API | `src/app/api/auth/mfa/challenge/route.ts` | issues a challenge for a factorId |
| MFA verify API | `src/app/api/auth/mfa/verify/route.ts` | verifies code, flips `profiles.mfa_enrolled=true` |
| Zustand auth store | `src/store/useAuthStore.ts` | shape: `{ user, profile, aalLevel, isLoading }` + setters — **no provider hydrating it yet** |
| UI primitives | `src/components/ui/{button,input,card}.tsx` | dark-violet themed, already used by demo |
| Motion tokens | `src/lib/motion/tokens.ts` | `spring.default`, `spring.snappy`, `press`, `fade`, `stagger` |
| Profiles table | `supabase/migrations/0001_schema.sql` | columns: `user_id`, `display_name`, `dob`, `state_code`, `country_code`, `mfa_enrolled`, `is_age_verified`, `is_geofence_ok`, `virtual_balance` (default 10000.00), `referral_code` |
| Profiles RLS | `supabase/migrations/0002_rls.sql` | self-read + self-update (limited columns) |

### Important behavior I verified, not guessed

- **Signup route uses `email_confirm: false`** → Supabase sends the verification email automatically. The redirect URL after the user clicks it comes from Supabase Dashboard → Auth → URL Configuration. We need a `/auth/callback` page to receive the redirect (Supabase appends `code=` query param when using PKCE flow).
- **`getServerSupabase()` is async** — must `await` it. Any new route must follow that pattern.
- **MFA verify route flips `profiles.mfa_enrolled` via the service-role client** (column-level grants block self-update). Already done — no extra work.
- **Profile starts with $10,000 virtual balance** by table default. No need to seed in the route.
- **`SignupInput` already blocks HI/ID/MT/NV/WA** via `US_STATE_ALLOWLIST` (verified — those 5 are NOT in the allow-list).
- **`SignupInput.password` requires 12+ chars w/ upper+lower+digit.** Login route should NOT re-enforce the 12-char rule — older accounts could exist with shorter passwords. `LoginInput.password.min(8)` already reflects this.
- **`auth` limiter is 5 per 5 minutes per IP** (`Ratelimit.slidingWindow(5, "300 s")`) — that's our login lockout primitive at MVP. We layer per-email on top.

### Mismatches I noticed but won't fix in this PR

- `.env.example` says `NEXT_PUBLIC_SUPABASE_ANON_KEY`; `env.ts` and all code use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Production envs are set correctly — this is a docs-only fix. Out of scope.
- Layout has zero providers (`src/app/layout.tsx` is bare). We'll add `<AuthProvider>` inside `<body>`.

---

## 2. What's missing (NEW — this PR scope)

### 2.1 New API routes (3)

| Route | Purpose | Inputs (Zod) | Output |
|---|---|---|---|
| `POST /api/auth/login` | Email + password + Turnstile → sign in | `LoginInput` (already exists) | `{ ok, mfaRequired: bool, factorId?: string }` |
| `POST /api/auth/logout` | Sign out + audit log | none | `{ ok: true }` |
| `GET /api/auth/session` | Return current user + profile + AAL | none | `{ user, profile, aal } \| { user: null }` |

**Login flow detail:**
1. Turnstile verify → 400 on fail
2. Per-IP `auth` rate limit (existing limiter)
3. Per-email lockout — NEW Upstash counter, key `lockout:email:{email.toLowerCase()}`, increment on failure, 10 failures in 15 min → 423 Locked
4. `supabase.auth.signInWithPassword(...)` — fails closed
5. Check `supabase.auth.mfa.listFactors()` — if a verified TOTP factor exists, AAL is currently `aal1`; return `mfaRequired: true, factorId: <id>`. Client navigates to `/auth/mfa/challenge?factorId=...`
6. Audit log row: `action: "auth.login"`, with metadata `{ mfa_required: bool }`
7. **Per-email counter reset on success**

### 2.2 New pages (7)

All pages: dark `--bg`, max-w 420px centered card, `<Card>` from `ui/`, Inter Tight 800 heading, monospaced subhead, single accent button. Mobile-first.

| Page | Route | Purpose |
|---|---|---|
| Signup | `/signup` | Form → `POST /api/auth/signup`. On 201 redirect to `/auth/verify-email?email=...` |
| Login | `/login` | Form → `POST /api/auth/login`. On `mfaRequired` redirect `/auth/mfa/challenge?factorId=...`. Else redirect `/app` |
| Verify email landing | `/auth/verify-email` | "Check your inbox at {email}. Click the link to continue." Resend button (calls Supabase `resend` server-side via new route — punted, see §3) |
| Auth callback | `/auth/callback` | Server Component. Reads `?code=` from URL, calls `supabase.auth.exchangeCodeForSession(code)`, redirects to `/auth/mfa/enroll` (first time) or `/app` |
| MFA enroll | `/auth/mfa/enroll` | Calls `POST /api/auth/mfa/enroll` on mount, renders QR (img src=qrCode), 6-digit input → `POST /api/auth/mfa/verify`. On success, redirect `/app` |
| MFA challenge | `/auth/mfa/challenge?factorId=...` | On mount call `POST /api/auth/mfa/challenge` with factorId, get challengeId. 6-digit input → `POST /api/auth/mfa/verify`. On success redirect to `?next=` or `/app` |
| Forgot password | `/forgot-password` | Email input + Turnstile → calls `POST /api/auth/forgot-password` (NEW — see §3) |
| Reset password | `/reset-password` | Reads recovery session from URL (Supabase handles via callback), shows new-password form → `supabase.auth.updateUser({ password })` |

**Form anatomy (shared pattern):**

```
<form onSubmit>
  <label>Email</label>
  <Input type="email" autoComplete="email" required />
  ...
  <invisible Turnstile div>
  <Button type="submit" disabled={submitting}>
    {submitting ? <Loader2/> : "Continue"}
  </Button>
  {error && <div role="alert" className="font-mono text-xs text-loss">{error}</div>}
</form>
```

Same `<Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />` pattern as the waitlist form.

### 2.3 Glue (2)

**`src/components/auth/AuthProvider.tsx`** (NEW)
- Client component.
- On mount: calls `GET /api/auth/session`, sets store.
- Subscribes to `supabase.auth.onAuthStateChange((event, session) => ...)` — refetches `/api/auth/session` on `SIGNED_IN`, `TOKEN_REFRESHED`, `SIGNED_OUT`, `MFA_CHALLENGE_VERIFIED`.
- Cleans up listener on unmount.
- No UI — just hydrates `useAuthStore`.
- Mounted inside `<body>` in `src/app/layout.tsx`.

**Middleware AAL2 gate** (`src/middleware.ts` — EDIT)
- After existing `supabase.auth.getUser()` call, read claims via `supabase.auth.getClaims()` to get AAL.
- If pathname starts with `/app`, `/portfolio`, `/leaderboard`, `/live`, `/quest`, OR `/api/trade`:
  - If no user → redirect `/login?next=<pathname>`
  - If user but `aal === "aal1"` AND `profile.mfa_enrolled === true` → redirect `/auth/mfa/challenge?next=<pathname>`
  - If user but no `profile.mfa_enrolled` AND pathname !== `/auth/mfa/enroll` → redirect `/auth/mfa/enroll`
- **Edge constraint:** `supabase.auth.getClaims()` works on the JWT in edge runtime. We do NOT query the DB from middleware (Node-only). So `profile.mfa_enrolled` will be read from the **JWT app_metadata** instead — see §4.
- For `/api/*` routes (other than `/api/trade`), middleware does NOT enforce auth — each route handles its own.

### 2.4 Database touch (1 — optional, deferred)

- No new tables. No new RLS. No new functions.
- Per-email lockout lives in Upstash, not Postgres.

---

## 3. Cuts — what I am NOT doing in this PR

These were in the broader 1.1 spec but adding them now bloats the PR. Each will get its own follow-up.

| Cut | Why | When |
|---|---|---|
| **Password reset routes** | Supabase has `resetPasswordForEmail` client-side. Wire as a follow-up so this PR stays focused on the signup→login→MFA happy path. | Phase 1.1b |
| **"Resend verification email" button** | Edge case until users complain. | Phase 1.1b |
| **Recovery codes UI** | Supabase TOTP factor reset works via email. | Phase 5.3 |
| **Social auth (Google/Apple)** | App Store may force later. | Phase 2 |
| **Magic-link login** | Out of model. | Never (unless replacing password entirely) |
| **Re-auth prompt** before account-edit | No account-edit page yet. | When that page ships |
| **Lockout UI** | Show generic "Too many attempts. Try again in N min." Already in scope. | This PR |

---

## 4. Decisions — locked for web + App Store

These were originally open questions; resolved 2026-05-26 after running the design through the App-Store lens.

### D1. MFA gating → Middleware enforces AAL2 only

- Middleware does **not** query the database (edge runtime can't do that cleanly).
- Middleware reads AAL from the JWT (`supabase.auth.getClaims()`) and checks: signed-in + aal2 → allow.
- If aal2 is missing, redirect to a single router page `/auth/mfa` that calls `supabase.auth.mfa.listFactors()` server-side and forwards the user to:
  - `/auth/mfa/enroll` if no verified TOTP factor exists
  - `/auth/mfa/challenge?factorId=...` if one does
- Same codepath on web and native — no Postgres trigger to drift.

### D2. `/app` is auth-gated; current stateless demo moves to `/demo`

- `/` — marketing landing (web only).
- `/demo` — stateless playground (current `/app/page.tsx` + `app-client.tsx` moved here).
- `/athlete/[slug]` — stays as is; treated as part of the demo on web, part of the real app once authed (the trade panel will gate itself in Phase 1.4).
- `/app` — **the real, authed dashboard** (built in Phase 1.3). Gated by middleware.
- Native (Capacitor) start URL → `/app`. Unauthed native users land on `/login` naturally. `/demo` remains reachable from a small "Try without signing up" link on `/login` — good for App Store reviewers.
- Landing-page CTA `Try the demo →` updated from `/app` → `/demo`.

### D3. First-run flow after signup

```
/signup → POST /api/auth/signup → 201
       → redirect /auth/verify-email?email=…
       → user clicks email link
       → /auth/callback (exchanges ?code= for session)
       → /auth/mfa (router) → /auth/mfa/enroll
       → user scans QR / pastes secret / taps otpauth://
       → POST /api/auth/mfa/verify
       → /app (real dashboard)
```

Personality Quest (Phase 1.2) inserts between MFA enroll and `/app` later.

### D4. MFA enroll page must work on a single phone (App Store realism)

The current `mfa.enroll()` response gives us three things:
- `qrCode` — SVG data-URI, perfect for scanning from a second device
- `secret` — base32 string, for manual entry
- `uri` — `otpauth://totp/...` string, opens Authenticator app on tap

The enroll page renders **all three**:
1. QR (large, top) — for desktop users with a phone in hand
2. "Open in your authenticator app" button → `<a href={uri}>` — handles single-phone case (taps straight into Authy / Google Authenticator / 1Password)
3. "Or enter this code manually" — copy-button next to the base32 secret
4. 6-digit input + Verify button

### D5b. Google + Apple Sign In — deferred to Phase 1.6 (or Phase 2.3, whichever lands first)

- 2026-05-26 — user asked about adding social auth, then chose to defer.
- **Rule we're committing to:** if/when we add Google, we add Apple at the same time, never just Google alone (App Store rejection risk).
- Prerequisites before adding either: Apple Developer account ($99/yr) + Apple Service ID + Sign In with Apple key, Google Cloud Console OAuth 2.0 client.
- Schema implication: OAuth gives email + maybe display_name, but never DOB or state. A `/auth/complete-profile` page collects those on first sign-in before creating the `profiles` row.
- TOTP MFA stays required even for OAuth users (Apple/Google MFA is not trusted as our AAL2 — same gate for everyone).
- Apple Private Relay (`*@privaterelay.appleid.com`) must be accepted as a valid email.

### D5. What's NOT in this PR for App Store (deferred to Phase 2.3 — Capacitor shell)

- Universal Links (iOS) / App Links (Android) — needed so the email-verification link opens the app, not Safari. Today, `/auth/callback` works as a normal route, which is the foundation both platforms will use.
- Custom URL scheme `topdrafts://auth/callback` — Supabase redirect URL config when the native shell ships.
- `window.Capacitor` platform detection on the landing page — also when the shell ships.
- Sign in with Apple — only required by App Store if we offer third-party login. We only offer email/password, so we're exempt for now.

These are all additive — none require redesigning what we're building in this PR.

### D6. Session storage = cookies only (never localStorage)

- Supabase SSR (`@supabase/ssr`) uses HttpOnly cookies. Verified in `src/lib/supabase/server.ts` + `src/middleware.ts`.
- **Why this matters for the App Store path:** iOS Safari's Intelligent Tracking Prevention purges localStorage after 7 days of site inactivity. If we ever switched to localStorage for "speed", iPhone web users would silently log out every week. Capacitor WebView shares the system cookie store, so cookie sessions persist across native app restarts.
- **Rule we're committing to:** no `auth.persistSession` flips to localStorage, no `setItem('supabase.auth.token', ...)` shortcuts. Cookies are the single source of truth.

### D7. Apple App Store policy commitments we already meet

| Apple rule | How we comply |
|---|---|
| In-app account deletion (iOS 16+) | Phase 5.9 — `/api/account/delete` (soft-delete + anonymize, preserves immutable trades ledger) |
| Apple Sign In | Not required at MVP — email/password only. Rule: if we ever add Google/Facebook, we add Apple at the same time, never just social-without-Apple |
| ATT prompt (iOS 14.5+) | Not required at MVP — no cross-app/cross-site tracking SDK |
| Real-money gaming declaration | DFS skill-game, play-money only at MVP, 18+ DB check, 5-state geofence. Declared at listing-submission time (not this PR) |
| IAP for digital goods (30% Apple cut) | MVP is free-to-play, no IAP. Phase 2 premium = RevenueCat on native, Stripe on web (App Store rules cleanly separate the surfaces) |
| Demo / guest access for reviewers | `/demo` accessible from `/login` via "Try without signing up" link |
| HTTPS-only | Vercel/Netlify enforce. HSTS preload in Phase 5.2 |
| TLS 1.2+ | Cloudflare/Netlify default |

---

## 5. File-by-file build order

Once the open questions above are resolved, I will write the code in this exact order. Each step ends with a smoke test before the next begins.

1. **`POST /api/auth/login`** — wire to Supabase, lockout counter, Turnstile, audit log
2. **`POST /api/auth/logout`** — `signOut()` + audit log
3. **`GET /api/auth/session`** — returns `{ user, profile, aal }`
4. **`src/components/auth/AuthProvider.tsx`** + mount in `layout.tsx`
5. **`/login` page** — smoke test: log in → header shows user
6. **`/signup` page** — smoke test: sign up → verification email received
7. **`/auth/callback` page** — smoke test: click email link → session set
8. **`/auth/mfa/enroll` page** — smoke test: scan QR with Authy → enter code → `mfa_enrolled=true` in DB
9. **`/auth/mfa/challenge` page** — smoke test: log in second time → challenge → AAL2
10. **Middleware AAL gate** + `/demo` rename (depends on Q2)
11. **Verify-email landing page** (`/auth/verify-email`)
12. `npm run typecheck && npm test` clean

---

## 6. What "done" means

- Brand-new user can: sign up → receive verification email → click link → enroll TOTP → land on `/app`.
- Returning user can: log in → enter TOTP code → land on `/app`.
- Logged-out visit to `/app` redirects to `/login?next=/app`.
- AAL1 visit to `/app` (no MFA) redirects to `/auth/mfa/enroll` or `/auth/mfa/challenge` as appropriate.
- `POST /api/trade` (when wired in Phase 1.4) checks AAL2 and returns 401 otherwise.
- `npm run typecheck` clean.
- Every form has loading + error + success states. No `console.log` of PII.
- All forms render at 375px without horizontal scroll.

---

*Created 2026-05-26. Update when scope changes.*
