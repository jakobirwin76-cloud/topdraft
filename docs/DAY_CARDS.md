# Topdraft — 30 Day Cards

> The agent reads the card matching today's number (from `docs/PROGRESS.md`).
> Each card: **Objective** (the one thing) · **Done when** (acceptance) ·
> **Video angle** (what to film) · **Cut if behind** (the fallback).
> Vocabulary rule: roster positions / play credits / total value / my roster.
> Never: stocks, shares, trade, portfolio, $, invest, bet.

---

## Week 1 — Foundation

### Day 1
- Objective: env running, Supabase project live, confirm scaffold builds & deploys a placeholder.
- Done when: `npm run dev` runs clean; Supabase project created; env wired via existing env util.
- Video angle: "Day 1 — is it possible for a 16-year-old to build a full app in 30 days?"
- Cut if behind: skip deploy, just local build green.

### Day 2
- Objective: DB schema — profiles, athletes, holdings, positions, play-credit balances.
- Done when: migration applies cleanly; tables exist with RLS enabled, default-deny.
- Video angle: "the part everyone said I'd get stuck on."
- Cut if behind: holdings/positions tables only; balances Day 6.

### Day 3
- Objective: email signup/login (no MFA).
- Done when: a new user can register, log in, session persists; auth-gated route works.
- Video angle: "you can actually log in now."
- Cut if behind: login only, defer password reset.

### Day 4
- Objective: seed ~30 athletes (one sport, static stats).
- Done when: athletes table populated; query returns them.
- Video angle: "picking the first 30 players."
- Cut if behind: 15 athletes.

### Day 5
- Objective: athlete list page renders from DB.
- Done when: `/` (authed) lists athletes with name + current value, no console errors.
- Video angle: "first time it looks like a real app."
- Cut if behind: unstyled list is fine.

### Day 6
- Objective: every user gets a starting play-credit balance.
- Done when: new signups get N play credits; balance visible in header.
- Video angle: "everyone starts with the same stack."
- Cut if behind: hardcode the starting number.

### Day 7
- Objective: Week 1 recap; fix anything broken; repo green.
- Done when: typecheck + tests pass; signup→see athletes works end-to-end.
- Video angle: "week 1 done — honest status."
- Cut if behind: nothing — this is the catch-up day.

## Week 2 — Engine

### Day 8
- Objective: wire existing AMM pricing fn to live DB values (read path).
- Done when: each athlete's value derives from AMM + state, server-side only.
- Video angle: "the math that makes values move."
- Cut if behind: linear pricing stub behind same interface.

### Day 9
- Objective: AMM price-impact preview API (athlete_id + quantity → new value).
- Done when: server endpoint returns impact; client never computes price.
- Video angle: "why your buy moves the number."
- Cut if behind: no preview, compute at execute time only.

### Day 10
- Objective: buy positions (server executes, debits play credits atomically).
- Done when: authed buy works; balance + holdings update in one transaction.
- Video angle: "first position ever bought on it."
- Cut if behind: fixed quantity of 1.

### Day 11
- Objective: sell positions (credits back, holdings down, atomic).
- Done when: sell path works; no negative balances/holdings (DB CHECK enforced).
- Video angle: "buying and selling actually works."
- Cut if behind: sell-all only, no partial.

### Day 12
- Objective: "My Roster" — holdings, avg cost, total value, gain/loss.
- Done when: roster page shows correct math from DB.
- Video angle: "you can see if you're up or down."
- Cut if behind: total value only, defer gain/loss.

### Day 13
- Objective: stress the money math — rapid submits, edge quantities.
- Done when: no double-spend, no race conditions; values reconcile.
- Video angle: "trying to break my own app."
- Cut if behind: document known edge, fix the worst one.

### Day 14
- Objective: Week 2 recap; repo green.
- Done when: full signup→buy→sell→roster loop works end-to-end.
- Video angle: "halfway-ish — what works, what's broken."
- Cut if behind: catch-up day.

## Week 3 — Product

### Day 15
- Objective: athlete detail page + buy/sell sheet UI.
- Done when: tap athlete → detail → buy/sell from the sheet.
- Video angle: "it finally feels like an app."
- Cut if behind: detail page without the slide-in sheet.

### Day 16
- Objective: finish the buy/sell UX (quantity, live impact preview, confirm).
- Done when: full flow usable on desktop with no dead ends.
- Video angle: "the main thing you actually do in the app."
- Cut if behind: drop live preview, show final on confirm.

### Day 17
- Objective: dark design pass using existing tokens in globals.css.
- Done when: consistent dark theme, no default/AI-looking UI, 8px spacing.
- Video angle: "making it not look AI-built."
- Cut if behind: theme the core 3 screens only.

### Day 18
- Objective: value movement — scheduled tick OR manual stat-event input (mock; NO live feed).
- Done when: an input/cron changes an athlete's value and roster reflects it.
- Video angle: "watching a value move for real."
- Cut if behind: manual admin button to bump a value.

### Day 19
- Objective: leaderboard (rank by total value).
- Done when: leaderboard renders, user's row findable.
- Video angle: "who's winning so far."
- Cut if behind: top 20 only, no user-row highlight.

### Day 20
- Objective: mobile responsive (375 / 390 / 768).
- Done when: core flows usable on mobile, touch targets ≥44px.
- Video angle: "fixing it on my phone."
- Cut if behind: fix the buy/sell + roster screens only.

### Day 21
- Objective: Week 3 recap; repo green.
- Done when: typecheck + tests pass; product demoable on phone.
- Video angle: "1 week left — the honest state."
- Cut if behind: catch-up day.

## Week 4 — Ship

### Day 22
- Objective: bug bash part 1 — signup → buy path, every dead end.
- Done when: zero console errors on the happy path; auth solid.
- Video angle: "everything that's broken."
- Cut if behind: log non-blocking bugs, fix blockers only.

### Day 23
- Objective: bug bash part 2 — sell → roster → leaderboard.
- Done when: full loop clean; money math reconciles after many actions.
- Video angle: "the unglamorous part of building."
- Cut if behind: same — blockers first.

### Day 24
- Objective: bug bash part 3 — RLS/security audit (no cross-user writes).
- Done when: a user cannot read/modify another user's roster or credits.
- Video angle: "making sure nobody can cheat."
- Cut if behind: verify the trade + balance routes at minimum.

### Day 25
- Objective: empty / loading / error states + basic polish.
- Done when: every async screen has loading + error + empty handling.
- Video angle: "the boring stuff that makes it real."
- Cut if behind: core screens only.

### Day 26
- Objective: deploy to Vercel + Supabase prod; PWA installable.
- Done when: live URL works; installable to home screen.
- Video angle: "it's on the internet now."
- Cut if behind: deploy without PWA manifest, add Day 27.

### Day 27
- Objective: QA the golden path end-to-end on the LIVE url.
- Done when: signup→buy→sell→roster→leaderboard works in prod, no errors.
- Video angle: "trying to break the live version."
- Cut if behind: fix only prod-blocking issues.

### Day 28
- Objective: connect waitlist; invite first real users in.
- Done when: a waitlisted email can get into the live app.
- Video angle: "letting the first people in."
- Cut if behind: manual invite of a handful.

### Day 29
- Objective: fix from real-user feedback; final pass.
- Done when: top reported issues fixed; repo green; prod stable.
- Video angle: "1 day left."
- Cut if behind: triage — only launch-blocking fixes.

### Day 30
- Objective: ship — open to the waitlist; capture the result honestly.
- Done when: app is publicly usable; PROGRESS.md final entry written.
- Video angle: "Day 30 — did a 16-year-old actually do it?"
- Cut if behind: ship what works, name cut features honestly on camera.
