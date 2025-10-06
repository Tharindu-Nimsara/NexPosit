import {
  createPost,
  getPostsByContext,
  getPostsByProject,
  getPostById,
  updatePost,
  deletePost,
  approvePost,
} from "../models/post.model.js";
import { getProjectById, isProjectMember } from "../models/project.model.js";
import { isContextAdmin, isContextMember } from "../models/context.model.js";
import {
  isValidPostTitle,
  isFutureDate,
  isWithin60Days,
} from "../utils/validators.js";

// Create new post
export const create = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, publish_date, publish_time_slot, specific_time } = req.body;
    const userId = req.userId;

    // Get project to check context membership
    const project = await getProjectById(projectId);

    // Check if user is project member OR context admin
    const isMember = await isProjectMember(projectId, userId);
    const isAdmin = await isContextAdmin(project.context_id, userId);

    if (!isMember && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "You must be assigned to this project to create posts",
      });
    }

    // Validate title
    if (!isValidPostTitle(title)) {
      return res.status(400).json({
        success: false,
        error: "Post title must be between 3 and 200 characters",
      });
    }

    // Validate date
    if (!publish_date) {
      return res.status(400).json({
        success: false,
        error: "Publish date is required",
      });
    }

    if (!isFutureDate(publish_date)) {
      return res.status(400).json({
        success: false,
        error: "Publish date cannot be in the past",
      });
    }

    if (!isWithin60Days(publish_date)) {
      return res.status(400).json({
        success: false,
        error: "Publish date cannot be more than 60 days in the future",
      });
    }

    // Validate time
    if (publish_time_slot && specific_time) {
      return res.status(400).json({
        success: false,
        error: "Cannot specify both time slot and specific time",
      });
    }

    if (
      publish_time_slot &&
      !["morning", "noon", "evening"].includes(publish_time_slot)
    ) {
      return res.status(400).json({
        success: false,
        error: "Time slot must be morning, noon, or evening",
      });
    }

    // Create post
    const post = await createPost(
      projectId,
      title,
      publish_date,
      publish_time_slot || null,
      specific_time || null,
      userId
    );

    res.status(201).json({
      success: true,
      data: { post },
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create post",
    });
  }
};

// Get posts in a context (main grid)
export const getContextPosts = async (req, res) => {
  try {
    const { contextId } = req.params;
    const userId = req.userId;

    // Check if user is member
    const membership = await isContextMember(contextId, userId);
    if (!membership) {
      return res.status(403).json({
        success: false,
        error: "You do not have access to this context",
      });
    }

    const posts = await getPostsByContext(contextId);

    res.json({
      success: true,
      data: { posts },
    });
  } catch (error) {
    console.error("Get context posts error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get posts",
    });
  }
};

// Get posts in a project
export const getProjectPosts = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    const project = await getProjectById(projectId);

    // Check if user is context member
    const membership = await isContextMember(project.context_id, userId);
    if (!membership) {
      return res.status(403).json({
        success: false,
        error: "You do not have access to this project",
      });
    }

    const posts = await getPostsByProject(projectId);

    res.json({
      success: true,
      data: { posts },
    });
  } catch (error) {
    console.error("Get project posts error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get posts",
    });
  }
};

// Get single post
export const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const post = await getPostById(id);

    // Check if user is context member
    const membership = await isContextMember(post.projects.context_id, userId);
    if (!membership) {
      return res.status(403).json({
        success: false,
        error: "You do not have access to this post",
      });
    }

    res.json({
      success: true,
      data: { post },
    });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get post",
    });
  }
};

// Update post
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, publish_date, publish_time_slot, specific_time } = req.body;
    const userId = req.userId;

    const post = await getPostById(id);

    // Check permissions: creator can edit pending posts, admin can edit any post
    const isCreator = post.created_by === userId;
    const isAdmin = await isContextAdmin(post.projects.context_id, userId);
    const isPending = post.status === "pending";

    if (!isAdmin && (!isCreator || !isPending)) {
      return res.status(403).json({
        success: false,
        error:
          "You can only edit your own pending posts. Admins can edit any post.",
      });
    }

    const updates = {};

    if (title) {
      if (!isValidPostTitle(title)) {
        return res.status(400).json({
          success: false,
          error: "Post title must be between 3 and 200 characters",
        });
      }
      updates.title = title;
    }

    if (publish_date) {
      if (!isFutureDate(publish_date)) {
        return res.status(400).json({
          success: false,
          error: "Publish date cannot be in the past",
        });
      }
      if (!isWithin60Days(publish_date)) {
        return res.status(400).json({
          success: false,
          error: "Publish date cannot be more than 60 days in the future",
        });
      }
      updates.publish_date = publish_date;
    }

    if (publish_time_slot !== undefined)
      updates.publish_time_slot = publish_time_slot;
    if (specific_time !== undefined) updates.specific_time = specific_time;
    updates.updated_at = new Date().toISOString();

    const updatedPost = await updatePost(id, updates);

    res.json({
      success: true,
      data: { post: updatedPost },
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update post",
    });
  }
};

// Delete post
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const post = await getPostById(id);

    // Check permissions: creator can delete pending posts, admin can delete any post
    const isCreator = post.created_by === userId;
    const isAdmin = await isContextAdmin(post.projects.context_id, userId);
    const isPending = post.status === "pending";

    if (!isAdmin && (!isCreator || !isPending)) {
      return res.status(403).json({
        success: false,
        error:
          "You can only delete your own pending posts. Admins can delete any post.",
      });
    }

    await deletePost(id);

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete post",
    });
  }
};

// Approve post (admin only)
export const approve = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const post = await getPostById(id);

    // Check if user is admin
    const isAdmin = await isContextAdmin(post.projects.context_id, userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Only admins can approve posts",
      });
    }

    if (post.status === "approved") {
      return res.status(400).json({
        success: false,
        error: "Post is already approved",
      });
    }

    const approvedPost = await approvePost(id, userId);

    res.json({
      success: true,
      data: { post: approvedPost },
    });
  } catch (error) {
    console.error("Approve post error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to approve post",
    });
  }
};
