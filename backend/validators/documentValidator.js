const { formatResponse } = require('../utils/responseFormatter');

const validateDocumentUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json(formatResponse(false, null, "No document file provided. Please attach an image or PDF."));
  }
  next();
};

module.exports = {
  validateDocumentUpload
};
