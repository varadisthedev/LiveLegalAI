import Link from "next/link";
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { GoogleButton } from "@/features/auth/components/google-button";
import { LoginForm } from "@/features/auth/components/login-form";
import { ROUTES } from "@/lib/constants";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue"
      footer={
        <>
          No account?{" "}
          <Link href={ROUTES.signup} className="font-semibold text-primary hover:underline">
            Sign up free
          </Link>
        </>
      }
    >
      <div className="mb-6">
        <GoogleButton />
      </div>
      <div className="mb-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or sign in with email</span>
        <Separator className="flex-1" />
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
