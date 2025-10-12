import express from "express";
import {
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
} from "../controllers/passwordReset.controller.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/forgot-password", requestPasswordReset);
router.post("/verify-reset-token", verifyResetToken);
router.post("/reset-password", resetPassword);

export default router;
