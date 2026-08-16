"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAccount } from "@/features/auth/api";
import { signupSchema, type SignupValues } from "@/features/auth/types";
import { ROUTES } from "@/lib/constants";

export function SignupForm() {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (values: SignupValues) => {
    setFormError("");
    try {
      await registerAccount(values.name, values.email, values.password);

      // Immediately establish a NextAuth session with the same credentials.
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        console.error("[auth] post-signup login failed", result.error);
        setFormError("Account created — please sign in.");
        router.push(ROUTES.login);
        return;
      }

      router.push(ROUTES.dashboard);
    } catch (err) {
      console.error("[auth] signup failed", err);
      setFormError(err instanceof Error ? err.message : "Sign-up failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" placeholder="Your name" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Create a password" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      {formError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertCircle size={14} /> {formError}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
        {isSubmitting ? "Creating account…" : (
          <>
            Create Account <ArrowRight size={16} />
          </>
        )}
      </Button>
    </form>
  );
}
