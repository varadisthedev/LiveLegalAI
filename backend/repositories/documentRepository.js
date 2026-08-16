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
 * Create and persist a new document record, returning the full document.
 * @param {object} docData
 */
const createDocument = async (docData) => {
  const doc = new Document(docData);
  return doc.save();
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
 * Get specific document by Mongo _id, scoped to its owner
 * @param {string} id
 * @param {string} userId
 */
const getDocumentById = async (id, userId) => {
  const doc = await Document.findOne({ _id: id, userId });
  return doc;
};

/**
 * Get a document by its RAG-service documentId, regardless of owner.
 * Used by the RAG proxy layer, which only ever has the documentId.
 * @param {string} documentId
 */
const findDocumentByDocumentId = async (documentId) => Document.findOne({ documentId });

/**
 * Get a document by its RAG-service documentId, scoped to its owner.
 * @param {string} documentId
 * @param {string} userId
 */
const findDocumentByDocumentIdForUser = async (documentId, userId) =>
  Document.findOne({ documentId, userId });

/**
 * Apply a partial update to a document, keyed by its RAG-service documentId.
 * @param {string} documentId
 * @param {object} updateFields
 */
const updateDocumentByDocumentId = async (documentId, updateFields) =>
  Document.updateOne({ documentId }, updateFields);

/**
 * Delete a document by its Mongo _id.
 * @param {string} id
 */
const deleteDocumentByMongoId = async (id) => Document.deleteOne({ _id: id });

module.exports = {
  saveDocumentHistory,
  createDocument,
  getDocumentHistoryByUser,
  getDocumentById,
  findDocumentByDocumentId,
  findDocumentByDocumentIdForUser,
  updateDocumentByDocumentId,
  deleteDocumentByMongoId,
};
