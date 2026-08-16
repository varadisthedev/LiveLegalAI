"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle, FileText, Upload, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useUploadDocument } from "@/features/documents/hooks/useUploadDocument";
import type { DocumentStatusPayload } from "@/types/document";

// The RAG service only parses PDF and DOCX (see rag_service/core/document_parser.py) —
// advertising more formats than the backend can actually process would break silently.
const ACCEPTED_EXTS = [".pdf", ".docx"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

function validateFile(file: File): string {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ACCEPTED_EXTS.includes(ext)) return "Only PDF and DOCX files are supported.";
  if (file.size > MAX_SIZE_BYTES) return "File size must be under 10MB.";
  return "";
}

export function UploadBox({
  onUploadComplete,
}: {
  onUploadComplete: (result: DocumentStatusPayload, filename: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { upload, reset, progress, statusMessage, uploading, uploaded, error, result } =
    useUploadDocument();

  useEffect(() => {
    if (result && file) {
      onUploadComplete(result, file.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    const err = validateFile(f);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError("");
    setFile(f);
    reset();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const removeFile = () => {
    setFile(null);
    setValidationError("");
    reset();
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;
    await upload(file);
  };

  const displayError = validationError || error;

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={cn(
          "relative rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer",
          dragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5",
          file && "cursor-default",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {!file ? (
          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-2xl bg-card shadow-sm transition-all",
                dragging && "scale-110 bg-primary/10",
              )}
            >
              <Upload size={28} className={dragging ? "text-primary" : "text-muted-foreground"} />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                {dragging ? "Drop your file here" : "Drag & drop your document"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                or <span className="font-medium text-primary hover:underline">browse to upload</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {["PDF", "DOCX"].map((fmt) => (
                <span
                  key={fmt}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm"
                >
                  {fmt}
                </span>
              ))}
              <span className="text-xs text-muted-foreground">· Max 10MB</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-left">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
              <FileText size={24} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            {uploaded ? (
              <CheckCircle size={22} className="flex-shrink-0 text-risk-low" />
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="flex-shrink-0 rounded-full p-1.5 transition-colors hover:bg-destructive/10"
                aria-label="Remove file"
              >
                <X size={18} className="text-muted-foreground hover:text-destructive" />
              </button>
            )}
          </div>
        )}
      </div>

      {displayError && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle size={16} />
          {displayError}
        </div>
      )}

      {(uploading || uploaded) && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{uploaded ? "Upload complete" : statusMessage || "Uploading..."}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {file && !uploading && !uploaded && (
        <button
          onClick={handleUpload}
          className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-md transition-all hover:opacity-90 active:scale-[0.99]"
        >
          Upload Document
        </button>
      )}

      {uploaded && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-risk-low/20 bg-risk-low/10 py-3 text-sm font-medium text-risk-low">
          <CheckCircle size={16} />
          Document uploaded successfully!
        </div>
      )}
    </div>
  );
}
