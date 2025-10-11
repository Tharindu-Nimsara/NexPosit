import bcrypt from "bcrypt";
import {
  createUser,
  findUserByEmail,
  emailExists,
} from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";
import {
  isValidEmail,
  isValidPassword,
  isValidName,
} from "../utils/validators.js";

// Register new user
export const register = async (req, res) => {
  try {
    const { email, password, full_name, timezone } = req.body;

    // Validate input
    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        error: "Email, password, and full name are required",
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        error:
          "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number",
      });
    }

    // Validate name
    if (!isValidName(full_name)) {
      return res.status(400).json({
        success: false,
        error: "Full name is required",
      });
    }

    // Check if user already exists
    const userExists = await emailExists(email);
    if (userExists) {
      return res.status(409).json({
        success: false,
        error: "Email already registered",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await createUser(
      email,
      passwordHash,
      full_name,
      timezone || "UTC"
    );

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    // Return user data (without password hash)
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          timezone: user.timezone,
          created_at: user.created_at,
          is_google_user: user.is_google_user || false,
          profile_picture: user.profile_picture || null,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to register user",
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    // Return user data (without password hash)
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          timezone: user.timezone,
          created_at: user.created_at,
          is_google_user: user.is_google_user || false,
          profile_picture: user.profile_picture || null,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to login",
    });
  }
};

// Get current user info
export const getMe = async (req, res) => {
  try {
    // req.user is set by auth middleware
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user info",
    });
  }
};
