require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const { globalLimiter } = require("./middleware/rateLimitMiddleware");
const { errorHandler } = require("./middleware/errorMiddleware");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const { getHealth } = require("./controllers/healthController");

// Routes
const documentRoutes = require("./routes/documentRoutes");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

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

// Health check is registered before the rate limiter and CORS: it's a system
// endpoint (Docker healthcheck, depends_on gating, uptime monitors), not user
// traffic, and must stay reachable even if a client is being rate-limited.
app.get("/health", getHealth);

app.use(globalLimiter);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/document", documentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);

// Base route
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "AI Legal Agent API is running" });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
