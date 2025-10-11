import express from "express";
import passport from "../config/passport.js";
import { generateToken } from "../utils/jwt.js";

const router = express.Router();

// Initiate Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${
      process.env.CLIENT_URL || "http://localhost:5173"
    }/login?error=google_auth_failed`,
  }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = generateToken(req.user.id, req.user.email);

      // Redirect to frontend with token
      res.redirect(
        `${
          process.env.CLIENT_URL || "http://localhost:5173"
        }/auth/callback?token=${token}`
      );
    } catch (error) {
      console.error("Google callback error:", error);
      res.redirect(
        `${
          process.env.CLIENT_URL || "http://localhost:5173"
        }/login?error=auth_failed`
      );
    }
  }
);

export default router;
