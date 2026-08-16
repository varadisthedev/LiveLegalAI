export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  showFormatPicker?: boolean;
}

export interface ChatResponse {
  answer: string;
  session_id?: string;
  sources_used?: number;
  context_snippets?: string[];
}

export type ResponseFormat = "brief" | "summarized" | "pointers";
