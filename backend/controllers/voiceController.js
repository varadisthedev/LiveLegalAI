const { chatWithDocument } = require('../services/ragProxyService');
const { generateAudioStream } = require('../services/voiceService');
const { saveChatHistory } = require('../repositories/chatRepository');
const { formatResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Voice Chat: Gets an answer from the RAG microservice for a document, then converts it to audio via ElevenLabs.
 * Requires both document_id and question in the request body.
 */
const processVoiceChat = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { document_id, question } = req.body;

    if (!document_id || !question) {
      return res.status(400).json(formatResponse(false, null, 'document_id and question are both required.'));
    }

    // 1. Get a text answer from the RAG microservice
    const ragResult = await chatWithDocument(document_id, question);
    const textAnswer = ragResult.answer;

    // 2. Convert text to audio via ElevenLabs
    const audioStream = await generateAudioStream(textAnswer);

    // 3. Save to Chat History
    await saveChatHistory({
      userId,
      documentId: document_id,
      question,
      response: textAnswer,
      responseType: 'voice_rag',
      voiceEnabled: true,
      sourcesUsed: ragResult.sources_used || 0
    });

    // 4. Stream audio back to client
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('X-Text-Answer', Buffer.from(textAnswer).toString('base64'));

    logger.info(`Voice chat answered for document: ${document_id}, user: ${userId}`);

    audioStream.pipe(res);

  } catch (error) {
    next(error);
  }
};

/**
 * Generic Text-to-Speech: Takes any text and converts it to audio via ElevenLabs.
 * Useful for the AI site navigator.
 */
const processTextToSpeech = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json(formatResponse(false, null, 'text is required.'));
    }

    // Convert text to audio
    const audioStream = await generateAudioStream(text);

    // Stream audio back to client
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');

    logger.info(`Generic Voice TTS generated: ${text.substring(0, 30)}...`);

    audioStream.pipe(res);

  } catch (error) {
    next(error);
  }
};

module.exports = {
  processVoiceChat,
  processTextToSpeech
};
