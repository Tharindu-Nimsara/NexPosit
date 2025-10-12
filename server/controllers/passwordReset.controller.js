import crypto from "crypto";
import bcrypt from "bcrypt";
import {
  findUserByEmail,
  setPasswordResetToken,
  findUserByResetToken,
  clearPasswordResetToken,
  updatePassword,
} from "../models/user.model.js";
import { sendPasswordResetEmail } from "../services/email.service.js";
import { isValidEmail, isValidPassword } from "../utils/validators.js";

// Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Valid email is required",
      });
    }

    // Find user
    const user = await findUserByEmail(email);

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      console.log(
        `⚠️ Password reset requested for non-existent email: ${email}`
      );
      return res.json({
        success: true,
        message:
          "If an account exists with that email, a password reset link has been sent.",
      });
    }

    // Check if user is a Google user
    if (user.is_google_user) {
      return res.status(400).json({
        success: false,
        error: "This account uses Google Sign-In. Please sign in with Google.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires in 1 hour
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Save token to database
    await setPasswordResetToken(user.id, hashedToken, expires);

    // Send email
    try {
      await sendPasswordResetEmail(email, resetToken, user.full_name);
      console.log(`✅ Password reset email sent to: ${email}`);
    } catch (emailError) {
      console.error("❌ Failed to send email:", emailError);

      // In development mode, still return success since we log to console
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log(
          "ℹ️ Running in development mode - check console for reset link"
        );
        return res.json({
          success: true,
          message:
            "Password reset link generated. Check server console for the link.",
          devMode: true,
        });
      }

      return res.status(500).json({
        success: false,
        error: "Failed to send password reset email. Please try again later.",
      });
    }

    res.json({
      success: true,
      message:
        "If an account exists with that email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Request password reset error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process password reset request",
    });
  }
};

// Verify reset token
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Reset token is required",
      });
    }

    // Hash the token to compare with database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user by token
    const user = await findUserByResetToken(hashedToken);

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired reset token",
      });
    }

    // Check if token has expired
    if (new Date(user.password_reset_expires) < new Date()) {
      return res.status(400).json({
        success: false,
        error: "Reset token has expired. Please request a new one.",
      });
    }

    res.json({
      success: true,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Verify reset token error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify reset token",
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Validate inputs
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: "Token and new password are required",
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

    // Hash the token to compare with database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user by token
    const user = await findUserByResetToken(hashedToken);

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired reset token",
      });
    }

    // Check if token has expired
    if (new Date(user.password_reset_expires) < new Date()) {
      return res.status(400).json({
        success: false,
        error: "Reset token has expired. Please request a new one.",
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password
    await updatePassword(user.id, passwordHash);

    // Clear reset token
    await clearPasswordResetToken(user.id);

    console.log(`✅ Password reset successful for: ${user.email}`);

    res.json({
      success: true,
      message:
        "Password has been reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reset password",
    });
  }
};
