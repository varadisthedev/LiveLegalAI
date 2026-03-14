const { formatResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Global centralized error handler
 */
const errorHandler = (err, req, res, next) => {
  logger.error("Caught Exception:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json(formatResponse(false, null, message));
};

module.exports = {
  errorHandler
};
