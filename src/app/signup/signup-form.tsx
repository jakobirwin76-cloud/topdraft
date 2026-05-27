"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Loader2, ArrowRight, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { US_STATE_ALLOWLIST } from "@/lib/zod";

type State =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string };

export function SignupForm() {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "idle" });
  const ids = {
    email: useId(),
    pw: useId(),
    name: useId(),
    dob: useId(),
    state: useId(),
  };

  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000BB";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.status === "submitting") return;

    const form = new FormData(e.currentTarget);
    const body = {
      email: (form.get("email") as string)?.trim(),
      password: form.get("password") as string,
      displayName: (form.get("displayName") as string)?.trim(),
      dateOfBirth: form.get("dateOfBirth") as string,
      stateCode: form.get("stateCode") as string,
      turnstileToken: (form.get("cf-turnstile-response") as string) ?? "",
    };

    if (!body.turnstileToken) {
      return setState({ status: "error", message: "Please wait for the bot check to load" });
    }

    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let parsed:
        | { ok: true; email?: string }
        | { error?: string; message?: string; details?: unknown }
        | null = null;
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
            : "Signup failed");
        setState({ status: "error", message });
        return;
      }

      // Account is already email-confirmed (MVP — see signup route). Log the
      // user in immediately so they land on MFA enroll without an email step.
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: body.email,
          password: body.password,
          turnstileToken: body.turnstileToken,
        }),
      });
      if (!loginRes.ok) {
        // Signup succeeded but auto-login failed — send them to /login so they
        // can complete sign-in manually.
        router.push(`/login?email=${encodeURIComponent(body.email)}`);
        return;
      }
      router.push("/auth/mfa");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error. Try again.";
      setState({ status: "error", message });
    }
  }

  // Max DOB = today minus 18 years, for date input "max" attribute.
  const maxDob = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split("T")[0];
  })();

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field id={ids.email} label="Email">
          <Input
            id={ids.email}
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@email.com"
            disabled={state.status === "submitting"}
          />
        </Field>

        <Field id={ids.pw} label="Password" hint="12+ chars · upper · lower · number">
          <Input
            id={ids.pw}
            type="password"
            name="password"
            required
            autoComplete="new-password"
            minLength={12}
            disabled={state.status === "submitting"}
          />
        </Field>

        <Field id={ids.name} label="Display name">
          <Input
            id={ids.name}
            type="text"
            name="displayName"
            required
            minLength={2}
            maxLength={32}
            autoComplete="nickname"
            placeholder="HoopsHead"
            disabled={state.status === "submitting"}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field id={ids.dob} label="Date of birth">
            <Input
              id={ids.dob}
              type="date"
              name="dateOfBirth"
              required
              max={maxDob}
              disabled={state.status === "submitting"}
              onClick={(e) => {
                // Desktop browsers don't auto-open the native picker on click —
                // force it so the field behaves the way users expect.
                const el = e.currentTarget as HTMLInputElement & {
                  showPicker?: () => void;
                };
                el.showPicker?.();
              }}
              className="cursor-pointer"
            />
          </Field>
          <Field id={ids.state} label="State">
            <div className="relative">
              <select
                id={ids.state}
                name="stateCode"
                required
                disabled={state.status === "submitting"}
                defaultValue=""
                className="w-full appearance-none bg-bg border border-border rounded-lg pl-4 pr-10 py-3 text-text focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50 cursor-pointer"
              >
                <option value="" disabled>
                  Choose…
                </option>
                {US_STATE_ALLOWLIST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="w-4 h-4 text-text-mute absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                strokeWidth={2}
              />
            </div>
          </Field>
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
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </>
          )}
        </button>

        {state.status === "error" && (
          <div className="font-mono text-xs text-loss" role="alert">
            {state.message}
          </div>
        )}

        <p className="font-mono text-[10px] text-text-dim leading-relaxed mt-1">
          By creating an account you agree to our Terms and Privacy Policy. Topdraft is a
          skill-based fantasy game. Not a sportsbook. Not real-money gambling.
        </p>
      </form>
    </>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="font-mono text-[10px] uppercase tracking-widest text-text-mute"
        >
          {label}
        </label>
        {hint && (
          <span className="font-mono text-[10px] text-text-dim">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}
