const { formatResponse } = require('../utils/responseFormatter');

// Matches the document_id formats this backend and the RAG service generate
// (`doc_<12 hex chars>`). Requiring a plain safe-charset string here blocks
// two attack classes in one check: NoSQL operator injection into the
// documentId-keyed Mongo lookups (e.g. body `{ "document_id": { "$ne": null } }`
// would otherwise reach Document.findOne({ documentId: {$ne: null}, ... })
// unfiltered) and path traversal once document_id is forwarded to the RAG
// service's filesystem-backed FAISS store.
const DOCUMENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

const validateDocumentId = (req, res, next) => {
  const { document_id } = req.body;
  if (typeof document_id !== 'string' || !DOCUMENT_ID_PATTERN.test(document_id)) {
    return res.status(400).json(formatResponse(false, null, "A valid document_id is required."));
  }
  next();
};

const validateChat = (req, res, next) => {
  if (typeof req.body.question !== 'string' || !req.body.question.trim()) {
    return res.status(400).json(formatResponse(false, null, "Question is required."));
  }

  if (req.body.responseStyle && !['brief', 'detailed', 'bullet_points'].includes(req.body.responseStyle)) {
    return res.status(400).json(formatResponse(false, null, "Invalid response style. Must be 'brief', 'detailed', or 'bullet_points'."));
  }

  next();
};

module.exports = {
  validateDocumentId,
  validateChat
};
