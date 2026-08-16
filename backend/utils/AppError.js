/**
 * Error carrying an HTTP status code, read by middleware/errorMiddleware.js
 * to shape the response. Lets services signal "expected" failures (bad
 * input, not found, conflict) without touching res/req directly.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
