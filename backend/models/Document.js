const mongoose = require('mongoose');

/**
 * Document Model — MongoDB
 * 
 * Stores metadata about every uploaded legal document.
 * The actual text and vectors live in FAISS (RAG service).
 * MongoDB stores the *results* of ingestion and analysis for
 * the frontend to query (history, dashboard, etc.).
 */
const documentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },

  // --- File info ---
  fileUrl: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },

  // --- RAG service identifiers ---
  documentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  numChunks: {
    type: Number,
    default: 0
  },

  // --- Analysis results (populated after /analyze is called) ---
  analyzed: {
    type: Boolean,
    default: false
  },
  documentType: {
    type: String,
    default: 'Pending Analysis'
  },
  summary: {
    type: String,
    default: ''
  },
  explanation: {
    type: String,
    default: ''
  },
  suggestedReply: {
    type: String,
    default: ''
  },

  // --- Severity / risk scoring ---
  severityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Moderate', 'High', 'Unknown'],
    default: 'Unknown'
  },
  riskFactors: [{
    label: String,
    points: Number,
    category: String
  }],
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
