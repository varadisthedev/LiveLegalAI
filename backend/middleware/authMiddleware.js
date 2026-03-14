const { formatResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Middleware to ensure the request has an attached user ID.
 * This backend expects the frontend to handle authentication and securely pass the validated user ID.
 */
const requireAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'] || req.body.userId || req.query.userId;
  
  if (!userId) {
    logger.warn('Unauthorized request: No x-user-id header provided');
    return res.status(401).json(formatResponse(false, null, 'Unauthorized Component. Missing user identifier.'));
  }
  
  // Attach user ID for controllers
  req.userId = userId;
  next();
};

const attachUserId = (req, res, next) => {
  // Now merged into requireAuth for simplicity, but kept for compatibility
  // if you want to explicitly declare both in route chains
  next();
};

module.exports = {
  requireAuth,
  attachUserId
};
