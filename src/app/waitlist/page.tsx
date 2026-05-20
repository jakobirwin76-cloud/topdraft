import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata = {
  title: "Topdraft waitlist — your sports IQ is worth money",
  description:
    "Skill-based fantasy sports trading. Free to play. 18+. Join the waitlist before public launch.",
};

export default function WaitlistLanding() {
  return (
    <main className="min-h-screen bg-bg text-text">
      <nav className="flex items-center justify-between px-6 py-6 md:px-16">
        <Link href="/" aria-label="Topdraft home">
          <Logo size="md" />
        </Link>
        <Link
          href="/login"
          className="font-mono text-xs uppercase tracking-widest text-text-mute hover:text-text transition-colors duration-150"
        >
          Log in
        </Link>
      </nav>

      <section className="px-6 md:px-16 pt-16 md:pt-24 pb-24 max-w-3xl mx-auto">
        <div className="font-mono text-xs uppercase tracking-[0.25em] text-text-mute mb-6">
          Waitlist
        </div>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-[-0.02em] mb-8">
          Get on the list.
          <br />
          <span className="text-accent">Skip ahead by referring friends.</span>
        </h1>
        <p className="font-mono text-text-mute text-base leading-relaxed mb-12 max-w-xl">
          Buy fractional shares of athletes. Watch prices move on every play. Climb the
          leaderboard. Top 1,000 on the waitlist get a permanent <span className="text-text">Founder badge</span> and
          first access at launch.
        </p>
        <WaitlistForm />
        <div className="mt-16 grid sm:grid-cols-3 gap-6 font-mono text-xs">
          <Stat label="Sports at launch" value="3" sub="NFL · NBA · Soccer" />
          <Stat label="Cost to play" value="$0" sub="Free forever — no real money" />
          <Stat label="Min age" value="18+" sub="ID-verified at signup" />
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="px-6 md:px-16 py-10 max-w-3xl mx-auto flex flex-wrap gap-6 font-mono text-xs uppercase tracking-widest text-text-dim">
          <Link href="/docs/PRIVACY_POLICY.md" className="hover:text-text-mute">Privacy</Link>
          <Link href="/docs/TERMS_OF_USE.md" className="hover:text-text-mute">Terms</Link>
          <span className="ml-auto">© 2026 Topdraft™</span>
        </div>
      </footer>
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-border bg-surface p-6">
      <div className="text-text-dim uppercase tracking-widest mb-2">{label}</div>
      <div className="font-display text-4xl text-accent tracking-tight mb-1">{value}</div>
      <div className="text-text-mute">{sub}</div>
    </div>
  );
}

