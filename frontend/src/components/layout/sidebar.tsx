"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  FileClock,
  LayoutDashboard,
  LogOut,
  Plus,
  Scale,
  Settings,
  Upload,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

const navItems = [
  { path: ROUTES.dashboard, icon: LayoutDashboard, label: "Dashboard" },
  { path: ROUTES.upload, icon: Upload, label: "Upload Document" },
  { path: ROUTES.history, icon: FileClock, label: "Case History" },
  { path: ROUTES.settings, icon: Settings, label: "Settings" },
];

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const initials = session?.user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-card transition-transform duration-300 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link href={ROUTES.dashboard} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
              <Scale size={16} className="text-primary" />
            </div>
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
              LiveLegal <span className="text-primary">AI</span>
            </span>
          </Link>
          <button className="text-muted-foreground hover:text-foreground lg:hidden" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = pathname?.startsWith(path);
            return (
              <Link
                key={path}
                href={path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary/25 bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Icon size={17} className={isActive ? "text-primary" : "text-muted-foreground"} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-border p-4">
          <Link
            href={ROUTES.settings}
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-3 transition-colors hover:border-primary/25 hover:bg-primary/10"
          >
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={session?.user?.image ?? undefined} alt={session?.user?.name ?? "User"} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-foreground">
                {session?.user?.name || "My Account"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {session?.user?.email || "Open profile"}
              </p>
            </div>
          </Link>

          <Link
            href={ROUTES.upload}
            onClick={onClose}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus size={16} /> New Analysis
          </Link>

          <button
            type="button"
            onClick={() => {
              console.log("[auth] signing out");
              signOut({ callbackUrl: ROUTES.home });
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 font-semibold text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
