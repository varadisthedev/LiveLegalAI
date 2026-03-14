const mongoose = require('mongoose');

/**
 * Chat Model — MongoDB
 * 
 * Stores every chatbot interaction for a user.
 * Each chat is linked to a specific document via documentId
 * so the frontend can show chat history per document.
 */
const chatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  documentId: {
    type: String,
    required: true,
    index: true
  },
  question: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  responseType: {
    type: String,
    enum: ['analysis', 'rag_chat', 'voice_rag'],
    default: 'rag_chat'
  },
  voiceEnabled: {
    type: Boolean,
    default: false
  },
  sourcesUsed: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Compound index for fast "get chat history for this document by this user"
chatSchema.index({ userId: 1, documentId: 1, createdAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
