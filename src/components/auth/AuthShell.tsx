import Link from "next/link";
import { Logo } from "@/components/logo";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-svh bg-bg text-text flex flex-col">
      <header className="px-6 py-6">
        <Link href="/" className="inline-flex items-center" aria-label="Topdraft home">
          <Logo />
        </Link>
      </header>

      <main className="flex-1 px-6 pb-12 flex items-start justify-center">
        <div className="w-full max-w-[420px] mt-4 sm:mt-12">
          <div className="border border-border bg-surface p-8 sm:p-10">
            <h1 className="font-display text-3xl sm:text-4xl tracking-tight leading-none mb-3">
              {title}
            </h1>
            {subtitle && (
              <p className="font-mono text-sm text-text-mute leading-relaxed mb-8">{subtitle}</p>
            )}
            {!subtitle && <div className="h-8" />}
            {children}
          </div>
          {footer && <div className="mt-6 text-center">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
