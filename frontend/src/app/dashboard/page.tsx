"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AlertTriangle, ArrowRight, Clock, FileText, Plus, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Input } from "@/components/ui/input";
import { getDocumentHistory } from "@/features/documents/api";
import { RecentDocuments } from "@/features/dashboard/components/recent-documents";
import { StatsCard } from "@/features/dashboard/components/stats-card";
import { ROUTES } from "@/lib/constants";
import type { DocumentRecord } from "@/types/document";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getDocumentHistory()
      .then((docs) => {
        console.log("[dashboard] loaded documents", docs.length);
        setDocuments(docs);
      })
      .catch((err) => console.error("[dashboard] failed to load documents", err))
      .finally(() => setLoading(false));
  }, []);

  const highRiskCount = documents.filter((d) => d.riskLevel === "High").length;
  const analyzedToday = documents.filter((d) => {
    const today = new Date();
    return new Date(d.createdAt).toDateString() === today.toDateString();
  }).length;

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return documents
      .filter((doc) =>
        `${doc.originalName} ${doc.documentType} ${doc.riskLevel}`.toLowerCase().includes(term),
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [documents, search]);

  const firstName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Dashboard</p>
              <h1 className="mt-3 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
                Welcome back, {firstName}
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                You have {highRiskCount} high-risk document{highRiskCount === 1 ? "" : "s"} needing review and{" "}
                {analyzedToday} analyzed today.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={ROUTES.upload}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Plus size={16} /> New Analysis
              </Link>
              <Link
                href={ROUTES.history}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 font-semibold text-foreground transition-colors hover:bg-muted/50"
              >
                Case History <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents, types, or risk level..."
          className="max-w-md"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard label="Total Documents" value={String(documents.length)} hint="Total uploaded" icon={FileText} />
          <StatsCard label="Analyzed Today" value={String(analyzedToday)} hint="Since midnight" icon={TrendingUp} />
          <StatsCard label="High Risk Docs" value={String(highRiskCount)} hint="Needs attention" icon={AlertTriangle} />
          <StatsCard label="Documents Processed" value={String(documents.filter((d) => d.analyzed).length)} hint="Fully analyzed" icon={Clock} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="font-serif text-lg font-semibold text-foreground">Recent Analyses</h2>
              <p className="text-xs text-muted-foreground">{filtered.length} documents in view</p>
            </div>
            <Link href={ROUTES.history} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:opacity-80">
              View history <ArrowRight size={14} />
            </Link>
          </div>
          <RecentDocuments documents={filtered} loading={loading} />
        </div>
      </div>
    </AppShell>
  );
}
