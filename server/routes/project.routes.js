import express from "express";
import {
  create,
  getContextProjects,
  getProject,
  update,
  addMember,
  removeMember,
  getMembers,
} from "../controllers/project.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Project routes
router.post("/contexts/:contextId/projects", create); // Create project
router.get("/contexts/:contextId/projects", getContextProjects); // Get context projects
router.get("/projects/:id", getProject); // Get single project
router.patch("/projects/:id", update); // Update project
router.post("/projects/:id/members", addMember); // Add member
router.delete("/projects/:id/members/:userId", removeMember); // Remove member
router.get("/projects/:id/members", getMembers); // Get members

export default router;
