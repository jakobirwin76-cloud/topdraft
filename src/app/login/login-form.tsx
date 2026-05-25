"use client";

import { useState, useId } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LoginResponse {
  ok: true;
  mfaRequired: boolean;
  factorId?: string;
}

type State =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string };

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/app";

  const [state, setState] = useState<State>({ status: "idle" });
  const emailId = useId();
  const pwId = useId();

  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000BB";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.status === "submitting") return;

    const form = new FormData(e.currentTarget);
    const email = (form.get("email") as string)?.trim();
    const password = form.get("password") as string;
    const turnstileToken = (form.get("cf-turnstile-response") as string) ?? "";

    if (!email || !password) {
      return setState({ status: "error", message: "Email and password are required" });
    }
    if (!turnstileToken) {
      return setState({ status: "error", message: "Please wait for the bot check to load" });
    }

    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, turnstileToken }),
      });

      // Read the body as text first so we can surface non-JSON 5xx responses
      // (e.g. a hard crash) instead of swallowing them as "Network error".
      const text = await res.text();
      let parsed: LoginResponse | { error?: string; message?: string } | null = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = null;
      }

      if (!res.ok || !parsed || !("ok" in parsed)) {
        const message =
          (parsed && "message" in parsed && parsed.message) ||
          (res.status >= 500
            ? `Server error (${res.status}). Try again in a minute.`
            : "Login failed");
        setState({ status: "error", message });
        return;
      }
      if (parsed.mfaRequired && parsed.factorId) {
        const qs = new URLSearchParams({ factorId: parsed.factorId, next });
        router.push(`/auth/mfa/challenge?${qs.toString()}`);
        return;
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error. Try again.";
      setState({ status: "error", message });
    }
  }

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor={emailId}
            className="font-mono text-[10px] uppercase tracking-widest text-text-mute"
          >
            Email
          </label>
          <Input
            id={emailId}
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@email.com"
            disabled={state.status === "submitting"}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor={pwId}
              className="font-mono text-[10px] uppercase tracking-widest text-text-mute"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="font-mono text-[10px] uppercase tracking-widest text-accent hover:text-accent-2"
            >
              Forgot?
            </Link>
          </div>
          <Input
            id={pwId}
            type="password"
            name="password"
            required
            autoComplete="current-password"
            disabled={state.status === "submitting"}
          />
        </div>

        <div
          className="cf-turnstile"
          data-sitekey={siteKey}
          data-size="invisible"
          data-theme="dark"
        />

        <button
          type="submit"
          disabled={state.status === "submitting"}
          className="inline-flex items-center justify-center gap-2 bg-accent text-white font-medium text-sm rounded-lg px-6 py-3.5 hover:bg-accent-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 mt-2"
        >
          {state.status === "submitting" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Logging in…
            </>
          ) : (
            <>
              Log in
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
