const rateLimit = require('express-rate-limit');
const { formatResponse } = require('../utils/responseFormatter');

// Basic rate limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: formatResponse(false, null, "Too many requests, please try again later."),
});

// Stricter rate limiting for heavy operations like Document upload / generation
const heavyOpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 expensive requests per `window`
  message: formatResponse(false, null, "Rate limit exceeded for heavy operations. Please try again later.")
});

module.exports = {
  globalLimiter,
  heavyOpLimiter
};
