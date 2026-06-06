const express = require("express");
const router = express.Router();
const { requireAuth, attachUserId } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  uploadDocument,
  getHistory,
  getDocument,
  deleteDocument,
  downloadReport,
} = require("../controllers/documentController");
const { heavyOpLimiter } = require("../middleware/rateLimitMiddleware");
const { validateDocumentUpload } = require("../validators/documentValidator");

// Authenticated Routes
router.use(requireAuth, attachUserId);

// POST /api/document/upload
router.post(
  "/upload",
  heavyOpLimiter,
  upload.single("document"),
  validateDocumentUpload,
  uploadDocument,
);

// GET /api/document/history
router.get("/history", getHistory);

// GET /api/document/:id
router.get("/:id", getDocument);

// DELETE /api/document/:id
router.delete("/:id", heavyOpLimiter, deleteDocument);

// GET /api/document/:id/report - download analysis PDF
router.get("/:id/report", downloadReport);

module.exports = router;
