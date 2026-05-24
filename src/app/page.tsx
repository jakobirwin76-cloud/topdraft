import Link from "next/link";
import { Crown, Trophy, Zap } from "lucide-react";
import { WaitlistForm } from "@/components/waitlist-form";
import { Logo } from "@/components/logo";
import { AnimatedTradeMock } from "@/components/landing/animated-trade-mock";
import { FAQAccordion, type FAQItem } from "@/components/landing/faq-accordion";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { getServiceSupabase } from "@/lib/supabase/server";

export const revalidate = 60;

export const metadata = {
  title: "Topdraft — your sports IQ is worth money",
  description:
    "Skill-based fantasy sports trading. Buy fractional shares of athletes. Trade live on every play. Play money only. 18+. Join the waitlist.",
};

const LABEL = "font-medium text-xs uppercase tracking-[0.05em] text-text-mute";

export default async function LandingPage() {
  const total = await getWaitlistCount();

  return (
    <main className="min-h-screen text-text">
      {/* ─────────── NAV ─────────── */}
      <nav className="sticky top-0 z-40 bg-bg/85 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-5 md:px-12 py-4 max-w-6xl mx-auto">
          <Link href="/" aria-label="Topdraft home">
            <Logo size="md" />
          </Link>
          <Link
            href="/login"
            className={`${LABEL} hover:text-text transition-base`}
          >
            Log in
          </Link>
        </div>
      </nav>

      {/* ─────────── HERO ─────────── */}
      <section className="px-5 md:px-12 pt-10 md:pt-20 pb-20 md:pb-32 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-[1.15fr_1fr] gap-14 md:gap-20 items-center">
          <div>
            <div className={`${LABEL} mb-6`}>
              Waitlist
            </div>
            <h1
              className="font-display font-extrabold text-[48px] md:text-[96px] leading-[1.05] tracking-[-0.03em] mb-7 md:mb-10 uppercase"
              style={{
                background: "linear-gradient(135deg, #6366F1 0%, #A855F7 45%, #EC4899 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
              }}
            >
              Stop being right
              <br />
              for free.
            </h1>
            <p className="text-base md:text-lg text-text-mute leading-relaxed mb-10 md:mb-12 max-w-md">
              Buy fractional shares of athletes. Trade live on every play. Play money only — top
              1,000 get a permanent Founder badge.
            </p>
            <div className="max-w-md">
              <WaitlistForm />
            </div>
            <div className="mt-6 text-sm text-text-mute font-data tabular-nums">
              {total > 0 ? (
                <>
                  <span className="text-text">{total.toLocaleString()}</span> sports fans on the list
                </>
              ) : (
                <>Be one of the first to lock in a Founder badge</>
              )}
            </div>
          </div>
          <div className="hidden md:block card-shine">
            <AnimatedTradeMock />
          </div>
        </div>
      </section>

      {/* ─────────── TRUST BAND ─────────── */}
      <section className="border-t border-border">
        <div className="px-5 md:px-12 py-6 max-w-6xl mx-auto flex flex-wrap gap-3 justify-center">
          {TRUST_PILLS.map((t) => (
            <div
              key={t}
              className="border border-border rounded-md px-4 py-2 text-xs font-medium uppercase tracking-[0.05em] text-text-mute"
            >
              {t}
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── PROBLEM + SOLUTION ─────────── */}
      <section className="border-t border-border">
        <div className="px-5 md:px-12 py-24 md:py-32 max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-start">
              <h2 className="font-display font-extrabold text-5xl md:text-7xl leading-[0.95] tracking-[-0.035em]">
                Being right
                <br />
                about sports
                <br />
                <span className="text-accent">doesn't pay you back.</span>
              </h2>
              <p className="text-base md:text-lg text-text-mute leading-relaxed">
                Topdraft flips that. Buy a share of an athlete before kickoff. Their price moves on
                every play — touchdowns, goals, injuries, anything that hits the live feed. Sell for
                virtual currency. Climb the leaderboard. Top 1,000 on the waitlist lock in a Founder
                badge for life.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─────────── HOW IT WORKS ─────────── */}
      <section className="border-t border-border bg-surface/40">
        <div className="px-5 md:px-12 py-24 md:py-32 max-w-6xl mx-auto">
          <div className={`${LABEL} mb-12`}>How it works</div>
          <ScrollReveal stagger className="grid md:grid-cols-3 gap-5">
            {STEPS.map((s) => (
              <div
                key={s.title}
                className="border border-border bg-surface rounded-xl p-8 hover:bg-surface-2 transition-base h-full"
              >
                <s.Icon className="w-6 h-6 text-accent mb-8" strokeWidth={2} />
                <div className="font-display font-bold text-xl md:text-2xl tracking-[-0.025em] mb-3">
                  {s.title}
                </div>
                <div className="text-sm text-text-mute leading-relaxed">{s.body}</div>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* ─────────── ATHLETE COMPARE CTA ─────────── */}
      <section className="border-t border-border">
        <div className="px-5 md:px-12 py-16 md:py-20 max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="relative overflow-hidden border border-border bg-surface rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16 hover:bg-surface-2 transition-base group">
              {/* Ambient glow */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(109,40,217,0.10), transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div className="flex-1 relative">
                <div className={`${LABEL} mb-4`}>Featured · Athlete Compare</div>
                <h3 className="font-display font-extrabold text-3xl md:text-5xl leading-[0.95] tracking-[-0.035em] mb-3">
                  <span style={{ color: "#60a5fa" }}>MESSI</span>
                  <span className="text-text-dim mx-3 font-medium">vs</span>
                  <span style={{ color: "#f87171" }}>RONALDO</span>
                </h3>
                <p className="text-sm text-text-mute max-w-sm leading-relaxed">
                  Full career · 2002–2026 · See how their Topdraft share prices would have moved across every season — powered by the AMM engine.
                </p>
              </div>
              <Link
                href="/athletes/messi-vs-ronaldo"
                className="relative shrink-0 inline-flex items-center gap-2 bg-accent hover:bg-accent-2 text-white text-sm font-medium uppercase tracking-[0.06em] px-6 py-3 rounded-lg transition-base"
              >
                View Comparison
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2.5 7h9M7.5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─────────── LIVE DEMO ─────────── */}
      <section className="border-t border-b border-border">
        <div className="px-5 md:px-12 py-24 md:py-32 max-w-2xl mx-auto">
          <div className={`${LABEL} mb-10 text-center`}>Live demo</div>
          <div className="card-shine">
            <AnimatedTradeMock />
          </div>
          <p className="text-sm text-text-mute mt-10 text-center max-w-md mx-auto leading-relaxed">
            Every play moves a price. Trade in real time.
          </p>
        </div>
      </section>

      {/* ─────────── FAQ ─────────── */}
      <section>
        <div className="px-5 md:px-12 py-24 md:py-32 max-w-3xl mx-auto">
          <div className={`${LABEL} mb-10`}>FAQ</div>
          <FAQAccordion items={FAQ_ITEMS} />
        </div>
      </section>

      {/* ─────────── FINAL CTA ─────────── */}
      <section className="border-t border-border bg-surface/40">
        <div className="px-5 md:px-12 py-24 md:py-32 max-w-2xl mx-auto text-center">
          <h2 className="font-display font-extrabold text-5xl md:text-7xl leading-[0.95] tracking-[-0.035em] mb-7">
            Your sports IQ
            <br />
            <span className="text-accent">is worth money.</span>
          </h2>
          <p className="text-base md:text-lg text-text-mute mb-12 max-w-lg mx-auto leading-relaxed">
            Free to play. 18+. Top 1,000 lock in a Founder badge — first access at launch.
          </p>
          <div className="max-w-md mx-auto">
            <WaitlistForm />
          </div>
          <div className="mt-6 text-sm text-text-mute font-data tabular-nums">
            {total > 0 ? (
              <>
                <span className="text-text">{total.toLocaleString()}</span> sports fans on the list
              </>
            ) : (
              <>Be one of the first to lock in a Founder badge</>
            )}
          </div>
        </div>
      </section>

      {/* ─────────── FOOTER ─────────── */}
      <footer className="border-t border-border">
        <div className="px-5 md:px-12 py-10 max-w-6xl mx-auto flex flex-wrap gap-x-6 gap-y-3 items-center text-xs font-medium uppercase tracking-[0.05em] text-text-dim">
          <Logo size="sm" />
          <Link href="/docs/PRIVACY_POLICY.md" className="hover:text-text-mute transition-base">Privacy</Link>
          <Link href="/docs/TERMS_OF_USE.md" className="hover:text-text-mute transition-base">Terms</Link>
          <Link href="/docs/COMPLIANCE_CHECKLIST.md" className="hover:text-text-mute transition-base">Compliance</Link>
          <a href="mailto:jakobirwin76@gmail.com" className="hover:text-text-mute transition-base">Contact</a>
          <span className="ml-auto">© 2026 · Skill-based fantasy · 18+</span>
        </div>
      </footer>
    </main>
  );
}

async function getWaitlistCount(): Promise<number> {
  try {
    const sb = getServiceSupabase();
    const { count } = await sb
      .from("waitlist")
      .select("id", { count: "exact", head: true });
    return count ?? 0;
  } catch {
    return 0;
  }
}

const TRUST_PILLS = [
  "$0 to play · ever",
  "18+ · skill-based",
  "Not gambling · not securities",
];

const STEPS = [
  {
    Icon: Trophy,
    title: "Pick athletes",
    body: "Browse NFL, NBA, and Soccer. Buy a fractional share at the current price. Hold one or fifty.",
  },
  {
    Icon: Zap,
    title: "Watch prices move",
    body: "Every play moves a price. Touchdowns up. Interceptions down. Real stats, real time.",
  },
  {
    Icon: Crown,
    title: "Climb the leaderboard",
    body: "Sell for virtual currency. Track your daily, weekly, and all-time ROI against everyone else.",
  },
] as const;

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Is this gambling?",
    answer:
      "No. Topdraft is a skill-based fantasy game framed under the federal DFS exemption (UIGEA). All gameplay uses virtual currency with no cash value. 18+ only. We don't accept bets, take a vig, or hold real-money positions.",
  },
  {
    question: "Is it really free?",
    answer:
      "Yes — to play. We make money through an optional premium subscription and skill-game-adjacent partner programs (never sportsbooks or casinos). The core game is free forever.",
  },
  {
    question: "What sports?",
    answer:
      "NFL, NBA, and Soccer (Premier League, UCL, MLS) at launch. MLB and NHL follow once the core loop is proven.",
  },
  {
    question: "How do I actually get in?",
    answer:
      "Join the waitlist. Top 1,000 get a permanent Founder badge plus first access at launch. Refer friends to climb the queue — every confirmed signup bumps you up.",
  },
  {
    question: "Why now?",
    answer:
      "Mojo raised $100M and shut down without finding product-market fit. Sorare built a fantasy NFT product but missed the live-trading instinct. Topdraft is the social-first, live-trading version those products promised.",
  },
];
