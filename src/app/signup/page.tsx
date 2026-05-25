import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "./signup-form";
import Link from "next/link";

export const metadata = {
  title: "Sign up — Topdraft",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Free to play. 18+ only. No payment required."
      footer={
        <p className="font-mono text-xs text-text-mute">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:text-accent-2 transition-colors">
            Log in
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
