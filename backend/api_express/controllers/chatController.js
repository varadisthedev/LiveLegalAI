const chatService = require('../services/chatService');
const { formatResponse } = require('../utils/responseFormatter');

/**
 * Analyze a previously ingested document via the RAG microservice
 */
const analyzeDoc = async (req, res, next) => {
  try {
    const { document_id, query } = req.body;
    const result = await chatService.analyzeDoc(req.userId, document_id, query);
    return res.status(200).json(formatResponse(true, result));
  } catch (error) {
    next(error);
  }
};

/**
 * Chat interactively with a document via the RAG microservice
 */
const chatWithDoc = async (req, res, next) => {
  try {
    const { document_id, question } = req.body;
    const result = await chatService.chatWithDoc(req.userId, document_id, question);
    return res.status(200).json(formatResponse(true, result));
  } catch (error) {
    next(error);
  }
};

/**
 * Get unified chat history
 */
const getHistory = async (req, res, next) => {
  try {
    const history = await chatService.getHistory(req.userId);
    return res.status(200).json(formatResponse(true, history));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeDoc,
  chatWithDoc,
  getHistory,
};
