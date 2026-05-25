import { Suspense } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { ReadEmail } from "./read-email";

export const metadata = { title: "Check your inbox — Topdraft" };

export default function VerifyEmailPage() {
  return (
    <AuthShell
      title="Check your inbox"
      subtitle="We sent you a verification link. Click it to finish creating your account."
      footer={
        <p className="font-mono text-xs text-text-mute">
          Wrong email?{" "}
          <Link href="/signup" className="text-accent hover:text-accent-2 transition-colors">
            Start over
          </Link>
        </p>
      }
    >
      <Suspense fallback={null}>
        <Body />
      </Suspense>
    </AuthShell>
  );
}

function Body() {
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="w-14 h-14 rounded-lg bg-accent-soft border border-border flex items-center justify-center">
        <Mail className="w-6 h-6 text-accent" strokeWidth={2} />
      </div>
      <ReadEmail />
      <p className="font-mono text-xs text-text-dim leading-relaxed text-center max-w-[280px]">
        The link expires in 24 hours. Check your spam folder if you don't see it.
      </p>
    </div>
  );
}
