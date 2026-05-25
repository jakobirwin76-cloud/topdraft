"use client";

import { useEffect, useState, useId } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

type State =
  | { status: "loading" }
  | { status: "ready"; challengeId: string }
  | { status: "verifying"; challengeId: string }
  | { status: "error"; message: string };

export function MfaChallengeClient() {
  const router = useRouter();
  const search = useSearchParams();
  const factorId = search.get("factorId") ?? "";
  const next = search.get("next") ?? "/app";
  const safeNext = next.startsWith("/") ? next : "/app";

  const [state, setState] = useState<State>({ status: "loading" });
  const [code, setCode] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const codeId = useId();

  useEffect(() => {
    let cancelled = false;
    if (!factorId) {
      setState({ status: "error", message: "Missing factor. Log in again." });
      return;
    }
    async function start() {
      try {
        const res = await fetch("/api/auth/mfa/challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ factorId }),
        });
        const json = (await res.json()) as
          | { challengeId: string }
          | { error: string; message?: string };
        if (cancelled) return;
        if (!res.ok || !("challengeId" in json)) {
          setState({
            status: "error",
            message: ("message" in json && json.message) || "Could not start challenge",
          });
          return;
        }
        setState({ status: "ready", challengeId: json.challengeId });
      } catch {
        if (!cancelled) setState({ status: "error", message: "Network error. Refresh the page." });
      }
    }
    start();
    return () => {
      cancelled = true;
    };
  }, [factorId]);

  async function onVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.status !== "ready") return;
    if (!/^\d{6}$/.test(code)) return;
    setVerifyError(null);
    setState({ status: "verifying", challengeId: state.challengeId });
    try {
      const res = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ factorId, challengeId: state.challengeId, code }),
      });
      if (!res.ok) {
        setVerifyError("Invalid code. Try again.");
        setState({ status: "ready", challengeId: state.challengeId });
        setCode("");
        return;
      }
      router.push(safeNext);
      router.refresh();
    } catch {
      setVerifyError("Network error.");
      setState({ status: "ready", challengeId: state.challengeId });
    }
  }

  if (state.status === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-text-mute" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="font-mono text-xs text-loss" role="alert">
        {state.message}
      </div>
    );
  }

  return (
    <form onSubmit={onVerify} className="flex flex-col gap-4">
      <label
        htmlFor={codeId}
        className="font-mono text-[10px] uppercase tracking-widest text-text-mute"
      >
        Authenticator code
      </label>
      <Input
        id={codeId}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        maxLength={6}
        pattern="\d{6}"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="000000"
        className="font-mono text-center text-lg tracking-[0.5em]"
        disabled={state.status === "verifying"}
      />
      <button
        type="submit"
        disabled={state.status === "verifying" || code.length !== 6}
        className="inline-flex items-center justify-center gap-2 bg-accent text-white font-medium text-sm rounded-lg px-6 py-3.5 hover:bg-accent-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
      >
        {state.status === "verifying" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying…
          </>
        ) : (
          "Continue"
        )}
      </button>
      {verifyError && (
        <div className="font-mono text-xs text-loss" role="alert">
          {verifyError}
        </div>
      )}
    </form>
  );
}
