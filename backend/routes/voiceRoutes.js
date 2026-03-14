const express = require('express');
const router = express.Router();
const { requireAuth, attachUserId } = require('../middleware/authMiddleware');
const { processVoiceChat } = require('../controllers/voiceController');
const { heavyOpLimiter } = require('../middleware/rateLimitMiddleware');
const { validateChat } = require('../validators/chatValidator');

// Authenticated Routes
router.use(requireAuth, attachUserId);

// POST /api/voice/chat
router.post('/chat', heavyOpLimiter, validateChat, processVoiceChat);

module.exports = router;
