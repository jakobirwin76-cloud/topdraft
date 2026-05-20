# Topdraft — HANDOFF

_Last updated: 2026-05-16_

## TL;DR

**Topdraft** is a pre-launch project. **The app does NOT exist yet.** The only
thing that is real and live is a **single-file waitlist landing page**. All
current effort is: collect waitlist emails + build hype. Do not publish any
marketing that implies the product works, that anyone has traded on it, or that
anyone made money — it's fabricated and will burn the launch.

---

## What Topdraft is

A future skill-based fantasy game: buy/sell virtual "shares" of pro athletes,
prices move live on game events. Play money only, not betting, not a sportsbook,
not securities. 18+. Tagline: **"Stop being right for free."**

- Working dir: `/Users/jakeirwin/Desktop/athletex/` (old name, brand is Topdraft)
- Accent color: `#6366F1` indigo (solid, never gradient — except the hero text)
- Full brand/rules: see `CLAUDE.md`

---

## Current state

### ✅ DONE — Waitlist landing page (the only real asset)
- Source of truth: **`topdraft.html`** (project root)
- Deploy copy: **`netlify-deploy/index.html`** (must be re-synced after every edit:
  `cp topdraft.html netlify-deploy/index.html`)
- Deploy folder also contains: `og.png` (1200×630 social image),
  `fonts/NinetiesHeadliner-Regular.ttf`
- Single-file vanilla HTML/CSS/JS, no framework. Sections: hero + trade-card
  mock (animated cycler), trust bar, problem, how-it-works, demo, FAQ, CTA, footer.
- Features working: email capture → SheetDB, honeypot, email regex, retry on
  429/5xx, success-state swap, returning-visitor detection, referral system,
  live counter, animated price panel.

### ✅ DONE — Referral system (in the HTML)
- Each visitor gets a code `td-XXXXXX` (localStorage), share link `?ref=CODE`.
- Inbound `?ref=` captured + persisted, sent as `referred_by` on signup.
- Success screen shows link + copy + share-on-X + progress bar.
- Reward framing: each friend = +50 spots; 3 friends = Founder badge locked.
- Counts referrals via SheetDB `/search?referred_by=CODE`.

### ⚠️ Backend — SheetDB
- API: `https://sheetdb.io/api/v1/8uhns4pwu9vkd`
- Connected Google Sheet **row 1 headers must be exactly:**
  `email | joined_at | source | ref_code | referred_by`
- **KNOWN ISSUE:** B1 was typed `joines_at` (typo) at one point — verify it is
  `joined_at` or timestamps silently drop.
- Test rows to delete before launch: any `verify@topdraft.test`,
  `reftest@topdraft.test`, `audit-final@example.com`, `refui@example.com`.
- **LAUNCH RISK (not fixed):** SheetDB free plan caps API requests/month. Every
  page visit = 1 `/count` call, every returning visitor = 1 `/search` call. One
  viral video will blow the cap and break the page. Mitigation not yet built —
  add localStorage caching of the count (fetch once/hour/visitor) OR upgrade
  SheetDB before driving real traffic.

### ⚠️ Domain / DNS
- Wanted `topdraft.app` — **taken by someone else**.
- Bought **`topdrafts.app`** (with an "s") via **Cloudflare**.
- Cloudflare DNS records (both **DNS only / grey cloud** — do NOT proxy or SSL breaks):
  - `A` `@` → `75.2.60.5` (Netlify load balancer)
  - `CNAME` `www` → `topdraft.netlify.app`
- Netlify project name: **topdraft**, default URL: **`topdraft.netlify.app`**
  (deployed via Netlify Drop). `topdrafts.app` set as primary domain in Netlify.
- **STATUS:** DNS verified by Netlify; `.app` forces HTTPS so the site shows a
  cert warning until Netlify finishes issuing the Let's Encrypt cert. As of last
  check it was still serving the placeholder `*.netlify.app` cert — i.e. the
  custom-domain cert had NOT finished. **Use `topdraft.netlify.app` for the bio
  link until `https://topdrafts.app` loads clean.**

### ❌ NOT DONE — OG meta placeholder
`netlify-deploy/index.html` (and `topdraft.html`) have **3 occurrences** of
`YOUR-SITE.netlify.app` in the `og:image` / `og:url` / `twitter:image` tags.
Replace all 3 with the real final URL or social shares render broken.

### ❌ NOT BUILT — the actual app
`src/` has a Next.js 15 scaffold (from CLAUDE.md plan) but it is **not a working
product**. No trading, no auth flow live, no real data. Months of work away.
Marketing must reflect this (pre-launch / waitlist / "building it" only).

---

## Legacy / unused files (ignore or delete later)
- `google-apps-script/` (Code.gs + SETUP.md) — old backend approach, superseded by SheetDB
- `confirmed.html` — old Apps Script confirmation page, unused with SheetDB flow
- `pfp.svg`, `pfp.html`, `topdraft-pfp.png` — profile picture assets
- `og.svg` — source for `og.png`
- `~/Desktop/topdraft-index.html` — a copy made for the user, not canonical

---

## Marketing direction (IMPORTANT — corrected)

Strategy is TikTok photo slideshows + build-in-public. The product isn't built,
so **all content must be honest pre-launch framing**:

- ✅ Concept reveal: "What if there was a stock market for athletes? I'm building it."
- ✅ Build-in-public: solo founder journey, show the landing page / counter
- ✅ Founder-badge scarcity: "first 1,000 on the waitlist get a Founder badge forever"
- ✅ "Stock Watch" tier-list series (preview of what the app *will* do)
- ❌ NEVER: "kid made $10,293", "I'm up +X%", fake trading screenshots,
  any real-money or earnings claim (it's play-money AND doesn't exist yet)

3 cartoon slide images already generated (shocked guy / smirk guy / sign-up guy)
with built-in text boxes — reusable with honest pre-launch copy.

Bio link for now: **`topdraft.netlify.app`**

---

## Prioritized TODO before driving traffic

1. **Fix Google Sheet headers** — confirm row 1 is exactly
   `email | joined_at | source | ref_code | referred_by`; delete test rows.
2. **Wait out / verify the `topdrafts.app` SSL cert** in Netlify → Domain
   management → HTTPS. Don't touch Cloudflare; grey cloud must stay.
3. **Replace `YOUR-SITE.netlify.app`** (3 spots) in `netlify-deploy/index.html`
   with the final URL, re-deploy (drag `netlify-deploy/` to Netlify).
4. **Add SheetDB request throttling** (cache count in localStorage, ~1/hr) — or
   upgrade SheetDB — before any video can go viral.
5. Re-sync rule: any edit to `topdraft.html` → copy to
   `netlify-deploy/index.html` → redeploy.
6. Post honest pre-launch content; don't claim the app works.

## How to preview/test the landing page locally
`.claude/launch.json` defines a static server (`npx serve` on :4173). The page
is at `/topdraft.html`. Submitting hits the real SheetDB.
