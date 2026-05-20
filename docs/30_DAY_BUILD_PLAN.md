# Topdraft — 30-Day Build Plan (self-contained AI handoff)

> Paste this whole file to any AI/agent. It assumes no prior conversation. Goal:
> ship a working, deployed, play-money MVP in 30 days, built solo (16-year-old
> founder) with AI assistance, documented daily as a build-in-public series.

---

## 1. What we are building

**Topdraft** — a skill-based fantasy game. Users get play-money, "buy" and "sell"
virtual positions in pro athletes; an athlete's price moves based on real
performance and trading activity. It is a **game / scoreboard for sports takes**.

- **Play money ONLY.** No real money, no betting, no investing, no payouts.
- **Not** a sportsbook, securities product, or real-money gaming app.
- 18+ framing in product copy; pre-launch.

## 2. Honest scope — what "shipped on Day 30" means

Shipping the full vision in 30 days solo is NOT possible. Day 30 = a deployed
**web app (PWA), play money, ONE sport (~30 athletes)** where a user can:

1. Sign up / log in (email + password; NO MFA for MVP)
2. See a list of athletes with current prices
3. Open an athlete and buy/sell with a play-money balance
4. See their portfolio (holdings, avg cost, P&L)
5. See a leaderboard

**Explicitly CUT for after Day 30:** real money, live sports-data feed (use
mock/manual stat events), multi-sport, MFA, realtime websockets, the
Personality Quest, chat, ads, native/App Store app.

**Rule:** if behind schedule, cut a feature — never ship something broken.

## 3. Tech stack (do not substitute without asking)

- Next.js 15 (App Router), TypeScript strict
- Tailwind v4 + CSS variables (design tokens in `src/app/globals.css`)
- Supabase (Postgres + Auth). Zod for all route input validation.
- Deploy: Vercel + Supabase prod.
- A scaffold already exists in `src/`, plus Supabase migrations in
  `supabase/migrations/` and an AMM pricing engine in `src/lib/pricing/`.
  Reuse the scaffold; do not rebuild from zero.

## 4. Day-by-day plan (each day = one build task + one short video)

### Week 1 — Foundation
- Day 1: env running, Supabase project live, confirm scaffold builds
- Day 2: DB schema — profiles, athletes, holdings, trades, balances
- Day 3: email signup/login working (no MFA)
- Day 4: seed ~30 athletes (one sport, static stats)
- Day 5: athlete list page renders from DB
- Day 6: play-money starting balance per user
- Day 7: Week 1 recap; fix anything broken

### Week 2 — Engine
- Day 8–9: wire existing AMM pricing fn to live DB prices
- Day 10–11: buy/sell API + play-money trade execution
- Day 12: portfolio calc (holdings, avg cost, P&L)
- Day 13: verify price impact + balance math under edge cases
- Day 14: Week 2 recap

### Week 3 — Product
- Day 15–16: athlete profile page + trade sheet UI
- Day 17: dark design pass using existing tokens
- Day 18: price movement — scheduled ticks OR manual stat-event input (mock; no live feed)
- Day 19: leaderboard
- Day 20: mobile responsive (test 375/390/768px)
- Day 21: Week 3 recap

### Week 4 — Ship
- Day 22–24: bug bash — full signup → trade → portfolio loop, no dead ends
- Day 25: empty/loading/error states, polish
- Day 26: deploy to Vercel + Supabase prod, test live
- Day 27: QA golden path end-to-end on live URL
- Day 28: connect waitlist, invite first users
- Day 29: fix from real user feedback, prep launch
- Day 30: open to waitlist; film the honest result

## 5. Definition of done (Day 30 acceptance)

- Live public URL, installable as PWA
- A new user can complete signup → buy → sell → see P&L → see leaderboard
  with zero dead ends or console errors
- All inputs Zod-validated; auth checked on every write
- No real-money anything anywhere

## 6. Guardrails (NON-NEGOTIABLE)

- **Play money only.** Never imply users earn/win money. No "$", "stock",
  "trade" (as finance), "betting", "invest" in user-facing copy or marketing.
  Describe as "a game / a scoreboard for sports takes."
- No earnings claims, no fake users/screenshots, ever (FTC + honesty).
- Real-money is a SEPARATE future phase requiring a gaming/fintech lawyer and
  per-jurisdiction licensing. Not in scope. Do not build or market it.
- App Store is a later track and blocked by 3 things: founder is a minor
  (needs a parent/guardian's Apple Developer account), it's a web app
  (Apple rejects repackaged sites — needs a real native build), and the
  concept triggers Apple Guideline 5.3 (gaming/gambling) review. Day 30
  ships on the WEB, not the App Store. Don't promise "App Store" in content.

## 7. Build-in-public content rule

The video each day = the real work filmed, not staged. "Stuck" days are good
content. Format: ~30s, "Day X of 30", hook → real progress → cliffhanger →
"follow for day X+1". No money/finance trigger words. No bio link while the
posting account is young/suppressed.

## 8. Working agreement with the AI

- The human is 16, solo, learning. The AI writes/debugs most code; the human
  makes decisions, tests, and narrates honestly on camera.
- Plan before coding each day. One feature at a time. Verify it runs before
  calling a day done. `npm run typecheck && npm test` before "done".
