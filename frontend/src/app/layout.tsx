import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { fraunces, inter } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "LiveLegalAI — Understand Any Legal Document",
  description:
    "Upload a legal document and get a plain-English summary, risk analysis, and an AI assistant that answers your questions about it.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthSessionProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
