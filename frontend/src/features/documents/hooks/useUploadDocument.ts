"use client";

import { useCallback, useRef, useState } from "react";
import { getDocumentStatus, uploadDocument } from "@/features/documents/api";
import type { DocumentStatusPayload } from "@/types/document";

const POLL_INTERVAL_MS = 1000;

export function useUploadDocument() {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DocumentStatusPayload | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    setProgress(0);
    setStatusMessage("");
    setUploading(false);
    setUploaded(false);
    setError("");
    setResult(null);
  }, [stopPolling]);

  const upload = useCallback(
    async (file: File) => {
      reset();
      setUploading(true);
      setProgress(5);
      setStatusMessage("Uploading document...");

      try {
        const { documentId, filename } = await uploadDocument(file);
        console.log("[upload] started", documentId, filename);

        pollRef.current = setInterval(async () => {
          try {
            const status = await getDocumentStatus(documentId);
            console.log("[upload] status", status.status, status.progress + "%");
            setProgress(status.progress);
            setStatusMessage(status.statusMessage);

            if (status.status === "completed") {
              stopPolling();
              setProgress(100);
              setUploading(false);
              setUploaded(true);
              setResult(status);
            } else if (status.status === "failed") {
              stopPolling();
              setUploading(false);
              setError(status.error || "Processing failed");
            }
          } catch (pollErr) {
            stopPolling();
            setUploading(false);
            setError(pollErr instanceof Error ? pollErr.message : "Status polling error");
          }
        }, POLL_INTERVAL_MS);
      } catch (err) {
        console.error("[upload] failed", err);
        setUploading(false);
        setError(err instanceof Error ? err.message : "Failed to upload document");
      }
    },
    [reset, stopPolling],
  );

  return { upload, reset, progress, statusMessage, uploading, uploaded, error, result };
}
