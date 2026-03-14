const { ingestDocument } = require('../services/ragProxyService');
const { saveDocumentHistory, getDocumentHistoryByUser, getDocumentById } = require('../repositories/documentRepository');
const { saveAnalytics } = require('../repositories/analyticsRepository');
const { formatResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');
const fs = require('fs');

/**
 * Upload a PDF/DOCX, ingest it into the RAG microservice, save a record to MongoDB
 */
const uploadDocument = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!req.file) {
      return res.status(400).json(formatResponse(false, null, 'No file provided. Please upload a PDF or DOCX.'));
    }

    const { path: filePath, originalname, filename } = req.file;

    // 1. Send file to external RAG FastAPI service for ingestion
    const ragResult = await ingestDocument(filePath, originalname);

    // 2. Save document record in MongoDB (stores the RAG document_id for later chat/analyze calls)
    const docRecord = {
      userId,
      fileUrl: filename,
      originalName: originalname,
      documentId: ragResult.document_id,  // RAG microservice ID – essential for /analyze and /chat
      numChunks: ragResult.num_chunks,
      documentType: 'Pending Analysis'   // Will be filled after /analyze is called
    };

    const savedDoc = await saveDocumentHistory(docRecord);

    // 3. Fire Analytics to Snowflake (non-blocking best-effort)
    saveAnalytics({
      documentType: 'Pending Analysis',
      legalCategory: 'Unknown',
      severityScore: 0,
      riskLevel: 'Unknown',
      userId
    }).catch(err => logger.error(`Snowflake analytics write failed: ${err.message}`));

    logger.info(`Document uploaded and ingested: ${ragResult.document_id} for user ${userId}`);

    return res.status(200).json(formatResponse(true, {
      id: savedDoc._id,
      documentId: ragResult.document_id,   // <<< Client should store this for /chat and /analyze
      filename: originalname,
      numChunks: ragResult.num_chunks,
      message: ragResult.message
    }));

  } catch (error) {
    next(error);
  }
};

/**
 * Get all document upload history for the authenticated user
 */
const getHistory = async (req, res, next) => {
  try {
    const userId = req.userId;
    const history = await getDocumentHistoryByUser(userId);
    return res.status(200).json(formatResponse(true, history));
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single document record
 */
const getDocument = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const doc = await getDocumentById(id, userId);

    if (!doc) {
      return res.status(404).json(formatResponse(false, null, 'Document not found.'));
    }

    return res.status(200).json(formatResponse(true, doc));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getHistory,
  getDocument
};
