const { analyzeDocument, chatWithDocument } = require('../services/ragProxyService');
const { saveChatHistory, getChatHistoryByUser } = require('../repositories/chatRepository');
const Document = require('../models/Document');
const { formatResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Analyze a previously ingested document via the RAG microservice
 * Returns a full AI-generated legal analysis and updates Mongo + Snowflake DBs.
 */
const analyzeDoc = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { document_id, query } = req.body;

    if (!document_id) {
      return res.status(400).json(formatResponse(false, null, 'document_id is required.'));
    }

    // 1. Send analysis request to RAG microservice
    const result = await analyzeDocument(document_id, query);

    // 2. Locate the parent MongoDB Document to update and extract filename
    const docMongo = await Document.findOne({ documentId: document_id, userId });
    
    if (docMongo) {
      // 3. Update the MongoDB Document with the brilliant analysis from Gemini
      docMongo.analyzed = true;
      docMongo.documentType = result.document_type || 'Legal Notice';
      docMongo.summary = result.summary;
      docMongo.explanation = result.explanation;
      docMongo.suggestedReply = result.suggested_reply;
      docMongo.severityScore = result.severity_score;
      docMongo.riskLevel = result.risk_level;
      docMongo.riskFactors = result.risk_factors || [];
      await docMongo.save();
    }

    // 5. Save as a chat record in MongoDB for user history
    await saveChatHistory({
      userId,
      documentId: document_id, // Important linkage
      question: query || 'Analyze this legal document to provide a summary and key obligations.',
      response: `Summary: ${result.summary}\n\nExplanation: ${result.explanation}\n\nSuggested Reply: ${result.suggested_reply}`,
      responseType: 'analysis',
      voiceEnabled: false,
      sourcesUsed: 0 // Default, /analyze doesn't explictly return source chunks in the same way
    });

    logger.info(`Document fully analyzed: ${document_id} for user ${userId}`);
    return res.status(200).json(formatResponse(true, result));

  } catch (error) {
    // FAISS index was wiped by a container restart — user needs to re-upload
    if (error.message === 'DOCUMENT_INDEX_EXPIRED') {
      return res.status(404).json(formatResponse(false, null,
        'This document\'s index has expired (server was restarted). Please re-upload the document to analyse it again.'
      ));
    }
    next(error);
  }
};

/**
 * Chat interactively with a document via the RAG microservice
 */
const chatWithDoc = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { document_id, question } = req.body;

    if (!document_id || !question) {
      return res.status(400).json(formatResponse(false, null, 'document_id and question are both required.'));
    }

    // Hit RAG wrapper
    const result = await chatWithDocument(document_id, question);

    // Save MongoDB Chat record
    await saveChatHistory({
      userId,
      documentId: document_id, // Critical for UI history threading
      question,
      response: result.answer,
      responseType: 'rag_chat',
      voiceEnabled: false,
      sourcesUsed: result.sources_used || 0
    });

    logger.info(`Chat answered for document: ${document_id}, user: ${userId}`);
    return res.status(200).json(formatResponse(true, result));

  } catch (error) {
    if (error.message === 'DOCUMENT_INDEX_EXPIRED') {
      return res.status(404).json(formatResponse(false, null,
        'This document\'s index has expired (server was restarted). Please re-upload the document to continue chatting.'
      ));
    }
    next(error);
  }
};

/**
 * Get unified chat history
 */
const getHistory = async (req, res, next) => {
  try {
    const userId = req.userId;
    const history = await getChatHistoryByUser(userId);
    return res.status(200).json(formatResponse(true, history));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeDoc,
  chatWithDoc,
  getHistory
};
