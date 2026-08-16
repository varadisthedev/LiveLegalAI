import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { GoogleButton } from "@/features/auth/components/google-button";
import { SignupForm } from "@/features/auth/components/signup-form";
import { ROUTES } from "@/lib/constants";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Understand any legal letter in seconds"
      footer={
        <>
          Already have an account?{" "}
          <Link href={ROUTES.login} className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <div className="mb-6">
        <GoogleButton label="Sign up with Google" />
      </div>
      <div className="mb-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or sign up with email</span>
        <Separator className="flex-1" />
      </div>
      <SignupForm />
    </AuthShell>
  );
}
