"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, AlertTriangle, ChevronRight, FileText, Info, MessageSquare, RefreshCw, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentAnalysis } from "@/features/documents/hooks/useDocumentAnalysis";
import { ROUTES } from "@/lib/constants";

const RISK_RING_COLOR: Record<string, string> = {
  High: "text-destructive",
  Moderate: "text-risk-moderate",
  Low: "text-risk-low",
  Unknown: "text-muted-foreground",
};

function factorTone(points: number) {
  if (points > 25) return { icon: AlertTriangle, text: "text-destructive", bg: "bg-destructive/5 border-destructive/20" };
  if (points > 10) return { icon: AlertCircle, text: "text-risk-moderate", bg: "bg-risk-moderate/5 border-risk-moderate/20" };
  return { icon: Info, text: "text-primary", bg: "bg-primary/5 border-primary/20" };
}

export function DocumentAnalysisView({ documentId }: { documentId: string }) {
  const router = useRouter();
  const { analysis, loading, error, retry } = useDocumentAnalysis(documentId);

  const dashArray = 276;
  const score = analysis?.severity_score ?? 0;
  const dashOffset = dashArray - (dashArray * score) / 100;

  return (
    <div>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <button onClick={() => router.push(ROUTES.dashboard)} className="hover:text-foreground">
            Documents
          </button>
          <ChevronRight size={14} />
          <span className="truncate text-primary">{analysis?.document_type || "Loading..."}</span>
        </div>
        <button
          onClick={() => router.push(ROUTES.chat(documentId))}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
        >
          <MessageSquare size={16} /> Chat with Document
        </button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-10 w-2/3" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <Skeleton className="h-80 lg:col-span-4" />
            <Skeleton className="h-80 lg:col-span-8" />
          </div>
        </div>
      ) : error ? (
        <div className="px-4 py-20 text-center">
          <AlertCircle size={36} className="mx-auto mb-4 text-destructive" />
          <p className="mx-auto mb-4 max-w-md font-medium text-destructive">{error}</p>
          {error.toLowerCase().includes("re-upload") ? (
            <button
              onClick={() => router.push(ROUTES.upload)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <FileText size={14} /> Re-upload Document
            </button>
          ) : (
            <button
              onClick={retry}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <RefreshCw size={14} /> Retry Analysis
            </button>
          )}
        </div>
      ) : analysis ? (
        <div>
          <div className="mb-8">
            <h1 className="mb-2 break-words font-serif text-2xl font-bold text-foreground sm:text-3xl">
              {analysis.document_type || "Unknown Document Type"}
            </h1>
            <p className="text-sm text-muted-foreground">Analyzed just now</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left column */}
            <div className="flex flex-col gap-6 lg:col-span-4">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Severity Risk Score
                </h3>
                <div className="relative mb-8 flex justify-center">
                  <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-muted sm:h-40 sm:w-40">
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="44"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeDasharray={dashArray}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                        className={RISK_RING_COLOR[analysis.risk_level] || RISK_RING_COLOR.Unknown}
                      />
                    </svg>
                    <div className="text-center">
                      <span className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                        {score}
                        <span className="text-base text-muted-foreground">/100</span>
                      </span>
                      <p className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${RISK_RING_COLOR[analysis.risk_level]}`}>
                        {analysis.risk_level || "Unknown"} Risk
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {analysis.risk_factors?.slice(0, 3).map((factor, idx) => {
                    const tone = factorTone(factor.points);
                    return (
                      <div key={idx}>
                        <div className="mb-1.5 flex items-end justify-between">
                          <span className="max-w-[70%] truncate pr-2 text-xs font-medium text-muted-foreground">
                            {factor.label}
                          </span>
                          <span className={`text-xs font-bold ${tone.text}`}>{factor.points} pts</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={tone.text.replace("text-", "bg-")}
                            style={{ width: `${Math.min(factor.points * 2, 100)}%`, height: "100%" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-1 flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-2">
                  <Zap size={18} className="text-primary" />
                  <h3 className="text-[15px] font-bold text-foreground">AI Executive Summary</h3>
                </div>
                <div className="mb-6 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {analysis.summary}
                </div>
                <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-muted-foreground">
                  <FileText size={16} className="mt-0.5 flex-shrink-0 text-primary" />
                  <p className="min-w-0">
                    <span className="font-semibold text-foreground">Explanation:</span> {analysis.explanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-6 lg:col-span-8">
              <div className="flex-1 rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground sm:text-[15px] sm:normal-case sm:tracking-wide">
                    AI Breakdown & Risk Factors
                  </h3>
                  <Badge variant="outline" className="w-fit">
                    {analysis.risk_factors?.length || 0} points noted
                  </Badge>
                </div>
                <div className="space-y-4">
                  {analysis.risk_factors && analysis.risk_factors.length > 0 ? (
                    analysis.risk_factors.map((factor, idx) => {
                      const tone = factorTone(factor.points);
                      const Icon = tone.icon;
                      return (
                        <div key={idx} className={`flex gap-4 rounded-xl border p-4 transition-colors ${tone.bg}`}>
                          <Icon size={20} className={`mt-0.5 flex-shrink-0 ${tone.text}`} />
                          <div>
                            <h4 className="mb-1 text-sm font-bold text-foreground sm:text-[15px]">{factor.label}</h4>
                            <p className="text-xs capitalize text-muted-foreground sm:text-sm">
                              Category: {factor.category?.replace(/_/g, " ")}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm italic text-muted-foreground">No specific risk factors extracted.</p>
                  )}
                </div>
              </div>

              <div className="flex flex-1 flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  <h3 className="text-[15px] font-bold text-foreground">Suggested Negotiation Reply</h3>
                </div>
                <div className="flex-1 whitespace-pre-wrap rounded-xl border border-border bg-muted/30 p-4 font-mono text-xs leading-relaxed text-muted-foreground sm:p-5 sm:text-[13px]">
                  {analysis.suggested_reply || "No suggestion provided."}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
