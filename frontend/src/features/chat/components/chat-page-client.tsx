"use client";

import { useDocumentName } from "@/features/documents/hooks/useDocumentName";
import { ChatPanel } from "@/features/chat/components/chat-panel";

export function ChatPageClient({ documentId }: { documentId: string }) {
  const documentName = useDocumentName(documentId);

  return (
    <div className="flex h-[calc(100vh-96px)] flex-col lg:h-[calc(100vh-64px)]">
      <ChatPanel documentId={documentId} documentName={documentName} />
    </div>
  );
}
