"use client";

import { signIn } from "next-auth/react";
import { ROUTES } from "@/lib/constants";

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        console.log("[auth] starting Google OAuth flow");
        signIn("google", { callbackUrl: ROUTES.dashboard });
      }}
      className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted/50"
    >
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2a10.34 10.34 0 00-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 009 18z" />
        <path fill="#FBBC05" d="M3.97 10.71A5.41 5.41 0 013.68 9c0-.59.1-1.17.29-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.82.96 4.04l3.01-2.33z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.96L3.97 7.29C4.68 5.16 6.66 3.58 9 3.58z" />
      </svg>
      {label}
    </button>
  );
}
