const { analyzeDocument, chatWithDocument } = require('../services/ragProxyService');
const { saveChatHistory, getChatHistoryByUser } = require('../repositories/chatRepository');
const { formatResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Analyze a previously ingested document via the RAG microservice
 * Returns a full AI-generated legal analysis (summary, explanation, suggested reply, severity score)
 */
const analyzeDoc = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { document_id, query } = req.body;

    if (!document_id) {
      return res.status(400).json(formatResponse(false, null, 'document_id is required.'));
    }

    const result = await analyzeDocument(document_id, query);

    // Save as a chat record in MongoDB for history
    await saveChatHistory({
      userId,
      question: query || 'Summarise this legal document and explain the key obligations.',
      response: `Summary: ${result.summary}\n\nExplanation: ${result.explanation}\n\nSuggested Reply: ${result.suggested_reply}`,
      responseType: 'analysis',
      voiceEnabled: false
    });

    logger.info(`Document analyzed: ${document_id} for user ${userId}`);
    return res.status(200).json(formatResponse(true, result));

  } catch (error) {
    next(error);
  }
};

/**
 * Chat with a previously ingested document via the RAG microservice
 */
const chatWithDoc = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { document_id, question } = req.body;

    if (!document_id || !question) {
      return res.status(400).json(formatResponse(false, null, 'document_id and question are both required.'));
    }

    const result = await chatWithDocument(document_id, question);

    // Save to chat history
    await saveChatHistory({
      userId,
      question,
      response: result.answer,
      responseType: 'rag_chat',
      voiceEnabled: false
    });

    logger.info(`Chat answered for document: ${document_id}, user: ${userId}`);
    return res.status(200).json(formatResponse(true, result));

  } catch (error) {
    next(error);
  }
};

/**
 * Get user chat history
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
