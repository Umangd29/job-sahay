
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Configure allowed frontend origins.
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .map((origin) => origin.trim().replace(/\/$/, ""));

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header, such as curl
      // and server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      const error = new Error("Origin not allowed by CORS");
      error.status = 403;

      return callback(error);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Common middleware
app.use(cookieParser());

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "AI Job Tracker API is operational",
    timestamp: new Date().toISOString(),
  });
});

// API routes
const authRoute = require("./routes/auth.route");
const applicationRoute = require("./routes/application.route");

app.use("/api/auth", authRoute);
app.use("/api/applications", applicationRoute);

// Handle unknown routes
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Malformed JSON request
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    Object.prototype.hasOwnProperty.call(err, "body")
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body",
    });
  }

  const statusCode = Number.isInteger(err.status)
    ? err.status
    : 500;

  // Log the full error on the server, not in the client response.
  console.error("Application error:", err);

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error"
        : err.message || "Request failed",
  });
});

module.exports = app;
