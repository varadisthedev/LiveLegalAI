"use client";

import { useCallback, useEffect, useState } from "react";
import { analyzeDocument } from "@/features/documents/api";
import type { DocumentAnalysis } from "@/types/document";

export function useDocumentAnalysis(documentId: string | undefined) {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Only the async continuation (after the request resolves) touches state —
  // nothing here runs synchronously inside the effect below.
  const fetchAnalysis = useCallback(
    (signal: { cancelled: boolean }) => {
      if (!documentId) return;
      analyzeDocument(documentId)
        .then((result) => {
          if (signal.cancelled) return;
          console.log("[analysis] received", documentId, result.risk_level, result.severity_score);
          setAnalysis(result);
          setError("");
        })
        .catch((err) => {
          if (signal.cancelled) return;
          console.error("[analysis] failed", err);
          setError(err instanceof Error ? err.message : "Analysis failed. Please retry.");
        })
        .finally(() => {
          if (!signal.cancelled) setLoading(false);
        });
    },
    [documentId],
  );

  useEffect(() => {
    const signal = { cancelled: false };
    fetchAnalysis(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [fetchAnalysis]);

  // Manual retry, triggered from a button click — safe to set state synchronously here.
  const retry = useCallback(() => {
    setLoading(true);
    setError("");
    fetchAnalysis({ cancelled: false });
  }, [fetchAnalysis]);

  return { analysis, loading, error, retry };
}
