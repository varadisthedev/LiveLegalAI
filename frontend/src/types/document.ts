import type { RiskLevel } from "@/lib/constants";

export type DocumentStatus = "processing" | "completed" | "failed";

export interface RiskFactor {
  label: string;
  points: number;
  category: string;
}

export interface DocumentRecord {
  _id: string;
  userId: string;
  fileUrl: string;
  originalName: string;
  documentId: string;
  numChunks: number;
  analyzed: boolean;
  documentType: string;
  summary: string;
  explanation: string;
  suggestedReply: string;
  severityScore: number;
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  status: DocumentStatus;
  statusMessage: string;
  progress: number;
  error: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentStatusPayload {
  documentId: string;
  status: DocumentStatus;
  statusMessage: string;
  progress: number;
  error: string;
  originalName: string;
}

export interface DocumentAnalysis {
  document_id: string;
  document_type: string;
  summary: string;
  explanation: string;
  suggested_reply: string;
  severity_score: number;
  risk_level: RiskLevel;
  risk_factors: RiskFactor[];
}
