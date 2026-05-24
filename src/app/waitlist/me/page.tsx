import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { ArrowRight, Share2 } from "lucide-react";
import { env } from "@/lib/env";
import { getServiceSupabase } from "@/lib/supabase/server";
import { verifyWaitlistToken } from "@/lib/waitlist";
import { CopyButton } from "@/components/copy-button";
import { Logo } from "@/components/logo";

export const dynamic = "force-dynamic";

export default async function WaitlistMe() {
  const cookieJar = await cookies();
  const token = cookieJar.get("ax_wl")?.value;
  if (!token) redirect("/waitlist");

  const payload = verifyWaitlistToken(token, env.get().APP_WAITLIST_SECRET ?? "");
  if (!payload) redirect("/waitlist?error=session_expired");

  const sb = getServiceSupabase();
  const { data: row } = await sb
    .from("waitlist")
    .select("id, email, position, referral_code, referrals_count, email_verified")
    .eq("id", payload.wid)
    .single();
  if (!row || row.email !== payload.email) redirect("/waitlist?error=stale");

  // How many people joined after me (rough crowd-size hook for the share copy).
  const { count: behindMe } = await sb
    .from("waitlist")
    .select("id", { count: "exact", head: true })
    .gt("position", row.position);

  const referralUrl = `${env.get().NEXT_PUBLIC_APP_URL}/w/${row.referral_code}`;
  const position = Number(row.position);

  return (
    <main className="min-h-screen bg-bg text-text">
      <nav className="flex items-center justify-between px-6 py-6 md:px-16">
        <Link href="/" aria-label="Topdraft home">
          <Logo size="md" />
        </Link>
        <div className="font-mono text-xs uppercase tracking-widest text-text-mute">Waitlist</div>
      </nav>

      <section className="px-6 md:px-16 pt-16 pb-24 max-w-3xl mx-auto">
        {!row.email_verified && (
          <div className="border border-loss/40 bg-loss/10 px-5 py-4 mb-12 font-mono text-xs text-text">
            Confirm your email — check your inbox for the link from Topdraft.
          </div>
        )}

        <div className="font-mono text-xs uppercase tracking-[0.25em] text-text-mute mb-3">
          Your position
        </div>
        <div className="font-display text-8xl md:text-9xl text-accent tracking-tight leading-none mb-2">
          #{position.toLocaleString()}
        </div>
        <div className="font-mono text-sm text-text-mute mb-16">
          {behindMe ? `${behindMe.toLocaleString()} joined after you` : "You're near the front"}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-16">
          <StatTile label="Confirmed referrals" value={String(row.referrals_count)} />
          <StatTile
            label="Founder badge"
            value={position <= 1000 ? "Locked in" : "Refer to qualify"}
            highlight={position <= 1000}
          />
        </div>

        <div className="font-mono text-xs uppercase tracking-[0.25em] text-text-mute mb-4">
          Share to move up
        </div>
        <div className="border border-border bg-surface p-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <code className="font-mono text-xs text-text break-all flex-1">{referralUrl}</code>
          <CopyButton value={referralUrl} />
        </div>

        <div className="mt-6 flex gap-3">
          <a
            href={`https://x.com/intent/post?text=${encodeURIComponent(
              `I'm #${position} on the Topdraft waitlist. Skill-based fantasy sports trading. Join with my link:`,
            )}&url=${encodeURIComponent(referralUrl)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-border text-text font-mono text-xs uppercase tracking-widest px-5 py-3 hover:bg-surface transition-colors duration-150"
          >
            <Share2 className="w-3 h-3" strokeWidth={2.5} />
            Share on X
          </a>
          <a
            href={`sms:&body=${encodeURIComponent(
              `I'm #${position} on the Topdraft waitlist — join with my link: ${referralUrl}`,
            )}`}
            className="inline-flex items-center gap-2 border border-border text-text font-mono text-xs uppercase tracking-widest px-5 py-3 hover:bg-surface transition-colors duration-150"
          >
            <Share2 className="w-3 h-3" strokeWidth={2.5} />
            iMessage
          </a>
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

function StatTile({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="border border-border bg-surface p-6">
      <div className="font-mono text-xs text-text-dim uppercase tracking-widest mb-3">{label}</div>
      <div
        className={`font-display text-4xl tracking-tight ${highlight ? "text-accent" : "text-text"}`}
      >
        {value}
      </div>
    </div>
  );
}
