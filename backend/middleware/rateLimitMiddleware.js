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

// Heavy op limiter: keyed by the authenticated user (set by requireAuth) so each
// USER gets their own 30/hour bucket. Without this, all requests through Railway
// share the same proxy IP and exhaust a single shared bucket — causing everyone
// to get 429 even on their first request.
const heavyOpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 30,                     // 30 expensive ops per user per hour
  keyGenerator: (req) => {
    // req.userId is set by requireAuth after verifying the JWT.
    // Falls back to IP only if somehow unset.
    return req.userId || req.ip;
  },
  message: formatResponse(false, null, 'You have reached the limit for heavy operations (30/hour). Please try again later.'),
});

// Auth limiter: protects register/login/google against brute force.
// Keyed by IP since there is no authenticated user yet at this point.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: formatResponse(false, null, 'Too many auth attempts, please try again later.'),
});

module.exports = {
  globalLimiter,
  heavyOpLimiter,
  authLimiter,
};
