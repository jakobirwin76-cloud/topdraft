"use client";

import { useEffect, useState, useId } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Copy, Check, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";

interface EnrollData {
  factorId: string;
  qrCode: string; // SVG data URI
  secret: string;
  uri: string;
}

type State =
  | { status: "loading" }
  | { status: "ready"; data: EnrollData }
  | { status: "verifying"; data: EnrollData }
  | { status: "error"; message: string };

export function MfaEnrollClient() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/app";

  const [state, setState] = useState<State>({ status: "loading" });
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const codeId = useId();

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const res = await fetch("/api/auth/mfa/enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ factorType: "totp", friendlyName: "Topdraft TOTP" }),
        });
        const json = (await res.json()) as EnrollData | { error: string; message?: string };
        if (cancelled) return;
        if (!res.ok || !("factorId" in json)) {
          setState({
            status: "error",
            message: ("message" in json && json.message) || "Could not start enrollment",
          });
          return;
        }
        setState({ status: "ready", data: json });
      } catch {
        if (!cancelled) setState({ status: "error", message: "Network error. Refresh the page." });
      }
    }
    start();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.status !== "ready") return;
    if (!/^\d{6}$/.test(code)) return;

    setState({ status: "verifying", data: state.data });
    try {
      const chal = await fetch("/api/auth/mfa/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ factorId: state.data.factorId }),
      });
      const chalJson = (await chal.json()) as
        | { challengeId: string }
        | { error: string; message?: string };
      if (!chal.ok || !("challengeId" in chalJson)) {
        setState({ status: "error", message: "Could not start challenge" });
        return;
      }

      const verify = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          factorId: state.data.factorId,
          challengeId: chalJson.challengeId,
          code,
        }),
      });
      if (!verify.ok) {
        setState({ status: "ready", data: state.data });
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setState({ status: "error", message: "Network error. Try again." });
    }
  }

  async function copySecret(secret: string) {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* no-op */
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

  const { data } = state;

  return (
    <div className="flex flex-col gap-6">
      {/* QR — primary path on desktop */}
      <div className="flex flex-col items-center gap-3">
        <div className="bg-white p-3 rounded-lg">
          {/* Supabase returns an SVG data URI for the QR. */}
          <img src={data.qrCode} alt="TOTP enrollment QR code" width={180} height={180} />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-text-dim">
          Scan with your authenticator
        </p>
      </div>

      {/* Single-phone path: deep link straight into authenticator app */}
      <a
        href={data.uri}
        className="inline-flex items-center justify-center gap-2 border border-border bg-surface-2 text-text font-mono text-xs uppercase tracking-widest rounded-lg px-4 py-3 hover:bg-bg transition-colors"
      >
        <Smartphone className="w-4 h-4" />
        Open in authenticator app
      </a>

      {/* Manual entry — for users without QR access */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-text-mute">
          Or enter this code manually
        </span>
        <div className="flex items-center justify-between gap-2 border border-border bg-bg rounded-lg px-3 py-2.5">
          <code className="font-mono text-xs text-text break-all">{data.secret}</code>
          <button
            type="button"
            onClick={() => copySecret(data.secret)}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-accent hover:text-accent-2 shrink-0"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Verify */}
      <form onSubmit={onVerify} className="flex flex-col gap-3 pt-2 border-t border-border">
        <label
          htmlFor={codeId}
          className="font-mono text-[10px] uppercase tracking-widest text-text-mute"
        >
          Enter the 6-digit code
        </label>
        <Input
          id={codeId}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
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
            "Verify & continue"
          )}
        </button>
      </form>
    </div>
  );
}
