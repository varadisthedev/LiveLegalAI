"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Languages, Mic, Send, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useChat } from "@/features/chat/hooks/useChat";
import { useSTT } from "@/features/chat/hooks/useSTT";

const LANGUAGES = [
  { code: "en-US", label: "English" },
  { code: "hi-IN", label: "हिन्दी" },
];

export function ChatPanel({
  documentId,
  documentName,
  compact = false,
}: {
  documentId: string | undefined;
  documentName: string;
  compact?: boolean;
}) {
  const { messages, isTyping, sendMessage } = useChat(documentId);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en-US");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { isListening, transcript, startListening, stopListening, hasSupport } = useSTT(language);

  // While listening, the textarea mirrors the live transcript directly
  // instead of syncing it into `input` via an effect.
  const displayValue = isListening ? transcript : input;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleMicToggle = () => {
    if (!hasSupport) {
      console.warn("[chat] speech recognition not supported in this browser");
      return;
    }
    if (isListening) {
      // Commit the final transcript into `input` as recording stops.
      setInput(transcript);
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSend = () => {
    const text = isListening ? transcript : input;
    if (!text.trim()) return;
    if (isListening) stopListening();
    sendMessage(text);
    setInput("");
  };

  return (
    <div className="flex h-full flex-col">
      {!compact && (
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-primary">
              <Bot size={15} />
            </div>
            <h2 className="truncate text-sm font-semibold text-foreground">
              Active document: <span className="text-primary">{documentName}</span>
            </h2>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1 text-xs">
            <Languages size={13} className="ml-1 text-muted-foreground" />
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={cn(
                  "rounded px-2 py-1 font-medium transition-colors",
                  language === l.code
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="space-y-6 py-4 pr-2">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                <Bot size={24} className="text-primary" />
              </div>
              <h3 className="mb-1 text-base font-semibold text-foreground">
                Ask anything about this document
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                I can explain clauses, identify risks, summarize sections, and answer questions in
                plain language.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex items-end gap-2", msg.sender === "user" && "flex-row-reverse")}
            >
              <div
                className={cn(
                  "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border",
                  msg.sender === "user"
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                {msg.sender === "user" ? <User size={13} /> : <Bot size={13} />}
              </div>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                  msg.sender === "user"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm border border-border bg-card text-foreground",
                )}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-end gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                <Bot size={13} />
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="h-2 w-2 animate-bounce rounded-full bg-primary/50"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div
        className={cn(
          "flex items-end gap-2 rounded-xl border p-1.5 shadow-inner transition-all",
          isListening ? "border-destructive/40 ring-1 ring-destructive/20" : "border-border bg-muted/30",
        )}
      >
        <Textarea
          value={displayValue}
          onChange={(e) => setInput(e.target.value)}
          readOnly={isListening}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={isListening ? "Listening..." : "Ask a question about your document..."}
          rows={1}
          className="max-h-32 min-h-10 flex-1 resize-none border-none bg-transparent shadow-none focus-visible:ring-0"
        />
        <button
          onClick={handleMicToggle}
          title="Use microphone"
          className={cn(
            "mb-0.5 flex-shrink-0 rounded-lg p-2 transition-colors",
            isListening
              ? "animate-pulse bg-destructive/10 text-destructive"
              : "text-muted-foreground hover:text-primary",
          )}
        >
          <Mic size={18} />
        </button>
        <button
          onClick={handleSend}
          disabled={!displayValue.trim()}
          className={cn(
            "mb-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all",
            displayValue.trim()
              ? "bg-primary text-primary-foreground shadow-md hover:opacity-90"
              : "cursor-not-allowed bg-muted text-muted-foreground",
          )}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
