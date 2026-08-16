import { apiClient } from "@/lib/api-client";
import { unwrap } from "@/lib/api-envelope";
import type {
  DocumentAnalysis,
  DocumentRecord,
  DocumentStatusPayload,
} from "@/types/document";

export interface UploadStartResult {
  documentId: string;
  filename: string;
  message: string;
}

export async function uploadDocument(file: File): Promise<UploadStartResult> {
  const formData = new FormData();
  formData.append("document", file);
  const res = await apiClient.post("/api/document/upload", formData);
  return unwrap(res);
}

export async function getDocumentStatus(
  documentId: string,
): Promise<DocumentStatusPayload> {
  const res = await apiClient.get(`/api/document/${documentId}/status`);
  return unwrap(res);
}

export async function getDocumentHistory(): Promise<DocumentRecord[]> {
  const res = await apiClient.get("/api/document/history");
  return unwrap(res);
}

export async function getDocument(id: string): Promise<DocumentRecord> {
  const res = await apiClient.get(`/api/document/${id}`);
  return unwrap(res);
}

export async function deleteDocument(id: string): Promise<void> {
  await apiClient.delete(`/api/document/${id}`);
}

export async function downloadReport(id: string, filename: string): Promise<void> {
  const res = await apiClient.get(`/api/document/${id}/report`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename || "analysis"}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function analyzeDocument(documentId: string): Promise<DocumentAnalysis> {
  const res = await apiClient.post("/api/chat/analyze", { document_id: documentId });
  return unwrap(res);
}
