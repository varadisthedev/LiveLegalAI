"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileCheck, Info, MessageSquare, Upload as UploadIcon } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { UploadBox } from "@/features/documents/components/upload-box";
import { ROUTES } from "@/lib/constants";
import type { DocumentStatusPayload } from "@/types/document";

const tips = [
  "Supported formats: PDF, DOCX",
  "Maximum file size: 10MB",
  "Your documents are processed securely and never shared",
  "Analysis is usually ready within 30 seconds",
];

const steps = [
  { step: "1", title: "Document Processing", desc: "Your document is parsed and text is extracted securely." },
  { step: "2", title: "AI Analysis", desc: "Our AI identifies clauses, risks, and key legal provisions." },
  { step: "3", title: "Results Ready", desc: "View a full analysis report and start chatting with your document." },
];

export default function UploadPage() {
  const router = useRouter();
  const [completed, setCompleted] = useState<{ documentId: string; filename: string } | null>(null);

  const handleUploadComplete = (result: DocumentStatusPayload, filename: string) => {
    console.log("[upload] document processed", result.documentId);
    setCompleted({ documentId: result.documentId, filename });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <UploadIcon size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Upload Document</h1>
            <p className="text-sm text-muted-foreground">
              Upload your legal document to receive an instant AI-powered analysis.
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <UploadBox onUploadComplete={handleUploadComplete} />
        </div>

        {completed ? (
          <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 p-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-center sm:text-left">
                <h3 className="mb-1 text-lg font-bold text-foreground">Document Processed</h3>
                <p className="text-sm text-muted-foreground">&ldquo;{completed.filename}&rdquo; is ready for review.</p>
              </div>
              <div className="flex w-full gap-3 sm:w-auto">
                <button
                  onClick={() => router.push(ROUTES.analysis(completed.documentId))}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow hover:opacity-90 sm:flex-none"
                >
                  <FileCheck size={16} /> View Analysis
                </button>
                <button
                  onClick={() => router.push(ROUTES.chat(completed.documentId))}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary/30 bg-card px-4 py-2.5 text-sm font-bold text-foreground shadow hover:bg-muted/50 sm:flex-none"
                >
                  <MessageSquare size={16} /> Ask AI
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Info size={16} className="text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Before you upload</h2>
              </div>
              <ul className="space-y-2">
                {tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/50" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <FileCheck size={16} className="text-risk-low" />
                <h2 className="text-sm font-semibold text-foreground">What happens after upload?</h2>
              </div>
              <div className="space-y-4">
                {steps.map(({ step, title, desc }) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {step}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
