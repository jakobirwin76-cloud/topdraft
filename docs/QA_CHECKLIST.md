# AthleteX QA Checklist

**Effective Date:** 2026-05-11
**Owner:** Whoever is deploying.

> The manual golden-path checklist. **10 minutes** before every deploy to production. Cheaper than automated E2E for a solo founder and catches ~80% of regressions. Pair with the Vitest unit suite (`npm test`) which catches the other 80% of the *unit-level* class of bug.

---

## When to run this

| Trigger | Run? |
|---|---|
| Pushing to `main` | ✅ Always |
| Pushing to a Vercel preview branch | ✅ Always |
| Local-only experiment, no deploy | ❌ Skip |
| Pre-NFL-Sunday (any week) | ✅ + run k6 load test |

---

## Pre-flight (30s, automated)

Before any manual run, the following must pass locally:

```bash
npm run typecheck   # tsc --noEmit, must exit 0
npm test            # Vitest, must show 0 failures
npm run lint        # Biome, must exit 0
```

If any of these fail, **stop**. Do not start the manual checklist.

---

## Golden Path (10 min, manual)

Run against the Vercel preview URL (not `localhost`). Use a fresh incognito window.

### Public surface (2 min)

- [ ] Land on `/` — hero renders, accent violet visible, fonts loaded (Bebas Neue + IBM Plex Mono — not fallback Arial)
- [ ] Click "Join the waitlist" → lands on `/waitlist`
- [ ] Waitlist form renders, email field focuses on tab, "Join" button has hover state
- [ ] Submit a fresh `+test@example.com` → confirmation email arrives within 30s
- [ ] Click verification link in email → land on `/waitlist/me`
- [ ] Position number shows + referral link is copyable
- [ ] Copy share link → open in incognito → join as `+test2@…` → original user's `referrals_count` increments

### Auth + Quest (3 min)

- [ ] Sign up via `/signup` with valid DOB (≥ 18) and supported state
- [ ] Underage DOB rejected with clear error
- [ ] Restricted state (e.g., `WA`) rejected with clear error
- [ ] Weak password rejected
- [ ] Email verification flow lands at `/quest/1`
- [ ] All 5 Quest screens swipe correctly (Framer Motion, no jank)
- [ ] Reveal screen plays full sequence; archetype badge renders
- [ ] "Enter the Market" CTA lands on `/app` Home

### Trading (3 min)

- [ ] MFA prompt appears before first trade
- [ ] TOTP enrollment QR renders and accepts a code from any authenticator
- [ ] Buy 1 share of an athlete → balance debits, holding shows in `/portfolio`
- [ ] Sell 1 share → balance credits, holding decrements
- [ ] Attempt to buy with insufficient balance → "Insufficient balance" error, **not** a 500
- [ ] Attempt to sell more shares than owned → "Not enough shares" error
- [ ] Trade confirmation animates (count-up on balance, haptic on mobile)

### Polish + cross-cutting (2 min)

- [ ] Open on iPhone Safari (or Safari iOS simulator) — PWA install prompt appears or the "Add to Home Screen" path works
- [ ] All ad placements absent on the trade flow / Quest / MFA enrollment
- [ ] Lighthouse score ≥ 90 on `/` (Performance, Accessibility, Best Practices, SEO)
- [ ] No console errors anywhere in the flow
- [ ] No content-security-policy violations (check DevTools console)
- [ ] Reduced-motion preference respected (toggle in OS settings; verify Quest skips spring animations)

---

## Browser matrix (smoke only)

For each deploy, smoke-test the public surface (waitlist join) in:

- [ ] Chrome (latest) — desktop
- [ ] Safari (latest) — desktop
- [ ] Safari iOS — iPhone real device or simulator
- [ ] Chrome Android — Pixel or emulator

If a browser fails, file an issue. Don't block the deploy for cosmetic differences (font fallback, scrollbar styling) unless they break a flow.

---

## Failure protocol

If any step fails:

1. Screenshot + copy console errors to the issue tracker
2. Roll back the deploy via `vercel rollback` (free + instant)
3. Fix locally → re-run pre-flight → re-deploy → re-run this checklist

Never patch directly on production. Vercel previews are free; use them.

---

## Pre-NFL-Sunday additional checks

The week before any major NFL Sunday:

- [ ] Run `k6` load test against the preview URL (target: p99 < 250ms at 5k concurrent users)
- [ ] Verify SportsRadar webhook is healthy (signal a test event from the dashboard, confirm price updates in Supabase)
- [ ] Verify auto-scaling is warmed (Supabase Pro+ with provisioned compute on; Vercel Pro on)
- [ ] Send a "we're live" test push to one device

---

*Document version: v0.1 — extend with new flows as they ship. Every new authenticated route adds a line to "Trading + cross-cutting" above.*
