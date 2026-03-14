const express = require('express');
const router = express.Router();
const { requireAuth, attachUserId } = require('../middleware/authMiddleware');
const { getUserProfile } = require('../controllers/userController');

// All profile endpoints require user Auth ID
router.use(requireAuth, attachUserId);

// GET /api/user/profile
router.get('/profile', getUserProfile);

module.exports = router;
