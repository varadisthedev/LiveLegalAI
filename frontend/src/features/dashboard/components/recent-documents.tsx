import Link from "next/link";
import { FileText, MessageSquare, Upload } from "lucide-react";
import { RiskIndicator } from "@/features/documents/components/risk-indicator";
import { ROUTES } from "@/lib/constants";
import type { DocumentRecord } from "@/types/document";

export function RecentDocuments({ documents, loading }: { documents: DocumentRecord[]; loading: boolean }) {
  if (loading) {
    return <div className="px-6 py-10 text-center text-sm text-muted-foreground">Loading documents...</div>;
  }

  if (documents.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted/30 text-muted-foreground">
          <Upload size={24} />
        </div>
        <p className="mb-1 text-sm font-semibold text-foreground">No documents yet</p>
        <p className="text-xs text-muted-foreground">Upload your first legal document to get started.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {documents.map((doc) => (
        <div key={doc._id} className="flex flex-wrap items-center gap-4 px-6 py-5 transition-colors hover:bg-muted/30">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted/30">
              <FileText size={18} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{doc.originalName}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(doc.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <RiskIndicator level={doc.riskLevel} size="sm" />

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.analysis(doc.documentId)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/50"
            >
              Open
            </Link>
            <Link
              href={ROUTES.chat(doc.documentId)}
              className="hidden items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/50 sm:inline-flex"
            >
              <MessageSquare size={12} />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
