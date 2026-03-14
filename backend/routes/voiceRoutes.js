const express = require('express');
const router = express.Router();
const { requireAuth, attachUserId } = require('../middleware/authMiddleware');
const { processVoiceChat, processTextToSpeech } = require('../controllers/voiceController');
const { heavyOpLimiter } = require('../middleware/rateLimitMiddleware');
const { validateChat } = require('../validators/chatValidator');

// Authenticated Routes
router.use(requireAuth, attachUserId);

// POST /api/voice/chat (Contextual RAG Voice Chat)
router.post('/chat', heavyOpLimiter, validateChat, processVoiceChat);

// POST /api/voice/speak (Generic Text-to-Speech for Site Navigator)
router.post('/speak', heavyOpLimiter, processTextToSpeech);

module.exports = router;
