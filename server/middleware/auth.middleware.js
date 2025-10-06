import { verifyToken } from "../utils/jwt.js";
import { findUserById } from "../models/user.model.js";

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Not authorized, no token provided",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    // Attach user to request object
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.message === "Token expired") {
      return res.status(401).json({
        success: false,
        error: "Token expired, please login again",
      });
    }

    if (error.message === "Invalid token") {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    res.status(401).json({
      success: false,
      error: "Not authorized",
    });
  }
};
