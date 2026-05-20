# AthleteX IP Compliance Checklist

**Effective Date:** 2026-05-10
**Owner:** Founding team
**Status:** Pre-launch — every item must be verified before public marketing.

> **Notice:** This checklist references USPTO standards and well-known sports-IP precedent. It is not a substitute for a clearance opinion from a registered trademark attorney. Schedule a clearance opinion before any paid marketing or App Store submission.

---

## 1. Brand & Trademark Clearance

### 1.1 The "AthleteX" Mark — Required Searches

Run all of the following before relying on the name:

| Search | Tool | What we're checking | Status |
|---|---|---|---|
| **USPTO TESS — exact match** | https://tmsearch.uspto.gov/ | Live registrations or pending applications for "AthleteX" in IC 041 (entertainment), IC 042 (software), IC 036 (financial services) | ☐ Not yet run |
| **USPTO TESS — phonetic / similar** | TESS Word and/or Design Mark Search | "Athlete X," "Athletex," "AthletXX," "AthletePlex," any single-letter variation | ☐ Not yet run |
| **Common-law search** | Google, Crunchbase, App Store, Play Store, Reddit, Product Hunt | Companies using the name without registration | ☐ Not yet run |
| **Domain & social** | whois, namechk | athletex.com, .app, .io, .gg; @athletex on X/IG/TT | ☐ Not yet run |
| **EU EUIPO + UK IPO (Phase 2)** | euipo.europa.eu, gov.uk/ipo | EU/UK rights before any EU traffic | ☐ Phase 2 |

> Note: "Athletex" and "AthleteX" variants exist in adjacent industries (apparel, supplements). Confirm there is no live mark in IC 041 / IC 042 with overlapping channels of trade. If a conflict surfaces, candidate alternative names should be queued: see Section 1.3.

### 1.2 Filing Plan

Once cleared:

- [ ] File USPTO 1(b) intent-to-use application in **IC 041** (entertainment services — fantasy sports games) and **IC 042** (SaaS — software providing fantasy sports gameplay).
- [ ] Add **IC 036** only if Phase 2 sweepstakes is launched (financial-adjacent prize redemption).
- [ ] Reserve `®` use until federal registration issues; use `™` in the interim.

### 1.3 Backup Names (clearance candidates if AthleteX is blocked)

- _Reserved for founder._

---

## 2. League and Team Marks — Hard "Do Not Use" List

The DFS-skill-game frame relies on (a) public statistical data and (b) athlete names being usable as facts. League and team trademarks are **not** safe to use without license.

| Asset | Status | Notes |
|---|---|---|
| Athlete real names | ✅ Usable | Public-figure / news-information doctrine, supported by *C.B.C. v. MLBAM* (8th Cir. 2007). Use plain text, not stylized. |
| Public stat lines | ✅ Usable | Facts are not copyrightable; SportsRadar commercial license additionally provides clean rights. |
| **Team names ("Lakers," "Cowboys")** | ⚠️ Use only as factual reference (e.g., "Plays for: LAL"). Do not use as branding, never in marketing creative without legal sign-off. |
| **Team logos / colors / uniform imagery** | ❌ Never | Trademark infringement risk. Use generic athlete avatars or licensed photos. |
| **League marks (NFL, NBA, MLB, NHL, MLS)** | ❌ Never | Cannot be used in any branding. Never say "the official AthleteX market for the NFL." |
| **Player association marks (NFLPA, NBPA, MLBPA)** | ❌ Without license | Group licensing of names+likenesses for game-style use typically requires a PA license; budget for this in Phase 2/3. |
| **Photographs of athletes** | ❌ Without license | Use generic vector silhouettes, initials, or licensed-stock imagery only. |
| **Jersey numbers + team color combos** | ⚠️ Risky | Together with name = "indicia of identity." Avoid combining. |

### 2.1 Pre-launch UI Audit Required

- [ ] Scan every athlete card, profile screen, and marketing asset for accidental team-logo usage.
- [ ] Confirm avatars are generic vector or initials, not licensed stock that lapsed.
- [ ] Audit color palette for inadvertent team-color combinations on athlete pages.

---

## 3. Right of Publicity (Athlete Likenesses)

The skill-game frame relies on athlete identification being "informational." The boundary is:

- **Safe:** name + public statistics + neutral avatar + factual team affiliation.
- **Risky:** stylized likeness, photo, video, voice, signature, or any element that "evokes the identity" of a specific athlete in a commercial-endorsement style.
- **Not safe without license:** any implication that an athlete endorses or is associated with AthleteX.

### 3.1 Marketing Guardrails

- Marketing copy must never use first-person athlete quotes (real or fabricated).
- AI-generated images of athletes are **prohibited**.
- Side-by-side comparisons with another product must use the AthleteX UI only — not athlete images.

### 3.2 Athlete Outreach (Phase 3+)

If and when AthleteX pursues athlete partnerships, all deals must be papered with a written agreement covering:

- Name/likeness usage scope (still images, video, social, in-app).
- Term and territory.
- Compensation (cash, equity, virtual-currency promo allocation).
- Termination and morality clause.

---

## 4. Patents — Mojo and Other Prior Art

Mojo (the prior "athlete stock market" venture) filed multiple patents in 2021–2023 covering aspects of athlete-as-asset trading. Before launch:

- [ ] Patent search at https://ppubs.uspto.gov/ for assignee "Mojo" and keywords "athlete share," "athlete derivative," "live sports stock," "in-game pricing engine."
- [ ] Patent search for assignee "Sorare," "DraftKings Marketplace," "Underdog," "Kalshi" sports-related claims.
- [ ] **Engage a patent attorney** for a freedom-to-operate (FTO) opinion before any external fundraising round; not a launch blocker but is a Series A diligence item.
- [ ] Document the AthleteX pricing-engine design rationale in a dated internal memo (defensive evidence of independent development).

### 4.1 If a Threatening Patent Is Found

- Catalog the claims; ask counsel whether AthleteX's implementation reads on them.
- Consider designing around (e.g., AMM-only pricing avoids order-book claims; no synthetic instruments avoids derivative-style claims).
- Do not contact the patent holder without counsel.

---

## 5. Open-Source License Inventory

All third-party code must be tracked with its license. Maintain `LICENSES.md` in the repo. Acceptable licenses for AthleteX (which intends to remain proprietary):

- ✅ MIT, Apache 2.0, BSD-2/3, ISC.
- ⚠️ MPL 2.0, LGPL — usable but file-level copyleft must be respected.
- ❌ GPL v2/v3, AGPL — incompatible with proprietary distribution; do not use.

### 5.1 Required Steps

- [ ] Generate `LICENSES.md` from `pnpm` (e.g., `pnpm licenses list`) and review for copyleft.
- [ ] Add a CI job that fails if a new GPL/AGPL dependency lands.
- [ ] Include attributions in the app's About screen for licenses requiring it.

---

## 6. Trade Secrets

The AthleteX **pricing algorithm** is the company's most defensible asset. Treat as a trade secret:

- [ ] Store algorithm code in a private repository with branch protections.
- [ ] Limit access to engineers with a signed NDA + IP assignment.
- [ ] Do not publish exact weights, multipliers, or formula derivations in marketing material. Marketing may describe the algorithm at a high level only.
- [ ] On founder/employee separation, run a standard trade-secret exit interview.

---

## 6.5 Athlete Portraits in the Animated Trade Card

The landing hero's animated trade card (`src/components/landing/animated-trade-mock.tsx`) uses a **stylized portrait frame** instead of real athlete photos. The frame is a 3:4 ratio violet-tinted card with the athlete's initials rendered in the display face — IP-safe stand-in for a draft photo.

The `<PortraitFrame />` component already accepts an optional `photoUrl` prop. If/when AthleteX licenses NIL photos (per-athlete deal — typically through a union group-licensing program or direct rep deal), drop the licensed PNG URL into the entry and the frame swaps automatically.

- [ ] **Do NOT** drop in NFL/NBA/MLB draft photos, Getty press images, or any photo scraped from a league or media site — those are copyrighted AND show recognizable players (dual exposure)
- [ ] Acceptable swaps: in-house vector silhouettes (`/public/athletes/<external_id>.svg`), commissioned illustrations, or NIL-licensed photos with written rights cleared
- [ ] Audit any photo before it ships to production — initials fallback is always safe

## 7. Data Provider Compliance

- [ ] **SportsRadar dev tier**: confirm dev-tier ToS permits internal prototyping but not public traffic; upgrade to commercial before any user faces pricing derived from the feed.
- [ ] No scraping of ESPN, Yahoo Sports, or any source whose ToS prohibits automated access.
- [ ] License logs and audit trail for which data provider supplied each price point at each timestamp (for ToS rollback evidence).

---

## 8. Final Pre-Launch Checklist (Sign-Off)

The following must all be ✅ before any paid marketing or App Store submission:

- [ ] USPTO clearance opinion on "AthleteX" obtained (or alternative name selected).
- [ ] No team logos, league marks, or licensed photos in any shipped UI or marketing creative.
- [ ] FTO patent search completed against Mojo and adjacent assignees.
- [ ] Open-source license inventory generated and reviewed for copyleft conflicts.
- [ ] Stat data provider commercial agreement in place (or upgrade scheduled).
- [ ] Privacy Policy + Terms of Use reviewed by counsel.
- [ ] Founder + early employees on signed IP assignment + NDA.

---

*Document version: v0.1 — pre-launch checklist. Treat each unchecked box as a release blocker.*
