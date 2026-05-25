import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { MfaEnrollClient } from "./enroll-client";

export const metadata = { title: "Set up two-factor — Topdraft" };

export default function MfaEnrollPage() {
  return (
    <AuthShell
      title="Set up two-factor"
      subtitle="Add an authenticator app. Required to protect your account and trades."
    >
      <Suspense fallback={null}>
        <MfaEnrollClient />
      </Suspense>
    </AuthShell>
  );
}
