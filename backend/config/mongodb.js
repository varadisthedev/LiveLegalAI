const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      family: 4,  // Force IPv4 — fixes querySrv ETIMEOUT on many Windows/ISP setups
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    logger.warn('Server will continue without MongoDB. History endpoints will fail until DB is reachable.');
    // Don't exit — let the server continue so RAG endpoints still work
  }
};

module.exports = connectDB;
