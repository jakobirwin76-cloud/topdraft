# Topdraft — Active Checklist

> Pulled up automatically when the user says **"checklist"** in any session.
> Read this file first, update it last.

---

## ✅ Done

### Core product
- [x] Landing page deployed to topdrafts.app
- [x] Netlify connected to GitHub `main` — auto-deploy on every push
- [x] Database migrations applied · Supabase + Upstash configured
- [x] env.ts hardened (Stripe/SportsRadar/Resend optional)
- [x] Design system v1 — 8 components in `src/components/ui/`
- [x] Front-running protection spec saved to CLAUDE.md §7

### Pages
- [x] Landing `/` — hero, gradient hero text, "Try the demo →" + "Featured: Mahomes"
- [x] Dashboard `/app` — purple-saturated bg, marquee, Top Movers · 24h strip, 75-athlete grid w/ sport filters
- [x] Athlete `/athlete/[slug]` — marquee, athlete picker, terminal meta strip, hero, **24h Volume/High/Low stat strip**, smooth area chart w/ crosshair, trade panel w/ pressure bar, position card w/ realized + unrealized P&L, live activity feed w/ pause/play

### Pricing engine
- [x] 16-pool position-specific multiplier matrix (4 soccer + 5 NBA + 7 NFL)
- [x] ±2% hard cap enforced at compute time
- [x] **Pools rebalanced** — all positions within ±0.10% expected drift per event (no upward bias)
- [x] Time-based X-axis · Y auto-scale · index-correct event timing

### Roster — 75 athletes
- [x] **NFL (25):** Mahomes · Allen · Burrow · Lamar · Stroud · Hurts · Daniels · Caleb Williams · Jefferson · Tyreek · CeeDee · Harrison Jr · Bowers · McCaffrey · Saquon · Bijan · Sewell · Trent Williams · Garrett · Parsons · TJ Watt · Hutchinson · Gardner · Surtain · Hamilton
- [x] **Soccer (25):** Mbappé · Yamal · Vinicius · Wirtz · Musiala · Pedri · Gavi · Cubarsí · Saka · Foden · Palmer · Bellingham · Nico Williams · Doué · Dembélé · Pulisic · Tchouaméni · Rüdiger · Kimmich · Bruno Fernandes · Maignan · Haaland · Messi · Alisson · Van Dijk
- [x] **NBA (25):** SGA · Wemby · Tatum · Luka · KD · AD · Booker · Brunson · Trae · Haliburton · Mitchell · Jaylen Brown · Ja · Dame · KAT · Banchero · JJJ · Markkanen · Zion · Herro · LaMelo · Cade · Edwards · Giannis · Jokić

### Killed (deliberate)
- [x] Waitlist UI removed — broken signups gone, demo is the only CTA
- [x] Sticky waitlist conversion bar removed (no destination)
- [x] Curry, LeBron, Embiid, De Bruyne, Endrick, Maguire dropped

---

## 🔥 Next Up — Top Priorities

### 1. Record a 10-second screen video
- Open `/athlete/jefferson` or `/athlete/wemby`, wait for a stat event, click Buy
- Show: live price tick + 24h range moving + P&L jumping
- Post to TikTok, X, Reddit r/sportsbook
- Caption: "the only sports app that pays you for being right"

### 2. Twitter/X launch thread
- 5 tweets announcing topdrafts.app
- Embed the screen recording from #1
- Tag @Polymarket, @PrizePicks, @Sleeper

### 3. "Browse other athletes" row at the bottom of each athlete page
- 4 cards linking to other athletes in the same sport
- Visitors came for Mahomes, leave having tried Burrow + Lamar too

---

## 🟢 Nice-to-Haves

- [ ] `/embed` shareable card view (no nav, just the trade panel) — for X/TikTok embeds
- [ ] "Live Game" indicator on athletes currently playing (fake for now)
- [ ] Mobile audit at 375px — confirm athlete page works on phones
- [ ] Add Burrow/Lamar/Hurts to the marquee ticker (currently dominated by Mbappé/Yamal/Wemby — could swap in NFL)
- [ ] Featured athlete rotation on the landing page (currently hardcoded to Mahomes)

---

## ❌ Do NOT Do Yet (premature)

- Auth pages (login/signup) — wait until traffic justifies
- Real Supabase queries for athletes — static data works fine for demo
- Trade safety implementation (broadcast delay + halt) — only needed for real money
- Phase 2 features (sweepstakes, premium subscription, MFA)
- More than 75 athletes — wait for SportsRadar API integration

---

## 🧭 Distribution > Features

The product is polished. What's missing is **eyes on it**. Top 3 tomorrow = record video → post to social → respond to comments. Don't iterate on the demo further — ship it.

---

*Last updated: 2026-05-26 — after rebalancing NFL pools to eliminate upward drift bias.*
