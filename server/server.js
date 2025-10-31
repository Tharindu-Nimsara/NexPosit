import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import "./config/passport.js"; // Import passport configuration
import { testConnection } from "./utils/supabase.js";
import authRoutes from "./routes/auth.routes.js";
import googleAuthRoutes from "./routes/google-auth.routes.js"; // Add Google auth routes
import contextRoutes from "./routes/context.routes.js";
import projectRoutes from "./routes/project.routes.js";
import postRoutes from "./routes/post.routes.js";
import publicRoutes from "./routes/public.routes.js";
import passwordResetRoutes from "./routes/passwordReset.routes.js";
// import upcomingPostsRoutes from "./routes/upcomingPosts.routes.js";
// import publicUpcomingPostsRoutes from "./routes/publicUpcomingPosts.routes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE (Order matters!) =====

// 1. CORS - MUST come first, before any routes

//app.use(cors()); // Allows all origins for development only
app.use(
  cors({
    origin: process.env.CLIENT_URL
      ? [
          process.env.CLIENT_URL,
          "http://localhost:5173",
          "http://localhost:5174",
          // Add External sites that will consume the API
        ]
      : [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:3000",
        ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 2. Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Initialize Passport (for Google OAuth)
app.use(passport.initialize());

// ===== ROUTES =====

// Basic route for testing
app.get("/", (req, res) => {
  res.json({
    message: "Social Post Planner API",
    status: "running",
    version: "1.0.0",
  });
});

// Health check route

// Simple health check for cron-job.org (minimal response)
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Detailed health check (use this for debugging, not for cron jobs)
app.get("/api/health/detailed", async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: "ok",
    database: dbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Public routes (no authentication required)
app.use("/api/public", publicRoutes);

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuthRoutes); // Google OAuth routes

app.use("/api/auth", passwordResetRoutes); //password reset

// Protected API Routes (authentication required)
app.use("/api/contexts", contextRoutes);
app.use("/api", projectRoutes);
app.use("/api", postRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// API to retrieve upcoming posts
// app.use("/api", upcomingPostsRoutes);
// app.use("/api/public", publicUpcomingPostsRoutes);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🔐 Google OAuth: ${
      process.env.GOOGLE_CLIENT_ID ? "Configured" : "Not configured"
    }`
  );
  await testConnection();
});
