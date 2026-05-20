# Brand Name + Logo — Locked

**Name:** **Topdraft**
**Locked on:** 2026-05-13
**Previous working names:** AthleteX (through 2026-05-12), Stockdraft (briefly 2026-05-13)

## Why "Topdraft"

Sports-coded ("top of the draft" / "top draft pick") with a strong implicit hook — the user is the one drafting. Single word, two syllables, easy to spell, easy to say. Domain space looks open.

## Wordmark + casing rules

| Context | Form |
|---|---|
| Brand name in copy | `Topdraft` (capital T, rest lowercase) |
| All-caps emphasis | `TOPDRAFT` (footer, eyebrows, email shell) |
| Trademark indicator | `Topdraft™` until USPTO registration issues → then `Topdraft®` |
| URL / domain | `topdraft.app` (lowercase) |

## Logo — geometric chevron + clean wordmark

**Inspiration:** Polymarket. Minimal geometric mark + a clean institutional wordmark.

**Components:**
1. **Mark** — sharp upward chevron (`M3 18 L12 6 L21 18`)
   - `stroke-linejoin: miter` + `stroke-linecap: square` for hard angles
   - Stroke weight 3px (scales up to 3.5px at `lg`)
   - Color: `--color-accent` (Electric Indigo `#6366F1`)
   - Reads: chart-going-up + sports peak + draft pick rising
2. **Wordmark** — `Topdraft` set in **League Spartan ExtraBold (800)**
   - `tracking-[-0.03em]` (tight, modern)
   - Sentence case (capital T)
   - Color: `--color-text` by default; switchable via prop
3. **Spacing** — `gap-2` between mark and wordmark at `md`; tightens at `sm`

**Component:** [`src/components/logo.tsx`](../src/components/logo.tsx)

```tsx
<Logo size="md" />                          // nav, default
<Logo size="sm" />                          // footer
<Logo size="lg" />                          // hero use (if needed)
<Logo size="md" wordmarkOnly />             // wordmark without mark
<Logo size="md" textClassName="text-accent" />  // color override
```

## Trademark — preliminary signal only

Web searches in 2026-05-13 returned no direct conflicts in IC 041 (entertainment) or IC 042 (software) for "Topdraft" as a sports/fantasy app brand. The closest hit (`topdrafts.com`) is a parked-for-sale domain — not an active company, no live trademark.

**Before any paid marketing:**
- [ ] Run **USPTO TESS** at https://tmsearch.uspto.gov/ — exact, phonetic, and similar (e.g., `Top Draft`, `TopDraft`, `TopdraftS`, `Drafttop`)
- [ ] EUIPO + UK IPO for international planning
- [ ] Common-law search (Google, Crunchbase, Product Hunt, App Store, Play Store, Reddit)
- [ ] Attorney clearance opinion ($500–1,500)
- [ ] File USPTO 1(b) ITU in IC 041 + IC 042

## Domain situation (to do tonight)

- [ ] `topdraft.app` (~$15–20/yr) — primary target
- [ ] `topdraft.gg` (~$50–70/yr) — gaming-coded backup
- [ ] `topdraft.io` (~$30–40/yr) — tech backup
- [ ] `topdraft.co` (~$30/yr) — backup
- [ ] `topdraft.com` — likely 5-figures; defer

## Social handles (check + grab tonight)

- [ ] `@topdraft` on X
- [ ] `@topdraft` on Instagram
- [ ] `@topdraft` on TikTok
- [ ] `r/topdraft` on Reddit (reserve the subreddit)

If any major platform handle is taken, that's a yellow flag — reconsider before going further.

## Files renamed (Topdraft, 2026-05-13)

User-facing UI + emails:

- `src/app/page.tsx` — logo (nav + footer use `<Logo />`), all body copy, FAQ, metadata
- `src/app/layout.tsx` — page metadata
- `src/app/waitlist/page.tsx` — logo + copy
- `src/app/waitlist/me/page.tsx` — logo + share text + copy
- `src/lib/emails.ts` — subject lines + brand shell (`TOPDRAFT` wordmark in email)
- `src/app/fonts/page.tsx` — meta title
- `src/app/globals.css` — header comment
- `src/lib/zod/index.ts` — banned display names + comment + MFA TOTP friendly name
- `src/app/api/webhooks/sportsradar/route.ts` — `x-topdraft-signature` header

Operating manual:

- `CLAUDE.md` — all brand references updated; rename note added
- `docs/NAME.md` — this file (the record)

New file:

- `src/components/logo.tsx` — reusable logo component

## Still references "AthleteX" — not user-visible but should update before launch

- [ ] `docs/PRIVACY_POLICY.md`
- [ ] `docs/TERMS_OF_USE.md`
- [ ] `docs/IP_COMPLIANCE.md`
- [ ] `docs/COMPLIANCE_CHECKLIST.md`
- [ ] `docs/MARKETING_PLAN.md`
- [ ] `docs/QA_CHECKLIST.md`
- [ ] `docs/ONBOARDING_QUEST.md`
- [ ] `docs/TESTING_GUIDE.md`
- [ ] `README.md`
- [ ] `package.json` (name field — still `"athletex"`)
- [ ] `.env.example` (`RESEND_FROM_EMAIL` placeholder)

The working directory `/Users/jakeirwin/Desktop/athletex/` keeps its old name — only the brand changed, not the repo path.
