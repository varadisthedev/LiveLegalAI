const rateLimit = require('express-rate-limit');
const { formatResponse } = require('../utils/responseFormatter');

// Global limiter: 300 requests per 15 min per real IP (trust proxy is set in app.js)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: formatResponse(false, null, 'Too many requests, please try again later.'),
});

// Heavy op limiter: keyed by x-user-id so each USER gets their own 30/hour bucket.
// Without this, all requests through Railway share the same proxy IP and exhaust a
// single shared bucket — causing everyone to get 429 even on their first request.
const heavyOpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 30,                     // 30 expensive ops per user per hour
  keyGenerator: (req) => {
    // Use the authenticated user ID from the header as the rate-limit key.
    // Falls back to IP only if there is no user header.
    return req.headers['x-user-id'] || req.ip;
  },
  message: formatResponse(false, null, 'You have reached the limit for heavy operations (30/hour). Please try again later.'),
});

module.exports = {
  globalLimiter,
  heavyOpLimiter,
};
