import { getServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { LogoutButton } from "./logout-button";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = { title: "Topdraft" };

/**
 * Authed dashboard. Middleware enforces AAL2 before reaching this page.
 * The real Phase 1.3 dashboard (top movers, athlete grid, etc.) replaces this.
 */
export default async function AppPage() {
  const sb = await getServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await sb
    .from("profiles")
    .select("display_name, virtual_balance")
    .eq("user_id", user.id)
    .maybeSingle();

  const balance = Number(profile?.virtual_balance ?? 0);
  const name = profile?.display_name ?? user.email ?? "you";

  return (
    <div className="min-h-svh bg-bg text-text">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/app" aria-label="Topdraft">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-text-mute hidden sm:inline">{name}</span>
          <LogoutButton />
        </div>
      </header>

      <main className="px-6 py-12 sm:py-20 max-w-3xl mx-auto">
        <p className="font-mono text-[10px] uppercase tracking-widest text-text-mute mb-3">
          Portfolio value
        </p>
        <div className="font-display text-6xl sm:text-7xl tracking-tight leading-none mb-12">
          ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>

        <p className="font-mono text-sm text-text-mute leading-relaxed max-w-md">
          Welcome, {name}. Your dashboard ships in the next update. For now, head to
          {" "}
          <Link href="/demo" className="text-accent hover:text-accent-2">
            the demo
          </Link>{" "}
          or browse{" "}
          <Link href="/athlete/mahomes" className="text-accent hover:text-accent-2">
            an athlete page
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
