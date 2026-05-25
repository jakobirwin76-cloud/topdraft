"use client";

import { useSearchParams } from "next/navigation";

export function ReadEmail() {
  const email = useSearchParams().get("email");
  if (!email) return null;
  return (
    <p className="font-mono text-sm text-text break-all text-center">
      Sent to <span className="text-accent">{email}</span>
    </p>
  );
}
