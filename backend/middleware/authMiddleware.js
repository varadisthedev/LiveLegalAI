const jwt = require("jsonwebtoken");
const { formatResponse } = require("../utils/responseFormatter");
const logger = require("../utils/logger");

/**
 * Middleware to verify a bearer JWT and attach the decoded user ID to the request.
 * Tokens are issued by /api/auth/register, /login, and /google (see authController).
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"] || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    logger.warn("Unauthorized request: missing or malformed Authorization header");
    return res.status(401).json(formatResponse(false, null, "Unauthorized. Missing access token."));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.sub;
    next();
  } catch (err) {
    logger.warn(`Unauthorized request: invalid or expired token (${err.message})`);
    return res.status(401).json(formatResponse(false, null, "Unauthorized. Invalid or expired session."));
  }
};

const attachUserId = (req, res, next) => {
  // Kept for compatibility with route chains that declare both explicitly.
  // requireAuth already sets req.userId.
  next();
};

module.exports = {
  requireAuth,
  attachUserId,
};
