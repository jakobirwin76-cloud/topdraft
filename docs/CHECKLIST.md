# Topdraft — Active Checklist

> Pulled up automatically when the user says **"checklist"** in any session.
> Read this file first, update it last.

---

## ✅ Done

- [x] Landing page deployed to topdrafts.app (Netlify Drop)
- [x] Database migrations applied (Supabase tables exist)
- [x] Supabase service role key + Upstash Redis configured
- [x] Design system v1 — 8 reusable components in `src/components/ui/`
- [x] env.ts hardened (Stripe/SportsRadar/Resend optional — server runs without)
- [x] Athlete trading template live at `/athlete/[slug]` — Mahomes, Allen, Haaland, Messi, LeBron, Curry
- [x] Sport + position-specific stat-event multipliers (NFL QB, NBA, Soccer ST/RW)
- [x] Asymmetric league modifier (negatives at full force regardless of league)
- [x] Session P&L tracker (realized + unrealized) per athlete
- [x] Interactive price chart — crosshair + tooltip + timeframe pills + Catmull-Rom smoothing
- [x] Front-running protection spec saved to CLAUDE.md §7
- [x] Netlify connected to GitHub `main` — auto-deploy on every push
- [x] Landing page font unified — Inter system-wide, tightened tracking

---

## 🔥 Next Up — Top 3 (do these or nothing else matters)

### 1. Rewire the landing CTA to point at the athlete page
- File: `src/app/page.tsx`
- Change the primary CTA button from "Join the waitlist" → "Try it →" linking to `/athlete/mahomes`
- Keep a secondary smaller "Skip — just join the waitlist" link below for people who don't want to play
- Move the waitlist signup form deeper into the athlete page (sticky bottom OR after first trade)

### 2. Add a sticky waitlist bar inside athlete pages
- Sticky bottom on mobile, slide-in top-right on desktop
- Triggers after 30s on page OR after user makes their first trade
- Copy: "Like this? Top 1,000 lock in a Founder badge — [email] [Join]"
- This is where the real signup conversion happens

### 3. Record a 10-second screen video
- Open `/athlete/mahomes`, click Buy, wait for a stat event, show price spike + P&L jump
- Post to TikTok, X, Reddit r/sportsbook
- Caption: "the only sports app that pays you for being right"
- Free distribution, zero cost

---

## 🟡 Second Priority

### 4. "Browse other athletes" row at the bottom of each athlete page
- 6 small cards linking to the other athletes
- Visitors came for Mahomes, leave having tried 3 others

### 5. Add 4 more athletes to `src/lib/athletes/data.ts`
- Mbappé (Soccer · ST · Real Madrid · La Liga, modifier 1.0)
- Burrow (NFL · QB · CIN)
- Tatum (NBA · SF · BOS)
- Donovan Mitchell or Jokić
- 5-line addition per athlete — no other code changes needed

### 6. Twitter/X launch thread
- 5 tweets announcing topdrafts.app
- Embed the screen recording from #3
- Tag @Polymarket, @PrizePicks, @Sleeper for visibility

---

## 🟢 Nice-to-Haves

- [ ] Soccer striker pool variant tuned for Mbappé
- [ ] "Live Game" indicator on athletes currently playing (faked for now, real later)
- [ ] Build `/app` home page — list all athletes with sport filter
- [ ] Mobile audit at 375px — confirm athlete page works on phones
- [ ] Add `/athlete/[slug]/embed` shareable card view (no nav, just the trade panel)

---

## ❌ Do NOT Do Yet (premature)

- Auth pages (login/signup) — wait until traffic justifies
- Real Supabase queries for athletes — static data works fine
- Trade safety implementation — only needed for real money flow
- More design iteration — it's polished enough
- Phase 2 features (sweepstakes, premium subscription, MFA)

---

## 🧭 Distribution > Features

You have a polished interactive product on the open web. What you need now is **eyes on it**, not more features. Top 3 today = wire CTA → record video → ship to social.

---

*Last updated: 2026-05-23 — after Netlify auto-deploy setup.*
