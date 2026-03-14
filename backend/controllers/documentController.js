const { ingestDocument } = require('../services/ragProxyService');
const Document = require('../models/Document'); // Using Mongoose Model directly here to simplify updates later
const { getDocumentHistoryByUser, getDocumentById } = require('../repositories/documentRepository');
const { formatResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');
const fs = require('fs');

/**
 * Upload a PDF/DOCX, ingest it into the RAG microservice, save a record to MongoDB.
 * Note: Full Analytics to Snowflake happens later when /analyze is called.
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

    // 2. Save base document record in MongoDB (will be updated after /analyze)
    const docRecord = new Document({
      userId,
      fileUrl: filename,
      originalName: originalname,
      documentId: ragResult.document_id,  // RAG microservice ID
      numChunks: ragResult.num_chunks,
      documentType: 'Pending Analysis',
      analyzed: false
    });

    const savedDoc = await docRecord.save();

    logger.info(`Document uploaded and ingested: ${ragResult.document_id} for user ${userId}`);

    return res.status(200).json(formatResponse(true, {
      id: savedDoc._id,
      documentId: ragResult.document_id,
      filename: originalname,
      numChunks: ragResult.num_chunks,
      message: ragResult.message
    }));

  } catch (error) {
    next(error);
  } finally {
    // Attempt to clean up the local temp upload since RAG has processed it
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err) logger.warn(`Could not delete temp file ${req.file.path}: ${err}`);
      });
    }
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
