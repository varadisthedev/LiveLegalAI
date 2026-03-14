const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  extractedText: String,
  documentType: String,
  sender: String,
  date: String,
  summary: String,
  recommendedActions: [{
    type: String
  }],
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
