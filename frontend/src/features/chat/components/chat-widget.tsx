"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocumentName } from "@/features/documents/hooks/useDocumentName";
import { ChatPanel } from "@/features/chat/components/chat-panel";

/** Floating assistant available from any app page — resolves the active
 * document from the URL when the user is looking at a specific one. */
export function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const segments = pathname?.split("/").filter(Boolean) ?? [];
  const isDocumentScoped = segments[0] === "analysis" || segments[0] === "chat";
  const documentId = isDocumentScoped ? segments[1] : undefined;
  const documentName = useDocumentName(documentId, "General questions");

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        aria-label="Open AI Assistant"
      >
        <MessageSquare size={22} />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex w-[calc(100vw-32px)] flex-col rounded-2xl border border-border bg-card shadow-xl transition-all sm:right-6 sm:w-[400px]",
        isMinimized ? "h-[60px]" : "h-[560px] max-h-[82vh]",
      )}
    >
      <div
        className="flex cursor-pointer items-center justify-between rounded-t-2xl border-b border-border bg-muted/40 px-4 py-3.5"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div>
          <h3 className="text-sm font-semibold text-foreground">LiveLegal Assistant</h3>
          <p className="truncate text-xs text-muted-foreground">{documentName}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
          >
            <ChevronDown size={16} className={cn("transition-transform", isMinimized && "rotate-180")} />
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex-1 overflow-hidden p-3">
          <ChatPanel documentId={documentId} documentName={documentName} compact />
        </div>
      )}
    </div>
  );
}
