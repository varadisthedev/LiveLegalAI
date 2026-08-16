import { apiClient } from "@/lib/api-client";
import { unwrap } from "@/lib/api-envelope";
import type { ChatResponse } from "@/types/chat";

/**
 * The backend's /api/chat/chat handler only reads { document_id, question }
 * (see backend/controllers/chatController.js) — format/language/session_id
 * are not forwarded to the AI, so we don't send fields the API ignores.
 */
export async function askDocument(documentId: string, question: string): Promise<ChatResponse> {
  const res = await apiClient.post("/api/chat/chat", {
    document_id: documentId,
    question,
  });
  return unwrap(res);
}
