const express = require('express');
const router = express.Router();
const { requireAuth, attachUserId } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadDocument, getHistory, getDocument } = require('../controllers/documentController');
const { heavyOpLimiter } = require('../middleware/rateLimitMiddleware');
const { validateDocumentUpload } = require('../validators/documentValidator');

// Authenticated Routes
router.use(requireAuth, attachUserId);

// POST /api/document/upload
router.post('/upload', heavyOpLimiter, upload.single('document'), validateDocumentUpload, uploadDocument);

// GET /api/document/history
router.get('/history', getHistory);

// GET /api/document/:id
router.get('/:id', getDocument);

module.exports = router;
