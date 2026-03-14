const Document = require('../models/Document');

/**
 * Insert a document history record into MongoDB
 * @param {object} docRecord 
 */
const saveDocumentHistory = async (docRecord) => {
  const doc = new Document(docRecord);
  const savedDoc = await doc.save();
  return savedDoc._id.toString();
};

/**
 * Get all document history for a user from MongoDB
 * @param {string} userId 
 */
const getDocumentHistoryByUser = async (userId) => {
  const docs = await Document.find({ userId }).sort({ createdAt: -1 });
  return docs;
};

/**
 * Get specific document by ID from MongoDB
 * @param {string} id 
 * @param {string} userId 
 */
const getDocumentById = async (id, userId) => {
  const doc = await Document.findOne({ _id: id, userId });
  return doc;
};

module.exports = {
  saveDocumentHistory,
  getDocumentHistoryByUser,
  getDocumentById
};
