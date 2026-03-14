require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/mongodb');
const { initSnowflake } = require('./config/snowflake');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// Handle unhandled promise rejections (e.g. MongoDB post-connect errors) gracefully
// without crashing the process
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason?.message || reason}`);
  // Do NOT exit — keep serving RAG endpoints even if MongoDB is unavailable
});

// Handle uncaught exceptions gracefully
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  // Do NOT exit
});

connectDB();
initSnowflake();

app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
