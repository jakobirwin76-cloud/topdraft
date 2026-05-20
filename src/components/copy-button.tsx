"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* no-op */
    }
  }
  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex items-center justify-center gap-2 bg-accent text-bg font-mono text-xs uppercase tracking-widest px-5 py-3 hover:bg-accent-2 transition-colors duration-150"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" strokeWidth={2.5} />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" strokeWidth={2.5} />
          Copy link
        </>
      )}
    </button>
  );
}
