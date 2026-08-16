"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RiskIndicator } from "@/features/documents/components/risk-indicator";
import { deleteDocument, downloadReport, getDocumentHistory } from "@/features/documents/api";
import { ROUTES } from "@/lib/constants";
import type { DocumentRecord } from "@/types/document";

export default function HistoryPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState("");
  const [downloadingId, setDownloadingId] = useState("");

  useEffect(() => {
    getDocumentHistory()
      .then((docs) => {
        console.log("[history] loaded", docs.length, "documents");
        setDocuments(docs);
      })
      .catch((err) => console.error("[history] failed to load", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = documents.filter((doc) =>
    `${doc.originalName} ${doc.documentType}`.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    setDeletingId(pendingDeleteId);
    try {
      await deleteDocument(pendingDeleteId);
      setDocuments((docs) => docs.filter((d) => d._id !== pendingDeleteId));
      console.log("[history] deleted", pendingDeleteId);
    } catch (err) {
      console.error("[history] delete failed", err);
    } finally {
      setDeletingId("");
      setPendingDeleteId(null);
    }
  };

  const handleDownload = async (doc: DocumentRecord) => {
    setDownloadingId(doc._id);
    try {
      await downloadReport(doc._id, doc.originalName);
    } catch (err) {
      console.error("[history] report download failed", err);
    } finally {
      setDownloadingId("");
    }
  };

  return (
    <AppShell>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="mb-2 font-serif text-2xl font-bold text-foreground sm:text-3xl">Document History</h1>
          <p className="text-sm text-muted-foreground">Manage and audit your analyzed legal documents.</p>
        </div>
        <button
          onClick={() => router.push(ROUTES.upload)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus size={16} /> New Analysis
        </button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by document title or type..."
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">Loading documents...</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">No documents found.</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((doc) => (
              <div key={doc._id} className="flex flex-wrap items-center gap-4 px-6 py-5 transition-colors hover:bg-muted/30">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <FileText size={18} className="mt-0.5 flex-shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{doc.originalName}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.documentType} · {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <RiskIndicator level={doc.riskLevel} size="sm" />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(doc)}
                    disabled={downloadingId === doc._id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/50 disabled:opacity-60"
                  >
                    {downloadingId === doc._id ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                    Report
                  </button>
                  <button
                    onClick={() => router.push(ROUTES.analysis(doc.documentId))}
                    className="hidden text-sm font-semibold text-primary hover:opacity-80 sm:inline-flex"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => setPendingDeleteId(doc._id)}
                    disabled={deletingId === doc._id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">Showing {filtered.length} documents</p>

      <Dialog open={!!pendingDeleteId} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this document?</DialogTitle>
            <DialogDescription>
              This will permanently remove the document and all of its analysis and chat history. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setPendingDeleteId(null)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={!!deletingId}
              className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-60"
            >
              {deletingId ? "Deleting…" : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
