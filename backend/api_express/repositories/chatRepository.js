const Chat = require('../models/Chat');

/**
 * Insert a chat history record into MongoDB
 * @param {object} chatRecord
 */
const saveChatHistory = async (chatRecord) => {
  const chat = new Chat(chatRecord);
  const savedChat = await chat.save();
  return savedChat._id.toString();
};

/**
 * Get all chat history for a specific user from MongoDB
 * @param {string} userId
 */
const getChatHistoryByUser = async (userId) => {
  const history = await Chat.find({ userId }).sort({ createdAt: -1 });
  return history;
};

/**
 * Delete every chat record a user has against a specific document.
 * @param {string} userId
 * @param {string} documentId
 */
const deleteChatsByUserAndDocument = async (userId, documentId) =>
  Chat.deleteMany({ userId, documentId });

/**
 * Count how many chat records a user has, for profile aggregation.
 * @param {string} userId
 */
const countChatsByUser = async (userId) => Chat.countDocuments({ userId });

module.exports = {
  saveChatHistory,
  getChatHistoryByUser,
  deleteChatsByUserAndDocument,
  countChatsByUser,
};
