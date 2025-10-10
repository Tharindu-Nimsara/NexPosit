import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection } from "./utils/supabase.js";
import authRoutes from "./routes/auth.routes.js";
import contextRoutes from "./routes/context.routes.js";
import projectRoutes from "./routes/project.routes.js";
import postRoutes from "./routes/post.routes.js";
import publicRoutes from "./routes/public.routes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE (Order matters!) =====

// 1. CORS - MUST come first, before any routes
app.use(
  cors({
    origin: process.env.CLIENT_URL
      ? [
          process.env.CLIENT_URL,
          "http://localhost:5173",
          "http://localhost:5174",
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
app.get("/api/health", async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: "ok",
    database: dbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Public routes (no authentication required)
app.use("/api/public", publicRoutes);

// Protected API Routes (authentication required)
app.use("/api/auth", authRoutes);
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

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  await testConnection();
});
