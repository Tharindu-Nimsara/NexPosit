import express from "express";
import {
  create,
  getUserContextsList,
  getContext,
  joinContext,
  joinContextById,
  getMembers,
  updateMemberRole,
  removeMember,
  regenerateCode,
} from "../controllers/context.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Context routes
router.post("/", create); // Create context
router.get("/", getUserContextsList); // Get user's contexts
router.get("/:id", getContext); // Get single context
router.post("/join/:code", joinContext); // Join via invite code
router.post("/:id/join", joinContextById); // Join via context ID
router.get("/:id/members", getMembers); // Get context members
router.patch("/:id/members/:userId/role", updateMemberRole); // Update member role - ADD /role HERE
router.delete("/:id/members/:userId", removeMember); // Remove member
router.post("/:id/regenerate-invite", regenerateCode); // Regenerate invite code

export default router;
