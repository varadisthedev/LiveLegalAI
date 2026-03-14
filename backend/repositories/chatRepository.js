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

module.exports = {
  saveChatHistory,
  getChatHistoryByUser
};
