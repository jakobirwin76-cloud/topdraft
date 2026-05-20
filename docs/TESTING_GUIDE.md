# AthleteX Testing Guide

**Effective Date:** 2026-05-10
**Audience:** Engineers contributing to AthleteX
**Stack:** Next.js 15 (App Router) · TypeScript · Supabase · Zod · Vitest · Playwright

---

## 1. Why Testing Is Non-Negotiable Here

AthleteX touches three systems where a silent regression is catastrophic:

1. **Money-equivalent ledger** — virtual currency must never be lost, double-credited, or leaked across users.
2. **Real-time pricing** — a bug that mis-prices an athlete during a live game converts immediately into thousands of bad trades.
3. **Multi-tenant data** — any RLS hole means user A can read or modify user B's portfolio. Day-zero PR disaster.

The testing pyramid below reflects that risk allocation: **a lot** of fast unit tests, fewer integration tests, a small set of end-to-end tests, and a dedicated security/RLS suite that is treated as a first-class deliverable.

```
       ┌──────────────────────┐
       │   E2E (Playwright)   │   ~20 tests, golden flows
       ├──────────────────────┤
       │  Security / RLS      │   every table × every role
       ├──────────────────────┤
       │  Integration         │   API routes, DB transactions
       ├──────────────────────┤
       │       Unit           │   Zod, pricing, AMM, utilities
       └──────────────────────┘
```

---

## 2. Tooling

| Layer | Tool | Why |
|---|---|---|
| Unit | **Vitest** | Fast, native ESM, drop-in for Next.js |
| Schema fuzzing | **Zod + fast-check** | Property-based tests for input validation |
| Integration | **Vitest + Supabase local (`supabase start`)** | Real Postgres, real RLS — no mocks |
| RLS / security | **Vitest + supabase-js with service-role + anon clients** | Prove every policy holds |
| E2E | **Playwright** | Cross-browser, real auth flows, mobile viewport |
| Load | **k6** (or Artillery) | WS server pre-flight before big games |
| Static | **TypeScript strict + ESLint + Biome** | Catch the cheap class of bug |
| Coverage | **Vitest --coverage (v8)** | Target 80% lines on the trading + auth packages, lower elsewhere |

---

## 3. Unit Tests

### 3.1 Zod Schemas

Every server input schema gets at least three tests:

- ✅ a known-good payload parses cleanly
- ❌ a payload missing a required field rejects with the expected error
- ❌ a payload with a wrong-type field rejects

Property-based example:

```ts
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { TradeInput } from '@/lib/schemas/trade';

describe('TradeInput', () => {
  it('accepts any positive integer quantity ≤ 1_000_000', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1_000_000 }), (qty) => {
        const result = TradeInput.safeParse({ athleteId: 'a-1', side: 'buy', quantity: qty });
        expect(result.success).toBe(true);
      }),
    );
  });

  it('rejects negative or zero quantity', () => {
    expect(TradeInput.safeParse({ athleteId: 'a-1', side: 'buy', quantity: 0 }).success).toBe(false);
    expect(TradeInput.safeParse({ athleteId: 'a-1', side: 'buy', quantity: -1 }).success).toBe(false);
  });
});
```

### 3.2 Pricing Engine (AMM)

The pricing engine is pure: `(state, event) → newState`. Unit tests cover:

- BasePrice × StatMultiplier × MarketPressure × EventMultiplier produces the documented value for golden inputs.
- Order of trade events does not desync price (associativity of buy/sell impact).
- Off-season decay never moves a price below the configured floor.
- Stat-error rollback inverts a previously applied event exactly (idempotent inverse).

Each test pins a specific scenario from the design doc so a refactor that breaks the algorithm fails loudly.

### 3.3 Utilities

Deterministic helpers (date math, geofence checks, virtual-currency formatting) get straight unit tests. Aim for 100% line coverage on these modules — they're tiny and a typo breaks user-visible numbers.

---

## 4. Integration Tests (API Routes)

Run against a **local Supabase instance** (`supabase start`). Each test:

1. Resets the DB to a known seed.
2. Creates a fresh test user via the admin API.
3. Hits the route with a `supabase-js` client signed in as that user.
4. Asserts response **and** asserts the DB state.

Critical routes to cover at MVP:

| Route | What we prove |
|---|---|
| `POST /api/auth/signup` | Schema validation, age gate (<18 rejected), state-geofence (restricted state rejected), user row + virtual-currency starter created in a single transaction |
| `POST /api/auth/mfa/verify` | TOTP + SMS branches; replay rejected; lockout after 5 failures |
| `POST /api/trade` | Buy → balance debited, holdings credited, price moved per AMM; insufficient balance rejected; rate limit triggers after N |
| `POST /api/trade` (concurrency) | 50 concurrent buys on same athlete: row-level lock holds, no oversell, total balances reconcile |
| `GET /api/portfolio` | Returns only the calling user's holdings (RLS) |
| `POST /api/referral` | Self-referral rejected; same-device velocity rejected; double-credit rejected |
| `POST /api/webhooks/sportsradar` | Signature required; replayed event deduplicated; bad signature rejected with 401 |

### 4.1 Concurrency Test Pattern

```ts
it('prevents oversell under 50-way concurrency', async () => {
  const promises = Array.from({ length: 50 }, () =>
    client.from('rpc/place_trade').insert({ athlete_id, side: 'buy', qty: 1 }),
  );
  const results = await Promise.all(promises);
  const ledgerSum = await sumLedger(athlete_id);
  expect(ledgerSum.totalShares).toBeLessThanOrEqual(MAX_SUPPLY);
  expect(results.filter((r) => r.error).length).toBeLessThan(50); // some succeed
});
```

---

## 5. Security & RLS Tests — A First-Class Suite

This is the suite that fails the build the loudest. It runs on every PR.

### 5.1 The Pattern

For every table with RLS, write three tests:

```ts
describe('RLS · portfolios table', () => {
  let alice: Client, bob: Client, anon: Client;

  beforeAll(async () => {
    alice = await signedInClient('alice@test');
    bob   = await signedInClient('bob@test');
    anon  = anonClient();
    await seedPortfolio(alice.userId, [{ athleteId: 'a-1', shares: 10 }]);
  });

  it('owner can read own portfolio', async () => {
    const { data } = await alice.from('portfolios').select('*');
    expect(data).toHaveLength(1);
  });

  it('non-owner CANNOT read others portfolio', async () => {
    const { data } = await bob.from('portfolios').select('*');
    expect(data).toEqual([]); // RLS hides rows, no error
  });

  it('anonymous CANNOT read portfolios at all', async () => {
    const { error } = await anon.from('portfolios').select('*');
    expect(error).toBeTruthy(); // policy denies
  });

  it('non-owner CANNOT update others portfolio', async () => {
    const { error } = await bob.from('portfolios').update({ shares: 9999 }).eq('user_id', alice.userId);
    expect(error).toBeTruthy();
  });

  it('non-owner CANNOT delete others portfolio', async () => {
    const { error } = await bob.from('portfolios').delete().eq('user_id', alice.userId);
    expect(error).toBeTruthy();
  });
});
```

### 5.2 RLS Coverage Matrix (every checked table × every role)

| Table | anon | authenticated (other user) | authenticated (owner) | service_role |
|---|---|---|---|---|
| `users` | ❌ | row hidden | ✅ self only | ✅ all |
| `portfolios` | ❌ | row hidden | ✅ self only | ✅ all |
| `trades` | ❌ | row hidden | ✅ self only | ✅ all |
| `athletes` (public catalog) | ✅ read | ✅ read | ✅ read | ✅ all |
| `prices` (public read) | ✅ read | ✅ read | ✅ read | ✅ writes only via service_role |
| `chat_messages` | ❌ | ✅ read by athlete-room membership | ✅ author can edit/delete | ✅ all |
| `referrals` | ❌ | row hidden | ✅ self only | ✅ all |
| `audit_logs` | ❌ | ❌ | ❌ | ✅ all |

The matrix lives in `tests/security/rls.matrix.ts` and is asserted automatically — adding a new table without a row in the matrix is a build failure.

### 5.3 Other Security Tests

- **Auth bypass**: every authenticated route called without a token returns 401, with a tampered token returns 401, with an expired token returns 401.
- **Input fuzzing**: every API route receives 100+ malformed payloads (SQL injection strings, oversized JSON, unicode tricks, prototype pollution); none should produce a 5xx.
- **Rate limit**: hammering an endpoint exceeds the configured ceiling and returns 429 with `Retry-After`.
- **Webhook signature**: SportsRadar webhook with a bad HMAC is rejected.
- **Replay protection**: same Stripe webhook event delivered twice is processed exactly once (idempotency key).

---

## 6. End-to-End (Playwright)

A minimal, golden-path suite. Runs nightly + on `main`.

| Flow | Steps |
|---|---|
| Signup → MFA → first trade | New email → DOB + state → Apple OAuth → MFA enrollment → land on Home → tap athlete → buy 1 share → see in Portfolio |
| Login + suspicious-device alert | Sign in from a new geo (set viewport + IP via test proxy) → email alert + verification step required |
| Trade during live game (mocked) | Inject a synthetic SportsRadar event via test webhook → confirm WS push → confirm price tick on Live screen |
| Account deletion | Settings → Delete → confirmation → row absent on next login attempt |

E2E runs against a preview deployment on Vercel against a staging Supabase project that mirrors production schema and RLS exactly.

---

## 7. Load Testing (Pre-Game-Day)

Scheduled k6 runs validate WS + API capacity before NFL Sundays:

- 50k connected WebSocket clients holding subscriptions for 10 minutes.
- 10k concurrent trade requests over a 60-second window.
- Pricing-event fan-out: a single SportsRadar event reaches all subscribed clients in <500 ms p99.

Acceptance criteria:

- API p99 < 250 ms under target load.
- WS broadcast p99 < 500 ms.
- DB CPU < 70%, no Postgres connection saturation.

A failed load test blocks rollout to the affected game day.

---

## 8. CI / CD Wiring

Every PR runs:

1. `pnpm lint && pnpm typecheck`
2. `pnpm test` (unit + integration + security)
3. Coverage report uploaded; coverage drop > 2% on `lib/trading/**` or `lib/auth/**` blocks merge.
4. Playwright smoke (login + trade) on Vercel preview.

`main` adds:

5. Full Playwright suite.
6. Nightly k6 baseline.

---

## 9. Test Data and Fixtures

- A `seed/` directory with deterministic JSON fixtures for athletes, prices, and a small roster of test users.
- A factory module (`tests/factories.ts`) exposing `makeUser({ state: 'CA', dob: '1995-01-01' })` etc., with sensible defaults.
- Never use production data, even anonymized, in tests.

---

## 10. What We Are Deliberately NOT Testing (Yet)

- **Visual regression** — too noisy at MVP; revisit Phase 2.
- **Cross-browser matrix beyond Chrome + Safari** — PWA-first means iOS Safari + Chromium covers >95% of the audience.
- **AI-driven smoke tests** — interesting but not a Day-1 cost.

---

*Document version: v0.1 — keep current as the test surface grows. Every new API route is expected to ship with corresponding unit + integration + RLS tests.*
