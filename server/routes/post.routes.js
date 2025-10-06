import express from "express";
import {
  create,
  getContextPosts,
  getProjectPosts,
  getPost,
  update,
  remove,
  approve,
} from "../controllers/post.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Post routes
router.post("/projects/:projectId/posts", create); // Create post
router.get("/contexts/:contextId/posts", getContextPosts); // Get context posts (main grid)
router.get("/projects/:projectId/posts", getProjectPosts); // Get project posts
router.get("/posts/:id", getPost); // Get single post
router.patch("/posts/:id", update); // Update post
router.delete("/posts/:id", remove); // Delete post
router.patch("/posts/:id/approve", approve); // Approve post

export default router;
