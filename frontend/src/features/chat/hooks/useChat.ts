"use client";

import { useCallback, useState } from "react";
import { askDocument } from "@/features/chat/api";
import type { ChatMessage } from "@/types/chat";

let nextId = 0;
const messageId = () => `msg_${Date.now()}_${nextId++}`;

export function useChat(documentId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || !documentId) return;

      setMessages((prev) => [...prev, { id: messageId(), sender: "user", text: trimmed }]);
      setIsTyping(true);
      console.log("[chat] asking", documentId, trimmed);

      try {
        const result = await askDocument(documentId, trimmed);
        console.log("[chat] answer received", { sources: result.sources_used });
        setMessages((prev) => [...prev, { id: messageId(), sender: "ai", text: result.answer }]);
      } catch (err) {
        console.error("[chat] request failed", err);
        setMessages((prev) => [
          ...prev,
          {
            id: messageId(),
            sender: "ai",
            text: "I'm sorry, I couldn't reach the legal assistant just now. Please try again.",
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [documentId],
  );

  return { messages, isTyping, sendMessage };
}
