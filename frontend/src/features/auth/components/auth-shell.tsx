import Link from "next/link";
import { Scale } from "lucide-react";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <Link href="/" className="mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-primary/10 shadow-sm">
            <Scale size={20} className="text-primary" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
            LiveLegal <span className="text-primary">AI</span>
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </Link>

      <div className="w-full max-w-[420px] rounded-2xl border border-border bg-card p-8 shadow-lg">
        <h1 className="mb-6 font-serif text-xl font-semibold text-foreground">{title}</h1>
        {children}
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      <p className="mt-8 text-xs text-muted-foreground">Private &amp; encrypted · No lawyers needed</p>
    </div>
  );
}
