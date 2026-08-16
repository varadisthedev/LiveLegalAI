"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Scale } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export function PublicNavbar() {
  const { data: session, status } = useSession();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href={ROUTES.home} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
            <Scale size={16} className="text-primary" />
          </div>
          <span className="font-serif text-lg font-bold text-foreground">
            LiveLegal <span className="text-primary">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#analysis" className="hover:text-foreground">Risk analysis</a>
        </nav>

        <div className="flex items-center gap-4">
          {status === "authenticated" && session ? (
            <Link
              href={ROUTES.dashboard}
              className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href={ROUTES.login} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Sign In
              </Link>
              <Link
                href={ROUTES.signup}
                className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
