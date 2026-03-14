const express = require('express');
const router = express.Router();
const { requireAuth, attachUserId } = require('../middleware/authMiddleware');
const { analyzeDoc, chatWithDoc, getHistory } = require('../controllers/chatController');
const { heavyOpLimiter } = require('../middleware/rateLimitMiddleware');

// All routes require user identification header
router.use(requireAuth, attachUserId);

// POST /api/chat/analyze  — analyze an ingested document (summary, explanation, severity)
router.post('/analyze', heavyOpLimiter, analyzeDoc);

// POST /api/chat/chat     — ask a follow-up question about the document
router.post('/chat', heavyOpLimiter, chatWithDoc);

// GET /api/chat/history
router.get('/history', getHistory);

module.exports = router;
