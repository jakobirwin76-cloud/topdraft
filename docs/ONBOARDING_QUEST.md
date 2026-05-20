# AthleteX Onboarding Quest

**Goal:** Convert a cold install → first trade in **under 90 seconds**, while harvesting enough signal to *personalize the app* for the user's sports identity from screen one.

**Why a Quest, not a form:** filling out preferences feels like work; answering 5 quick "what kind of fan are you" questions feels like a Buzzfeed quiz. The same data; 3× the completion rate.

---

## North-star metric for this flow

> **% of new accounts that place a trade within 24 hours of signup.**

Target: **55%**. (Sleeper hits ~50% on first contest entry; we have a tighter loop because the trade itself takes one tap.)

Secondary: Quest completion rate (target **88%**), Day-1 retention (target **45%**), Day-7 (target **22%**).

---

## The 5 questions

Each question is **one screen**, large card, two-tap answer. Questions are deliberately personality-flavored, not preference-flavored. The answer maps to **two things**: (a) a hidden archetype (used to tune the experience) and (b) a visible "kit" the user collects (gamification carrot).

### Q1 — "How do you watch a game?"

| Answer | Vibe | Archetype signal |
|---|---|---|
| Watching every play, screaming at the TV | Locked-in | **Sharp** + Loyalist |
| Highlights only, here for the moments | Aura | **Hype** |
| Group chat is the real game | Social | **Loyalist** + **Hype** |
| Background noise while I do other stuff | Chill | **Chiller** |

### Q2 — "Pick your sport."

NFL · Soccer · *(more coming soon — locked icons for NBA, MLB, NHL)*

(Single-select for MVP; the locked teasers create pull-through to Phase 3.)

### Q3 — "Pick your guy."

A grid of 8 face-card avatars (top athletes from the chosen sport). **Tap one.** This single decision becomes the user's **starter holding** — they own 5 free shares of that athlete the moment they hit Home.

### Q4 — "What's the goal?"

| Answer | Archetype |
|---|---|
| Make the leaderboard | **Sharp** |
| Flex on my friends | **Hype** |
| Just have fun watching games | **Chiller** |
| Build the biggest portfolio | **Whale** |

### Q5 — "Want a $500 head start?" *(referral capture, not a real money offer)*

| Answer | Action |
|---|---|
| Yes — paste a code | Field appears, validates against `referrals` rate-limit, both users credited 500 virtual dollars |
| Send me my own code instead | Skip, render their referral code + share sheet |
| Maybe later | Skip silently (no friction) |

> Copy is intentionally clear that the $500 is **virtual currency**. We never imply real money. Phase 2 sweepstakes flow will replace this with a sweeps-coin disclosure.

---

## The 5 archetypes

| Archetype | Primary signal | App tuning |
|---|---|---|
| **Sharp** | "Make the leaderboard" + locked-in viewer | Default lands on **Live** tab when a game is on. Leaderboard ticker ALWAYS visible on Home. Push notifications: stat-event triggers, not just kickoff. Tone: insider, dry. |
| **Hype** | Highlights + flex | Default lands on **Market** with top-mover row pinned. Shareable P&L card auto-generated after every closed position. Tone: loud, emoji-forward, big numbers. |
| **Loyalist** | Group-chat-is-the-game + watches every play | Default lands on the **athlete chat** for the holding picked in Q3. Athlete page is the "home base." Tone: tribal, in-jokes. |
| **Chiller** | Background-noise viewer | No streak pressure, no aggressive push. Weekly digest only. Default lands on **Portfolio** (zen mode). Tone: calm, low-density. |
| **Whale** | "Biggest portfolio" + any locked-in viewer | Pinned the diversification widget on Home. Higher per-trade size suggestion. Eligible for early access to MLB/NHL/NBA waitlists. Tone: serious-trader. |

A user can sit in two archetypes (e.g., Sharp + Loyalist). The product tunes weight, not exclusion.

---

## What the app actually does with the archetype

| Surface | Sharp | Hype | Loyalist | Chiller | Whale |
|---|---|---|---|---|---|
| **Default tab on first open** | Live (or Market off-game) | Market | Athlete chat | Portfolio | Home |
| **Leaderboard prominence** | Pinned top of Home | Modal after big gain | Friends-only feed | Hidden | Pinned top of Home |
| **Push triggers** | Pre-game + stat events | Big-mover spikes only | Chat replies + game-start | Weekly digest | Pre-game + position-size alerts |
| **Copy register** | Insider / dry | Loud / hype | Tribal / chatty | Calm / minimal | Sober / "trader" |
| **First-week nudge** | "Top 5% accuracy unlocked" | "Your gain is shareable" | "Join the X chat — 240 active" | "Welcome back, no streak required" | "Diversify across 3 athletes" |

---

## Implementation sketch

A new column on `profiles`:

```sql
alter table public.profiles
  add column archetype_primary    text,
  add column archetype_secondary  text,
  add column quest_completed_at   timestamptz;
```

Quest answers are stored in a small `onboarding_responses` table for retraining the mapping later (we'll learn we got the archetype map wrong; we want the raw answers preserved):

```sql
create table public.onboarding_responses (
  user_id    uuid primary key references public.profiles(user_id) on delete cascade,
  responses  jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.onboarding_responses enable row level security;
create policy "ob: self read" on public.onboarding_responses for select using (auth.uid() = user_id);
```

Archetype is **derived server-side** from the responses (don't trust client mapping — and we want to change the mapping without app updates):

```ts
// src/lib/onboarding/archetype.ts
export function deriveArchetype(answers: QuestAnswers): { primary: Archetype; secondary?: Archetype } { ... }
```

The Home screen reads `archetype_primary` and chooses its layout. Default tab is a **server-rendered redirect** so the user lands in the right place on the first cold open.

---

## A/B variants to ship Day 1

| Variant | Hypothesis | Metric |
|---|---|---|
| **Quest length: 5 vs 3** | Trim Q1 + Q5 → faster but less personalization | Completion rate, D7 retention |
| **Q3 default holding: 5 shares vs 1 share** | More starter shares = stronger emotional anchor | First-trade rate |
| **Q5 framing: "$500 head start" vs "Skip"** | Loss-aversion vs friction | Referral attach rate |
| **Archetype reveal screen Yes/No** | Showing "You're a SHARP" feels Buzzfeed-good vs slows the loop | Completion + D1 |

Run two at a time, max. Use PostHog feature flags + experiment. No "winner declarations" before 1k completions per arm.

---

## Edge cases the Quest must handle

- **User backs out mid-Quest:** state preserved per-screen (sessionStorage + server save on each answer). Re-entry resumes at last unanswered.
- **Restricted state:** if `stateCode` resolves to a restricted jurisdiction, the Quest pre-empts to a "AthleteX isn't live in your state yet — join the waitlist" screen *after* signup but *before* virtual currency is issued. Avoids harvesting unusable accounts.
- **Underage attempt:** the DOB gate is at the auth layer (Section 3 of [TERMS_OF_USE.md](./TERMS_OF_USE.md)) — Quest never sees underage users.
- **Bot signups:** Turnstile gate before the Quest. A failed Turnstile drops the user back to landing.
- **Returning user with stale archetype:** Settings → "Re-take the Quest." Re-derivation flips Home tab on next open.

---

## Visuals (Robinhood-calm, not Buzzfeed-gaudy)

- Black background, **one big number** or **one big question** per screen.
- Progress dots top-right (not a creepy progress bar).
- Single accent color: AthleteX green (#39ff14) for the selected card; everything else is neutral.
- Bebas Neue for the question, IBM Plex Mono for the answers — same display language as the rest of the app.
- **No skeleton screens.** Pre-load the next question's data while the user is reading the current one.
- Haptic tap on answer select (mobile only).

---

*Document version: v0.1 — adjust the archetype mapping after the first 1k Quest completions.*
