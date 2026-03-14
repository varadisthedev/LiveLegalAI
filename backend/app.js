require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const { globalLimiter } = require('./middleware/rateLimitMiddleware');
const { errorHandler } = require('./middleware/errorMiddleware');

// Routes
const documentRoutes = require('./routes/documentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const voiceRoutes = require('./routes/voiceRoutes');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging
app.use(globalLimiter);

// Serve uploads statically if needed (for user to view uploaded image later)
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/document', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/voice', voiceRoutes);

// Base route
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: "AI Legal Agent API is running" });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
