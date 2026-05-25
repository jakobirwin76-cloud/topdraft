import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { MfaChallengeClient } from "./challenge-client";

export const metadata = { title: "Two-factor — Topdraft" };

export default function MfaChallengePage() {
  return (
    <AuthShell
      title="Two-factor code"
      subtitle="Enter the 6-digit code from your authenticator app."
    >
      <Suspense fallback={null}>
        <MfaChallengeClient />
      </Suspense>
    </AuthShell>
  );
}
