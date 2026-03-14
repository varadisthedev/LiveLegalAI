const Document = require('../models/Document');
const Chat = require('../models/Chat');
const { formatResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Get aggregated profile info for a user.
 * Helps the frontend build a dashboard profile section.
 */
const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Fetch all documents and chats for quick aggregation
    const docs = await Document.find({ userId });
    const chats = await Chat.countDocuments({ userId });

    const totalDocuments = docs.length;
    let highRiskCount = 0;
    let moderateRiskCount = 0;
    let lowRiskCount = 0;

    docs.forEach(doc => {
      if (doc.riskLevel === 'High') highRiskCount++;
      else if (doc.riskLevel === 'Moderate') moderateRiskCount++;
      else if (doc.riskLevel === 'Low') lowRiskCount++;
    });

    const profileData = {
      userId,
      totalDocuments,
      totalChats: chats,
      riskBreakdown: {
        high: highRiskCount,
        moderate: moderateRiskCount,
        low: lowRiskCount
      },
      memberSince: docs.length > 0 ? docs[docs.length - 1].createdAt : new Date()
    };

    logger.info(`Fetched user profile for ${userId}`);
    return res.status(200).json(formatResponse(true, profileData));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile
};
