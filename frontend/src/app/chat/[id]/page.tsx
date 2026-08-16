import { AppShell } from "@/components/layout/app-shell";
import { ChatPageClient } from "@/features/chat/components/chat-page-client";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppShell hideChatWidget>
      <ChatPageClient documentId={id} />
    </AppShell>
  );
}
