"use client";

import { useEffect, useId, useState } from "react";
import Script from "next/script";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

interface JoinResponse {
  ok: true;
  position: number;
  referralCode: string;
  referralUrl: string;
}

type State =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; data: JoinResponse }
  | { status: "error"; message: string };

export function WaitlistForm() {
  const [state, setState] = useState<State>({ status: "idle" });
  const inputId = useId();
  // Invisible Turnstile — dev fallback key (`...BB`) always passes silently.
  // Set NEXT_PUBLIC_TURNSTILE_SITE_KEY in .env.local with an invisible widget
  // key for production. The widget runs in the background; no UI is shown.
  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000BB";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.status === "submitting") return;

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string)?.trim();
    const turnstileToken = (formData.get("cf-turnstile-response") as string) ?? "";

    if (!email) return setState({ status: "error", message: "Email is required" });
    if (!turnstileToken)
      return setState({ status: "error", message: "Please complete the bot check" });

    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken }),
      });
      const json = (await res.json()) as JoinResponse | { error: string; message?: string };
      if (!res.ok || !("ok" in json)) {
        setState({
          status: "error",
          message: ("message" in json && json.message) || "Something went wrong. Try again.",
        });
        return;
      }
      setState({ status: "success", data: json });
    } catch {
      setState({ status: "error", message: "Network error. Try again." });
    }
  }

  if (state.status === "success") {
    return <Success data={state.data} />;
  }

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label htmlFor={inputId} className="sr-only">
          Email
        </label>
        <input
          id={inputId}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          disabled={state.status === "submitting"}
          className="input-rect text-text text-base w-full"
        />

        {/* Invisible Turnstile — no widget shown, token auto-populates */}
        <div
          className="cf-turnstile"
          data-sitekey={siteKey}
          data-size="invisible"
          data-theme="dark"
        />

        <button
          type="submit"
          disabled={state.status === "submitting"}
          className="inline-flex items-center justify-center gap-2 bg-accent text-white font-medium text-sm rounded-lg px-8 py-4 hover:bg-accent-2 disabled:opacity-50 disabled:cursor-not-allowed transition-base"
        >
          {state.status === "submitting" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Joining…
            </>
          ) : (
            <>
              Join the waitlist
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </>
          )}
        </button>

        {state.status === "error" && (
          <div className="font-mono text-xs text-loss" role="alert">
            {state.message}
          </div>
        )}
      </form>
    </>
  );
}

function Success({ data }: { data: JoinResponse }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(data.referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* no-op */
    }
  }

  return (
    <div className="border border-border bg-surface p-8 max-w-md flex flex-col gap-6">
      <div className="flex items-center gap-3 text-accent">
        <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
        <span className="font-mono text-xs uppercase tracking-widest">You're in</span>
      </div>

      <div>
        <div className="font-mono text-xs text-text-mute uppercase tracking-widest mb-2">
          Your position
        </div>
        <div className="font-display text-7xl text-accent tracking-tight leading-none">
          #{data.position.toLocaleString()}
        </div>
      </div>

      <p className="font-mono text-sm text-text-mute leading-relaxed">
        Check your email to confirm. Then share your link — every referral moves you up.
      </p>

      <div className="border border-border bg-bg p-4 flex items-center justify-between gap-2">
        <code className="font-mono text-xs text-text break-all">{data.referralUrl}</code>
        <button
          type="button"
          onClick={copy}
          className="font-mono text-[10px] uppercase tracking-widest text-accent hover:text-accent-2 px-2 py-1 shrink-0 transition-colors duration-150"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
