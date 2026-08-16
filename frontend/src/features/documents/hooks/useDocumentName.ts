"use client";

import { useEffect, useState } from "react";
import { getDocumentHistory } from "@/features/documents/api";

export function useDocumentName(documentId: string | undefined, fallback = "Active Document") {
  const [name, setName] = useState(fallback);

  useEffect(() => {
    if (!documentId) return;
    let cancelled = false;

    getDocumentHistory()
      .then((docs) => {
        if (cancelled) return;
        const doc = docs.find((d) => d.documentId === documentId);
        if (doc) setName(doc.originalName);
      })
      .catch((err) => console.error("[documents] failed to resolve document name", err));

    return () => {
      cancelled = true;
    };
  }, [documentId]);

  return name;
}
