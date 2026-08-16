"use client";

import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { ChatWidget } from "@/features/chat/components/chat-widget";

export function AppShell({ children, hideChatWidget = false }: { children: ReactNode; hideChatWidget?: boolean }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <span className="font-serif font-semibold text-foreground">LiveLegal AI</span>
          <span className="w-10" />
        </header>

        <main className="relative w-full flex-1 overflow-y-auto">
          <div className="mx-auto h-full max-w-[1400px] p-4 sm:p-6 md:p-8">{children}</div>
          {!hideChatWidget && <ChatWidget />}
        </main>
      </div>
    </div>
  );
}
