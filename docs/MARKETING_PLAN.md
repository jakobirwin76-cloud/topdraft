# AthleteX Marketing Plan — Reddit, X, TikTok, Instagram

**Audience:** Sports-pilled Gen Z fan, 18–26.
**Wedge communities:** r/Sleeper + Sleeper-adjacent fantasy creators · Sports TikTok / Reels (creator-led).
**Anti-wedge (do not target first):** r/sportsbook (too sharp, will demand cashout), Twitter/X sportsfin tribe (slow burn, save for credibility).

**Tone strategy — deliberate split:**

> **Loud Gen Z** at the top of funnel (TikTok, Reels) — big numbers, screaming gains, trending audio.
> **Insider / cult** in the tribe (X, Reddit replies, in-app copy) — dry, smart, slightly edgy.

The split is the playbook, not a contradiction. Hype to acquire, insider to retain. Mojo only had hype and bled trust; sportsfin Twitter has only insider and never reaches scale. Run both lanes; keep them visually distinct (color, voice, pace).

---

## North-star marketing metric

> **Cost per Day-7-active user**, not cost per install.

A waitlist signup that never opens the app on day 7 was free. We optimize creative, partnerships, and spend against D7-active.

---

## Day-1 Revenue Stack

AthleteX monetizes from launch via ads + affiliate. This is what funds the marketing flywheel before sweepstakes Phase 2.

| Layer | Inventory | Placement | Day | Realistic CPM/CPA |
|---|---|---|---|---|
| **Google AdSense banners** | Generic display | Settings, Leaderboard footer | Day 1 | $0.30–$2 CPM ([Mile.tech 2026](https://www.mile.tech/blog/adsense-cpm-rates-2024)) |
| **DFS affiliate (Underdog/Sleeper/Betr)** | Referral CPA | "Earn Virtual Currency" surface + post-trade share | Day 1 | $40–$100 per signup ([Betting USA 2026](https://www.bettingusa.com/affiliate/)) |
| **Streaming affiliate (Fubo/ESPN+/DAZN)** | Watch-CTA on athlete pages | Athlete profile bottom slot | Phase 1.5 | $10–$30 per signup |
| **Sponsored athlete spotlights** | Direct brand deals | Featured Market tile | Phase 2 | Custom — highest margin |
| **Sportsbook affiliate (DK/FD)** | NEVER | — | ❌ | Kills the DFS legal frame; state-affiliate licensing required |
| **Online casino affiliate** | NEVER | — | ❌ | Out of category |

**Ad placement rules:**
- Ads NEVER appear on the trade flow, Quest, MFA enrollment, or first-run Home.
- Every affiliate CTA carries the FTC `#ad` indicator.
- Affiliate links are **geofenced by `state_code`** — restricted-state users never see DFS partner links that aren't licensed in their state.
- "Disable personalized ads" toggle lives in Settings → Privacy.

**Why this matters for marketing strategy:**
Every user on the waitlist becomes a potential AdSense impression + a potential Underdog/Sleeper referral within 60 seconds of opening the app. Even at conservative numbers (5% click-through on a $50 DFS CPA), 10,000 waitlist conversions = $25,000 ARR floor *before* any premium subscription revenue. That budget refunds creator-marketing within 90 days.

---

## Pre-launch: the gamified waitlist

This is the single highest-leverage thing to ship before the app:

1. Landing page on `athletex.app/waitlist`.
2. User submits email → gets position number (e.g., **#847**).
3. Unique referral link → each successful referral moves them up the queue.
4. Top 1,000 get **first access** + a permanent "Founder" badge in-app.
5. Position number + share button is the entire UI. (Robinhood built >1M signups with this exact mechanic.)

**Implementation:** the `referrals` table + Quest Q5 already wire this. Pre-launch we need a public landing route at `/waitlist` and a server action that creates a `profiles` row in a `pending_state = 'waitlist'` mode (no virtual currency until promoted).

**Every social post points here.** No exceptions. No plain "follow us." Always: *"Link in bio — join the waitlist."*

---

## TikTok + Instagram Reels (top of funnel — Loud Gen Z)

### The 4 formats

| Format | Cadence | What it is | Why it works |
|---|---|---|---|
| **The Demo** | 2× / week | Open the app pre-game. Buy an athlete on camera. Cut to live game footage of the athlete. Cut back to app showing price moving. Show the gain. | Proof-of-concept in 15 seconds. The closest thing to "you can make money with sports IQ" without saying it. |
| **The Reaction** | 3× / week | Stitch / duet a viral sports moment. Overlay: *"if AthleteX was live right now, his price would be $X"*. | Rides the algorithm — every big sports moment is a free ride if you're fast. |
| **The Aura** | Daily | No talking. App + trending audio + a single overlay line ("Sunday was good to me"). | Reach posts. Built for the For You algo, not for context. |
| **The Education** | 1× / week | "Most people don't know this app exists yet." 30 seconds. Frame: skill > luck. | Brings in the "I'm not a gambler but I know sports" crowd. |

### Hooks library (rotate, never repeat in same week)

1. "You called it. Now profit from it."
2. "Stop being right for free."
3. "Your sports IQ is worth money."
4. "The market opens Sunday at 1pm."
5. "I bought stock in him before kickoff. Watch what happened."
6. "You knew he was going to go off. Imagine if you had stock in him."
7. "Sports betting is luck. This is skill."
8. "Fantasy doesn't pay until Tuesday. AthleteX pays in real time."

### Posting calendar

| Day | Post | Channel |
|---|---|---|
| Mon | Aura — weekend gains recap | TikTok + Reels |
| Tue | Education — concept explainer | TikTok |
| Wed | Reaction — mid-week sports moment | TikTok + Reels |
| Thu | Aura — hype the weekend | Reels |
| Fri | Demo — buy before the weekend | TikTok + Reels |
| Sat | Reaction — game-day moment | TikTok + Reels |
| Sun | Live trade content during games | Both, story format too |

**Sundays during NFL** are the highest-leverage 4 hours of the week. A founder filming a live trade reaction *during* a game has a 10× viral coefficient vs. the same content posted Tuesday.

### Creator partnerships (TikTok)

Target list: mid-tier (50k–500k followers) sports creators in the Sleeper-adjacent universe. **Not** big DFS creators (locked into FanDuel/DK deals).

Offer structure:

- **Tier 1 (50–100k):** $500 + 200k virtual currency + posted referral code. Goal: 4 posts in 30 days.
- **Tier 2 (100–500k):** $1,500–3,000 + featured "Trader of the Week" slot in-app + revenue share on referrals.
- **Tier 3 (500k+):** Custom — equity discussion, exclusive features, eventually athlete partnerships.

**Disclosure:** every paid post must include `#ad` and link to the FTC-compliant page. The marketing copy "do not" list (below) is non-negotiable.

---

## Reddit (mid-funnel — Insider / cult, founder-led)

### r/Sleeper specifically (the wedge)

This subreddit has 100k+ active users who already understand fractional sports games and Sleeper-style social UX. They are the highest-LTV cohort we can reach for free.

**Founder rules:**

1. **Don't post about AthleteX directly** for the first 30 days. Be a real participant. Comment on Sleeper threads. Build karma on the account.
2. After 30 days + 500 comment karma: post **one** organic story-format post: *"We're building the thing I always wanted from Sleeper — a live price that moves with the game. Sharing the waitlist."* Link in body, not title.
3. Reply to every comment for 48 hours. Insider tone — dry, candid, no marketing speak.
4. Crosspost to r/DFSports only after the r/Sleeper post is positive.

**Never:**

- Hire a "Reddit marketing service." It will get the account banned.
- Use multiple accounts to upvote your own post. Reddit's anti-vote-manipulation kills this on contact.
- Post pure promo. The mods will lock it.

### r/CFB, r/nba, r/nfl (after waitlist proven)

Once the waitlist breaks 5k:

- Game-day "during the game" posts: *"Just bought 50 shares of [athlete] at $420 right before kickoff. Updating live."*
- Format as a thread; reply with screenshots as the game progresses.
- These threads have a built-in audience because Reddit during games is a feeding frenzy.

### r/sportsbook (skip until Phase 2)

This audience demands real money cashout. Showing up there with play money draws hostility. Save for sweepstakes-coin Phase 2.

---

## X / Twitter (deep funnel — Insider / cult)

X is for **credibility and tribe**, not volume. Strategy is build-in-public + sportsfin posture.

### Founder posting cadence

- **Daily**: one observation about live sports markets — pricing, mispricings, comparisons to Polymarket/Kalshi.
- **Weekly thread**: behind-the-scenes building — "Here's how the AMM handles concurrent trades during a Mahomes touchdown." Smart, dry, link to docs/code if open-sourced.
- **Big moment posts**: when the price chart on AthleteX *would have* nailed a real-world outcome, screenshot it: *"The line moved 4 minutes before he scored. The market knew."*

### Who to engage

- **Sportsfin Twitter** (sub-50k follower accounts that talk about Kalshi sports markets, Polymarket sports lines, athlete valuation): reply, never DM. Build relationships over months, not weeks.
- **Smart sports analysts** (PFF writers, smart NBA Twitter, soccer xG nerds): follow, comment substantively. Eventually pitch them in-app analyst roles for Phase 2.
- **Founders / VCs** (sportstech VCs, fintech investors): friendly background — they'll matter at Series A but they don't drive users. Maintenance only.

### What X is NOT for

- Acquiring Gen Z fans at scale. They're on TikTok.
- Performance ads. The CPMs are wrong for our LTV.

---

## Instagram (companion to TikTok)

- **Reels** are the primary unit. Cross-post the TikTok library with platform-native edits (tighter captions, no TikTok watermark, vertical 9:16).
- **Stories** are for game-day live trades and waitlist milestones ("Just hit 1,000 — top 100 get founder badges").
- **Static feed** is dead in 2026. Don't optimize for it. Use it for branded "card" posts that match the app's aesthetic.

### One thing IG can do that TikTok can't

**Athlete partnerships (Phase 3).** Instagram is where mid-tier athletes still live. When AthleteX has 50k users, paid athlete partnerships are easier on IG than anywhere else. Plan: target sub-1M-follower athletes (under-the-radar contracts, friendly fees) before chasing Mahomes-level names.

---

## Funnel architecture

```
TikTok / Reels (Loud Gen Z)  ─────►  Waitlist landing page
                                            │
Instagram (companion)  ───────────────────►─┤
                                            │
Reddit r/Sleeper (founder-led, organic)  ──►┤
                                            ▼
                                      Position number + share link
                                            │
                                  (refer to move up; viral loop)
                                            │
                                            ▼
                                  First 1,000 → founder badge
                                            │
                                            ▼
                              Quest onboarding (under 90s)
                                            │
                                            ▼
                                  Archetype-tuned Home
                                            │
                                            ▼
                            First trade in <24h (north-star)
                                            │
                                            ▼
                              D7 active (true marketing metric)
```

X / Twitter sits to the side — not in this funnel. Its job is **credibility**, which becomes a multiplier on the funnel above (PR pickup, investor signal, athlete inbound).

---

## Budget shape (first 90 days)

| Channel | Spend | Note |
|---|---|---|
| Founder time on TikTok + IG | 2–3 hrs/day | Free; the highest-leverage line item |
| Founder time on Reddit + X | 30 min/day | Free; tribal credibility |
| Tier-1 creators | $2k–4k total | 4–8 mid-tier creators; 30-day campaign |
| Paid TikTok ads | $0 | Not until creator deals prove a CAC < D7-LTV |
| Waitlist landing tools | <$50/mo | Vercel + Resend + Supabase already in stack |
| Tools (Notion, Buffer, Repurpose.io) | $50/mo | Optional |

**Refuse to spend on paid ads** until we have a creative that converts at <$3 cost per waitlist signup organically. Throwing ad budget at a non-working hook is how Mojo burned $100M.

---

## DO NOT — the FTC-compliant guardrails

- **Never** say "you can make $X / month with this app." This is a textbook FTC violation for any product.
- **Never** say "I make $X from AthleteX." Even truthful earnings claims trigger documentation requirements.
- **Never** promise "guaranteed gains" or "winning strategy."
- **Never** call AthleteX a "stock market" in marketing without immediate "skill-based fantasy" qualifier in the same frame.
- **Never** show real-money payouts in MVP marketing — there are none.
- **Never** target users in geofenced/restricted states with paid ads.
- **Never** buy followers — kills engagement rate; algos punish it.
- **Never** use AI-generated images of real athletes (see [IP_COMPLIANCE.md](./IP_COMPLIANCE.md)).
- **Never** post during a competitor's controversy. Stay above. Tribe respects restraint.

---

## Growth phases — which channel does what

| Phase | Followers / Waitlist | Primary channel | What's working |
|---|---|---|---|
| **0–1k followers / <500 waitlist** | Find the format that resonates | TikTok demo + reaction (volume over polish) |
| **1k–10k / 500–5k** | Double down on the winning format | TikTok 5×/week + Reddit founder posts |
| **10k–50k / 5k–25k** | Creator partnerships unlock | Tier-1 creators + Reddit r/CFB/r/nfl game-day threads |
| **50k+ / 25k+** | Make the launch an event | Countdown content + waitlist milestones + X picks up the moment |

---

## Weekly review — keep us honest

Every Monday, founder writes a 5-bullet recap:

1. Which post did best (reach + signups)?
2. Which post died and why?
3. New waitlist signups this week (vs last)?
4. Cost per waitlist signup (paid + creator)?
5. Day-7-active rate (once app is live)?

Anything trending wrong for 2 weeks gets cut. No sentimental attachment to formats that don't perform.

---

*Document version: v0.1 — revisit after first 5k waitlist signups.*
