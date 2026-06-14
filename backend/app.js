require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const { globalLimiter } = require("./middleware/rateLimitMiddleware");
const { errorHandler } = require("./middleware/errorMiddleware");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

// Routes
const documentRoutes = require("./routes/documentRoutes");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Serve Swagger UI documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Trust Railway/Vercel reverse proxy so req.ip is the real client IP
app.set("trust proxy", 1);

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));
app.use(globalLimiter);
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-user-id", "Authorization"],
  }),
);
// API Routes
app.use("/api/document", documentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);

// health route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Legal Agent API is healthy [express]",
  });
});

// Base route
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "AI Legal Agent API is running" });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
