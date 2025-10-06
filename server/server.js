import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection } from "./utils/supabase.js";
import authRoutes from "./routes/auth.routes.js";
import contextRoutes from "./routes/context.routes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/contexts", contextRoutes);

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
