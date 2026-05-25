import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "./login-form";
import Link from "next/link";

export const metadata = {
  title: "Log in — Topdraft",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your Topdraft account."
      footer={
        <p className="font-mono text-xs text-text-mute">
          New here?{" "}
          <Link href="/signup" className="text-accent hover:text-accent-2 transition-colors">
            Create an account
          </Link>
          {" · "}
          <Link href="/demo" className="text-text-mute hover:text-text transition-colors">
            Try without signing up
          </Link>
        </p>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
