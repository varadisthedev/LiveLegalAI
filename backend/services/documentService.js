const { v4: uuidv4 } = require("uuid");
const { ingestDocument, analyzeDocument } = require("./ragProxyService");
const cloudinary = require("../config/cloudinary");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const {
  createDocument,
  getDocumentHistoryByUser,
  getDocumentById,
  findDocumentByDocumentIdForUser,
  updateDocumentByDocumentId,
  deleteDocumentByMongoId,
} = require("../repositories/documentRepository");
const { deleteChatsByUserAndDocument } = require("../repositories/chatRepository");

const uploadToCloudinary = (fileBuffer, documentId) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "livelegalai/documents",
        public_id: documentId,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    uploadStream.end(fileBuffer);
  });

/**
 * Runs the ingest -> cloud upload -> analyze pipeline after the caller has
 * already been given a 202 response. Every step reports its own progress
 * onto the document record so the frontend can poll status.
 */
const processDocumentInBackground = async (documentId, fileBuffer, originalName) => {
  try {
    await updateDocumentByDocumentId(documentId, {
      progress: 20,
      statusMessage: "Parsing document and extracting text...",
    });
    const ragResult = await ingestDocument(fileBuffer, originalName, documentId);

    await updateDocumentByDocumentId(documentId, {
      progress: 45,
      statusMessage: "Uploading original file to secure cloud storage...",
    });
    const cloudRes = await uploadToCloudinary(fileBuffer, documentId);

    await updateDocumentByDocumentId(documentId, {
      progress: 70,
      statusMessage: "Analyzing document clauses and risk scoring...",
    });
    const analysisResult = await analyzeDocument(documentId);

    await updateDocumentByDocumentId(documentId, {
      fileUrl: cloudRes.secure_url,
      cloudinaryPublicId: cloudRes.public_id || "",
      numChunks: ragResult.num_chunks,
      documentType: analysisResult.document_type || "Legal File",
      summary: analysisResult.summary || "",
      explanation: analysisResult.explanation || "",
      suggestedReply: analysisResult.suggested_reply || "",
      severityScore: analysisResult.severity_score || 0,
      riskLevel: analysisResult.risk_level || "Unknown",
      riskFactors: analysisResult.risk_factors || [],
      analyzed: true,
      status: "completed",
      progress: 100,
      statusMessage: "Document processed successfully",
    });
    logger.info(`Background document processing completed successfully: ${documentId}`);
  } catch (err) {
    logger.error(`Background document processing failed for ${documentId}: ${err.message}`);
    await updateDocumentByDocumentId(documentId, {
      status: "failed",
      statusMessage: `Error: ${err.message}`,
      progress: 0,
      error: err.message,
    });
  }
};

/**
 * Creates the pending document record and kicks off background processing.
 * Resolves as soon as the record exists — the caller responds 202 and the
 * pipeline continues after that.
 */
const uploadDocument = async (userId, file) => {
  if (!file) {
    throw new AppError("No file provided. Please upload a PDF or DOCX.", 400);
  }

  const { buffer: fileBuffer, originalname } = file;
  const documentId = `doc_${uuidv4().replace(/-/g, "").substring(0, 12)}`;

  await createDocument({
    userId,
    fileUrl: "pending",
    originalName: originalname,
    documentId,
    status: "processing",
    statusMessage: "Initializing upload to server...",
    progress: 5,
  });

  logger.info(`Starting background processing for document: ${documentId}`);

  // Fire-and-forget — deliberately not awaited so the caller can respond now.
  processDocumentInBackground(documentId, fileBuffer, originalname);

  return {
    documentId,
    filename: originalname,
    message: "Processing started in the background",
  };
};

const getDocumentStatus = async (userId, documentId) => {
  const doc = await findDocumentByDocumentIdForUser(documentId, userId);
  if (!doc) {
    throw new AppError("Document not found.", 404);
  }

  return {
    documentId: doc.documentId,
    status: doc.status,
    statusMessage: doc.statusMessage,
    progress: doc.progress,
    error: doc.error,
    originalName: doc.originalName,
  };
};

/**
 * Deletes a document and its related resources: Cloudinary file, chat
 * records, and the Mongo document itself.
 */
const deleteDocument = async (userId, id) => {
  const doc = await getDocumentById(id, userId);
  if (!doc) {
    throw new AppError("Document not found", 404);
  }

  if (doc.cloudinaryPublicId) {
    try {
      await cloudinary.uploader.destroy(doc.cloudinaryPublicId, {
        resource_type: "auto",
      });
    } catch (err) {
      logger.warn(
        `Failed to delete Cloudinary resource ${doc.cloudinaryPublicId}: ${err.message}`,
      );
    }
  }

  try {
    await deleteChatsByUserAndDocument(userId, doc.documentId);
  } catch (err) {
    logger.warn(
      `Failed to delete chat records for doc ${doc.documentId}: ${err.message}`,
    );
  }

  await deleteDocumentByMongoId(id);

  return { message: "Document deleted" };
};

const getReportDocument = async (userId, id) => {
  const doc = await getDocumentById(id, userId);
  if (!doc) {
    throw new AppError("Document not found", 404);
  }
  return doc;
};

const getHistory = async (userId) => getDocumentHistoryByUser(userId);

const getDocument = async (userId, id) => {
  const doc = await getDocumentById(id, userId);
  if (!doc) {
    throw new AppError("Document not found.", 404);
  }
  return doc;
};

module.exports = {
  uploadDocument,
  getDocumentStatus,
  deleteDocument,
  getReportDocument,
  getHistory,
  getDocument,
};
