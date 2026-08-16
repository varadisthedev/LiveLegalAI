const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimitMiddleware");
const {
  validateRegister,
  validateLogin,
  validateGoogleAuth,
} = require("../validators/authValidator");
const { register, login, googleAuth, getMe } = require("../controllers/authController");

// Public — credential + OAuth entry points, rate-limited against brute force
router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);
router.post("/google", authLimiter, validateGoogleAuth, googleAuth);

// Authenticated — current user identity
router.get("/me", requireAuth, getMe);

module.exports = router;
