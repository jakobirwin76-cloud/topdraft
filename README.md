# AthleteX

> Skill-based fantasy sports trading. Build a virtual portfolio of athletes, trade on every play, climb the leaderboard.

**Stack:** Next.js 15 (App Router) · TypeScript strict · Supabase (Postgres + Auth + RLS) · Zod · Tailwind v4 · Upstash Redis (rate limit) · Stripe (web subs) · Vitest + Playwright.

**Legal frame:** skill-based fantasy game, DFS exemption (UIGEA-compliant). **Not** a securities exchange. **Not** a sportsbook. **Not** real-money gambling at MVP.

---

## Quick start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in the keys. The app refuses to boot without them (see src/lib/env.ts).

# 3. Run the database migrations
#    Open Supabase Studio → SQL Editor and paste, in order:
#      supabase/migrations/0001_schema.sql
#      supabase/migrations/0002_rls.sql
#      supabase/migrations/0003_functions.sql
#      supabase/seed.sql                     (optional dev data)

# 4. Run
npm run dev
# → http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` / `lint:fix` | Biome lint + format |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit + integration |
| `npm run test:cov` | With coverage |
| `npm run test:e2e` | Playwright |

## Project layout

```
.
├── docs/                   # Privacy, ToS, IP, Testing — keep up to date
├── supabase/
│   ├── migrations/         # 0001_schema, 0002_rls, 0003_functions
│   └── seed.sql
├── src/
│   ├── app/
│   │   ├── api/            # Route handlers (auth, mfa, trade, portfolio, webhooks)
│   │   ├── layout.tsx
│   │   ├── page.tsx        # Waitlist landing
│   │   └── globals.css     # Tailwind v4 + theme tokens
│   ├── lib/
│   │   ├── env.ts          # Zod-validated server env (boot-time guard)
│   │   ├── supabase/       # server.ts, client.ts
│   │   ├── zod/index.ts    # All input schemas
│   │   ├── rate-limit.ts   # Upstash Ratelimit limiters
│   │   ├── http.ts         # JSON helpers + parseJson(req, schema)
│   │   ├── turnstile.ts    # Cloudflare bot check
│   │   └── pricing/amm.ts  # AMM pricing engine (mirror of SQL function)
│   └── middleware.ts       # Session refresh + edge backstop rate limit
└── tests/
    ├── unit/               # AMM, Zod
    └── security/rls.test.ts
```

## Security architecture (per Phase 3 spec)

| Concern | Implementation |
|---|---|
| API keys server-only | `src/lib/env.ts` — Zod-validated, throws at boot if missing |
| Input validation | Every route uses `parseJson(req, ZodSchema)` from `src/lib/http.ts` |
| Rate limiting | Two layers: edge backstop in `middleware.ts` (240/min/IP), per-route limiters in `src/lib/rate-limit.ts` |
| Bot mitigation | Cloudflare Turnstile on `/api/auth/signup` |
| RLS | Every table has policies in `0002_rls.sql`. Default-deny; explicit grants only. |
| MFA | Required for trading. Enrollment + challenge + verify routes under `/api/auth/mfa/*`. `/api/trade` enforces AAL2. |
| Webhook verification | HMAC-SHA256 timing-safe compare on the SportsRadar route |
| Atomic trades | Postgres `place_trade()` function with row-level locks; clients can't INSERT trades or modify holdings directly |
| Audit logging | `audit_logs` table written by `place_trade`, signup, and MFA enrollment |
| HTTP security headers | `next.config.ts` sets HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy |

## Endpoints

| Method | Path | Auth | Limiter | Notes |
|---|---|---|---|---|
| `POST` | `/api/auth/signup` | none | 3/h IP | Turnstile required |
| `POST` | `/api/auth/mfa/enroll` | session | 5/5min user | Returns TOTP QR |
| `POST` | `/api/auth/mfa/challenge` | session | 5/5min user | Returns challenge id |
| `POST` | `/api/auth/mfa/verify` | session | 5/5min user | Marks `mfa_enrolled = true` |
| `GET`  | `/api/athletes` | none | 120/min IP | `?sport=NFL\|SOCCER` |
| `GET`  | `/api/portfolio` | session | 120/min user | Self-only via RLS |
| `POST` | `/api/trade` | session + AAL2 | 10/min user | Calls `place_trade()` RPC |
| `POST` | `/api/webhooks/sportsradar` | HMAC | — | Idempotent on event id |

## Roadmap

See [docs/](./docs/) for the full plan. Short version:

- **Phase 1 (MVP):** waitlist + 5 screens + NFL/SOCCER + play-money. Done = users open the app during a live game.
- **Phase 2:** sweepstakes coin (DFS-equivalent prize redemption), KYC, RevenueCat in native shells.
- **Phase 3:** social feed, leaderboards, MLB/NHL/NBA, athlete IPOs.
- **Phase 4:** all sports, premium tier, partnerships.

## Contributing

Read [docs/TESTING_GUIDE.md](./docs/TESTING_GUIDE.md) before opening a PR. Every new API route must ship with unit + integration + RLS tests.
