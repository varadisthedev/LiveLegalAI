"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, Mail, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccountStats } from "@/features/dashboard/api";
import { getCurrentUser } from "@/features/settings/api";
import { ROUTES } from "@/lib/constants";
import type { AccountStats } from "@/types/user";
import type { UserProfile } from "@/types/user";

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<AccountStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCurrentUser(), getAccountStats()])
      .then(([user, accountStats]) => {
        console.log("[settings] loaded profile for", user.email);
        setProfile(user);
        setStats(accountStats);
      })
      .catch((err) => console.error("[settings] failed to load profile", err))
      .finally(() => setLoading(false));
  }, []);

  const initials = profile?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-serif text-2xl font-bold text-foreground">Settings</h1>
      </div>

      {loading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : (
        <div className="mb-8 flex flex-col items-center gap-6 rounded-xl border border-border bg-card p-6 shadow-sm md:flex-row">
          <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
            <AvatarImage src={profile?.avatarUrl || undefined} alt={profile?.name} />
            <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <div className="mb-1 flex flex-col items-center justify-center gap-2 sm:flex-row md:justify-start">
              <h3 className="text-xl font-bold text-foreground">{profile?.name}</h3>
              <Badge variant="outline" className="uppercase tracking-wide">
                {profile?.provider === "google" ? "Google Account" : "Email Account"}
              </Badge>
            </div>
            <p className="mb-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground md:justify-start">
              <Mail size={14} /> {profile?.email}
            </p>
            <p className="text-xs text-muted-foreground">
              Member since{" "}
              {profile?.createdAt &&
                new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              console.log("[auth] signing out from settings");
              signOut({ callbackUrl: ROUTES.home });
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:col-span-2">
          <h3 className="mb-4 text-lg font-bold text-foreground">Account Overview</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="Documents" value={stats?.totalDocuments ?? 0} />
            <Stat label="Chats" value={stats?.totalChats ?? 0} />
            <Stat label="High Risk" value={stats?.riskBreakdown.high ?? 0} />
            <Stat label="Moderate Risk" value={stats?.riskBreakdown.moderate ?? 0} />
            <Stat label="Low Risk" value={stats?.riskBreakdown.low ?? 0} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">Sign-in Method</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {profile?.provider === "google"
              ? "You sign in with your Google account. Password login is not set for this account."
              : "You sign in with your email and password."}
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
      <p className="font-serif text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
