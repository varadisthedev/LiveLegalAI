const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  question: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  responseType: {
    type: String,
    enum: ['brief', 'detailed', 'bullet_points'],
    default: 'detailed'
  },
  voiceEnabled: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
