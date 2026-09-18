const { analyzeDocument, chatWithDocument } = require("./ragProxyService");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const {
  findDocumentByDocumentIdForUser,
  updateDocumentByDocumentId,
} = require("../repositories/documentRepository");
const { saveChatHistory, getChatHistoryByUser } = require("../repositories/chatRepository");

/**
 * Analyze a previously ingested document via the RAG microservice.
 * Returns cached results if the document has already been analyzed.
 */
const analyzeDoc = async (userId, documentId, query) => {
  if (!documentId) {
    throw new AppError("document_id is required.", 400);
  }

  const docMongo = await findDocumentByDocumentIdForUser(documentId, userId);

  if (docMongo && docMongo.analyzed) {
    logger.info(`Returning cached analysis for document: ${documentId}`);
    return {
      document_id: docMongo.documentId,
      summary: docMongo.summary,
      explanation: docMongo.explanation,
      suggested_reply: docMongo.suggestedReply,
      severity_score: docMongo.severityScore,
      risk_level: docMongo.riskLevel,
      risk_factors: docMongo.riskFactors,
      document_type: docMongo.documentType,
    };
  }

  let result;
  try {
    result = await analyzeDocument(documentId, query);
  } catch (error) {
    // FAISS index was wiped by a container restart — user needs to re-upload
    if (error.message === "DOCUMENT_INDEX_EXPIRED") {
      throw new AppError(
        "This document's index has expired (server was restarted). Please re-upload the document to analyse it again.",
        404,
      );
    }
    throw error;
  }

  if (docMongo) {
    await updateDocumentByDocumentId(documentId, {
      analyzed: true,
      documentType: result.document_type || "Legal Notice",
      summary: result.summary,
      explanation: result.explanation,
      suggestedReply: result.suggested_reply,
      severityScore: result.severity_score,
      riskLevel: result.risk_level,
      riskFactors: result.risk_factors || [],
    });
  }

  await saveChatHistory({
    userId,
    documentId,
    question: query || "Analyze this legal document to provide a summary and key obligations.",
    response: `Summary: ${result.summary}\n\nExplanation: ${result.explanation}\n\nSuggested Reply: ${result.suggested_reply}`,
    responseType: "analysis",
    voiceEnabled: false,
    sourcesUsed: 0,
  });

  logger.info(`Document fully analyzed: ${documentId} for user ${userId}`);
  return result;
};

/**
 * Chat interactively with a document via the RAG microservice.
 */
const chatWithDoc = async (userId, documentId, question) => {
  if (!documentId || !question) {
    throw new AppError("document_id and question are both required.", 400);
  }

  let result;
  try {
    result = await chatWithDocument(documentId, question);
  } catch (error) {
    if (error.message === "DOCUMENT_INDEX_EXPIRED") {
      throw new AppError(
        "This document's index has expired (server was restarted). Please re-upload the document to continue chatting.",
        404,
      );
    }
    throw error;
  }

  await saveChatHistory({
    userId,
    documentId,
    question,
    response: result.answer,
    responseType: "rag_chat",
    voiceEnabled: false,
    sourcesUsed: result.sources_used || 0,
  });

  logger.info(`Chat answered for document: ${documentId}, user: ${userId}`);
  return result;
};

const getHistory = async (userId) => getChatHistoryByUser(userId);

module.exports = {
  analyzeDoc,
  chatWithDoc,
  getHistory,
};
