const AppError = require('../utils/AppError');
const { formatResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Global centralized error handler.
 *
 * Only AppError messages are deliberately user-facing (services throw them
 * for expected conditions like "not found" or "invalid credentials"). Any
 * other error — a Mongoose CastError, a driver error, an unexpected
 * exception — can carry internal implementation details (field names,
 * query shapes, library internals) that shouldn't reach the client, so in
 * production those are masked to a generic message. The full error is
 * always logged server-side either way.
 */
const errorHandler = (err, req, res, next) => {
  logger.error("Caught Exception:", err);

  const statusCode = err.statusCode || 500;
  const isTrusted = err instanceof AppError;
  const message =
    isTrusted || process.env.NODE_ENV !== 'production'
      ? err.message || 'Internal Server Error'
      : 'Internal Server Error';

  res.status(statusCode).json(formatResponse(false, null, message));
};

module.exports = {
  errorHandler
};
