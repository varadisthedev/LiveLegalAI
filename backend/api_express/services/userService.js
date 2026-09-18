const { getDocumentHistoryByUser } = require("../repositories/documentRepository");
const { countChatsByUser } = require("../repositories/chatRepository");
const logger = require("../utils/logger");

/**
 * Aggregated profile info for a user — powers the frontend dashboard.
 */
const getUserProfile = async (userId) => {
  const docs = await getDocumentHistoryByUser(userId);
  const totalChats = await countChatsByUser(userId);

  let highRiskCount = 0;
  let moderateRiskCount = 0;
  let lowRiskCount = 0;

  docs.forEach((doc) => {
    if (doc.riskLevel === "High") highRiskCount++;
    else if (doc.riskLevel === "Moderate") moderateRiskCount++;
    else if (doc.riskLevel === "Low") lowRiskCount++;
  });

  // docs are sorted newest-first, so the last entry is the oldest one
  const profileData = {
    userId,
    totalDocuments: docs.length,
    totalChats,
    riskBreakdown: {
      high: highRiskCount,
      moderate: moderateRiskCount,
      low: lowRiskCount,
    },
    memberSince: docs.length > 0 ? docs[docs.length - 1].createdAt : new Date(),
  };

  logger.info(`Fetched user profile for ${userId}`);
  return profileData;
};

module.exports = {
  getUserProfile,
};
